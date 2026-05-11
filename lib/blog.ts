import { PostsDB, SeriesDB, type BlogPost, type BlogTag } from './storage';
import readingTime from 'reading-time';
import { cache } from 'react';
import { extractHeadings, type TocEntry } from './toc';

// Lowercase search index keyed by post id. Built lazily and reused across
// requests as long as PostsDB.getAll() returns the same cached array. When
// a post is created/edited/deleted, storage invalidates its cache → getAll
// returns a *new* array reference → we detect the swap and rebuild.
//
// Why this exists: every keystroke in the search box re-ran
// `post.content.toLowerCase()` on every post. Content can be 50-200KB
// of HTML per post, so per-keystroke lowercasing was the dominant cost
// once the archive grew past ~30 posts. Doing it once amortizes to ~free.
let searchIndexSource: BlogPost[] | null = null;
const searchIndex = new Map<string, { title: string; content: string; tags: string }>();

function getSearchIndex(posts: BlogPost[]): typeof searchIndex {
  if (searchIndexSource === posts) return searchIndex;
  searchIndex.clear();
  for (const p of posts) {
    searchIndex.set(p.id, {
      title: (p.title || '').toLowerCase(),
      content: (p.content || '').toLowerCase(),
      tags: (p.tags || []).map((t) => (t.name || '').toLowerCase()).join('\n'),
    });
  }
  searchIndexSource = posts;
  return searchIndex;
}

function readingTimeVi(content: string): string {
  const minutes = Math.max(1, Math.round(readingTime(content || '').minutes));
  return `${minutes} phút đọc`;
}

export const BLOG_CACHE_TAGS = {
  posts: 'posts',
  tags: 'tags',
  post: (slug: string) => `post:${slug}`,
};

export interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

export interface PostWithReadingTime {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  order: number;
  isPinned: boolean;
  pinnedOrder: number;
  readingTime: string;
  headings?: TocEntry[];
  tags: Array<{ id: string; name: string; slug: string }>;
  author?: {
    name: string | null;
    image: string | null;
  } | null;
  series?: {
    id: string;
    title: string;
    posts: Array<{ id: string; title: string; slug: string }>;
  } | null;
}

/**
 * Returns `slug` if it's free, otherwise appends `-2`, `-3`, ... until it is.
 * `excludeId` lets edit flows ignore the post's own current slug.
 * Soft-deleted posts don't reserve their slug — same-slug reuse is fine.
 */
export async function ensureUniquePostSlug(slug: string, excludeId?: string): Promise<string> {
  if (!slug) return slug;
  const all = await PostsDB.getAll();
  const taken = new Set(
    all
      .filter(p => !p.deletedAt && p.id !== excludeId)
      .map(p => p.slug)
  );
  if (!taken.has(slug)) return slug;
  let n = 2;
  while (taken.has(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

export async function getPublishedPosts(params: {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
  isAdmin?: boolean;
}): Promise<{ posts: PostWithReadingTime[]; total: number; pages: number }> {
  const { tag, search, page = 1, limit = 10, isAdmin = false } = params;
  const skip = (page - 1) * limit;

  const sourcePosts = await PostsDB.getAll();
  let allPosts = sourcePosts;

  // Filter published and non-deleted
  // If admin, show all (except soft-deleted). If not, show only published.
  allPosts = allPosts.filter(p => (isAdmin || p.published) && !p.deletedAt);

  // Tag filter — 'all' is treated as no filter (matches the #all chip in the UI)
  if (tag && tag !== 'all') {
    if (tag === 'draft') {
      allPosts = allPosts.filter(p => !p.published);
    } else {
      allPosts = allPosts.filter(p => p.tags?.some(t => t.slug === tag));
    }
  }

  // Search filter — uses pre-lowercased index built off the source array.
  // Avoids re-lowercasing 50-200KB of post HTML per keystroke.
  if (search) {
    const s = search.toLowerCase();
    const index = getSearchIndex(sourcePosts);
    allPosts = allPosts.filter((p) => {
      const entry = index.get(p.id);
      if (!entry) return false;
      return entry.title.includes(s) || entry.content.includes(s) || entry.tags.includes(s);
    });
  }

  // Sort. Coerce isPinned/pinnedOrder defensively — older or API-created posts may be missing
  // these fields, and a mix of `false` and `undefined` makes the raw `!==` comparator non-transitive.
  allPosts.sort((a, b) => {
    const aPinned = !!a.isPinned;
    const bPinned = !!b.isPinned;
    // 1. Pinned posts stay on top
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    if (aPinned) {
      const ao = a.pinnedOrder ?? 0;
      const bo = b.pinnedOrder ?? 0;
      if (ao !== bo) return ao - bo;
    }

    // 2. Chronological for the rest (drafts intermix with published by date)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = allPosts.length;
  const paginatedPosts = allPosts.slice(skip, skip + limit);

  return {
    posts: paginatedPosts.map(post => ({
      ...post,
      readingTime: readingTimeVi(post.content),
    })),
    total,
    pages: Math.ceil(total / limit),
  };
}

export const getPostBySlug = cache(async (slug: string, isAdmin = false): Promise<PostWithReadingTime | null> => {
  const post = await PostsDB.getBySlug(slug);
  if (!post || (!isAdmin && !post.published) || post.deletedAt) return null;

  // Hydrate series if needed
  let series = null;
  if (post.seriesId) {
    const s = await SeriesDB.getById(post.seriesId);
    if (s) {
      const allPosts = await PostsDB.getAll();
      series = {
        ...s,
        posts: allPosts
          .filter(p => p.seriesId === s.id && p.published && !p.deletedAt)
          .sort((a, b) => a.order - b.order)
          .map(p => ({ id: p.id, title: p.title, slug: p.slug }))
      };
    }
  }

  // Inject anchor IDs onto H2/H3 and collect them for the table of contents.
  // Only meaningful for HTML posts; MDX content yields an empty ToC and the
  // returned `html` is unchanged.
  const { html, headings } = extractHeadings(post.content || '');

  return {
    ...post,
    content: html,
    headings,
    series,
    readingTime: readingTimeVi(post.content),
  };
});

/**
 * Returns up to `limit` related posts, scored by tag overlap (descending),
 * then recency. Excludes the current slug. When the current post has no
 * tags (or no overlapping posts), falls back to plain recency.
 */
export const getRelatedPosts = cache(async (slug: string, limit = 3): Promise<PostWithReadingTime[]> => {
  const all = await PostsDB.getAll();
  const current = all.find((p) => p.slug === slug);
  const candidates = all.filter((p) => p.published && !p.deletedAt && p.slug !== slug);

  const currentTagSlugs = new Set((current?.tags || []).map((t) => t.slug));
  const scored = candidates.map((p) => ({
    p,
    score: (p.tags || []).reduce((n, t) => n + (currentTagSlugs.has(t.slug) ? 1 : 0), 0),
  }));

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return new Date(b.p.createdAt).getTime() - new Date(a.p.createdAt).getTime();
  });

  return scored.slice(0, limit).map(({ p }) => ({
    ...p,
    series: null,
    readingTime: readingTimeVi(p.content),
  })) as PostWithReadingTime[];
});

export const getPostMetaBySlug = cache(async (slug: string, isAdmin = false): Promise<Omit<PostWithReadingTime, 'content'> | null> => {
  const post = await PostsDB.getBySlug(slug);
  if (!post || (!isAdmin && !post.published) || post.deletedAt) return null;

  const { content, ...meta } = post;
  return {
    ...meta,
    readingTime: readingTimeVi(content || ''),
  } as Omit<PostWithReadingTime, 'content'>;
});

export async function getAllTags(isAdmin = false): Promise<TagWithCount[]> {
  const allPosts = await PostsDB.getAll();
  const publishedPosts = allPosts.filter(p => p.published && !p.deletedAt);

  const tagMap = new Map<string, TagWithCount>();

  publishedPosts.forEach(post => {
    post.tags?.forEach((tag: BlogTag) => {
      if (!tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          _count: { posts: 0 }
        });
      }
      tagMap.get(tag.slug)!._count.posts++;
    });
  });

  // Admin-only virtual 'draft' tag (derived from published === false)
  if (isAdmin) {
    const draftCount = allPosts.filter(p => !p.published && !p.deletedAt).length;
    if (draftCount > 0) {
      tagMap.set('draft', {
        id: 'virtual-draft',
        name: 'draft',
        slug: 'draft',
        _count: { posts: draftCount }
      });
    }
  }

  return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
