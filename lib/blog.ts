import { PostsDB, SeriesDB } from './storage';
import readingTime from 'reading-time';
import { revalidateTag } from 'next/cache';
import { cache } from 'react';

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

export async function getPublishedPosts(params: {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ posts: PostWithReadingTime[]; total: number; pages: number }> {
  const { tag, search, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  let allPosts = await PostsDB.getAll();
  
  // Filter published and non-deleted
  allPosts = allPosts.filter(p => p.published && !p.deletedAt);

  // Tag filter
  if (tag) {
    if (tag === 'general') {
      allPosts = allPosts.filter(p => !p.tags || p.tags.length === 0 || p.tags.some((t: any) => t.slug === 'general'));
    } else {
      allPosts = allPosts.filter(p => p.tags?.some((t: any) => t.slug === tag));
    }
  }

  // Search filter
  if (search) {
    const s = search.toLowerCase();
    allPosts = allPosts.filter(p => 
      p.title.toLowerCase().includes(s) || 
      p.content.toLowerCase().includes(s) ||
      p.tags?.some((t: any) => t.name.toLowerCase().includes(s))
    );
  }

  // Sort
  allPosts.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isPinned && a.pinnedOrder !== b.pinnedOrder) return a.pinnedOrder - b.pinnedOrder;
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

export const getPostBySlug = cache(async (slug: string): Promise<PostWithReadingTime | null> => {
  const post = await PostsDB.getBySlug(slug);
  if (!post || !post.published || post.deletedAt) return null;

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

  return {
    ...post,
    series,
    readingTime: readingTimeVi(post.content),
  };
});

export const getPostMetaBySlug = cache(async (slug: string): Promise<Omit<PostWithReadingTime, 'content'> | null> => {
  const post = await PostsDB.getBySlug(slug);
  if (!post || !post.published || post.deletedAt) return null;

  const { content, ...meta } = post;
  return {
    ...meta,
    readingTime: readingTimeVi(content || ''),
  } as any;
});

export async function getAllTags(): Promise<TagWithCount[]> {
  const allPosts = await PostsDB.getAll();
  const publishedPosts = allPosts.filter(p => p.published && !p.deletedAt);
  
  const tagMap = new Map<string, TagWithCount>();
  let untaggedCount = 0;

  publishedPosts.forEach(post => {
    if (!post.tags || post.tags.length === 0) {
      untaggedCount++;
      return;
    }

    post.tags?.forEach((tag: any) => {
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

  // If there are untagged posts, add or merge into the virtual 'general' tag
  if (untaggedCount > 0) {
    const existingGeneral = tagMap.get('general');
    if (existingGeneral) {
      existingGeneral._count.posts += untaggedCount;
    } else {
      tagMap.set('general', {
        id: 'virtual-general',
        name: 'general',
        slug: 'general',
        _count: { posts: untaggedCount }
      });
    }
  }

  return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
