import prisma from './prisma';
import readingTime from 'reading-time';
import { unstable_cache } from 'next/cache';

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

async function _getPublishedPosts(params: {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ posts: PostWithReadingTime[]; total: number; pages: number }> {
  const { tag, search, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  // Search logic using PostgreSQL Full-Text Search with ranking
  if (search) {
    const formattedSearch = search.trim().split(/\s+/).join(' & ');
    
    const posts: any[] = await prisma.$queryRaw`
      SELECT 
        p.*,
        ts_rank(
          to_tsvector('english', p.title || ' ' || p.content), 
          to_tsquery('english', ${formattedSearch})
        ) as rank
      FROM "Post" p
      LEFT JOIN "_PostToTag" pt ON p.id = pt."A"
      LEFT JOIN "Tag" t ON pt."B" = t.id
      WHERE 
        p."published" = true AND p."deletedAt" IS NULL
        AND (
          to_tsvector('english', p.title || ' ' || p.content) @@ to_tsquery('english', ${formattedSearch})
          OR t.name ILIKE ${'%' + search + '%'}
        )
      GROUP BY p.id
      ORDER BY rank DESC, p."createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT p.id) as count
      FROM "Post" p
      LEFT JOIN "_PostToTag" pt ON p.id = pt."A"
      LEFT JOIN "Tag" t ON pt."B" = t.id
      WHERE 
        p."published" = true AND p."deletedAt" IS NULL
        AND (
          to_tsvector('english', p.title || ' ' || p.content) @@ to_tsquery('english', ${formattedSearch})
          OR t.name ILIKE ${'%' + search + '%'}
        )
    `;
    
    const total = Number(countResult[0]?.count || 0);

    return {
      posts: posts.map((post) => ({
        ...post,
        readingTime: readingTime(post.content).text,
      })),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // Fallback to standard Prisma query
  const where: any = {
    published: true,
    deletedAt: null,
  };

  if (tag) {
    where.tags = {
      some: {
        slug: tag,
      },
    };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { pinnedOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        tags: true,
        author: {
          select: { name: true, image: true },
        },
      },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      readingTime: readingTime(post.content).text,
    })),
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Hydrates a post object by converting string dates back to Date objects.
 * This is necessary because unstable_cache serializes data to JSON.
 */
function hydratePost(post: any): PostWithReadingTime {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}

export const getPublishedPosts = async (params: {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const data = await unstable_cache(
    async () => _getPublishedPosts(params),
    ['published-posts', JSON.stringify(params)],
    { tags: [BLOG_CACHE_TAGS.posts], revalidate: 3600 }
  )();

  return {
    ...data,
    posts: data.posts.map(hydratePost),
  };
};

async function _getPostBySlug(slug: string): Promise<PostWithReadingTime | null> {
  const post = await prisma.post.findUnique({
    where: { slug, deletedAt: null },
    include: {
      tags: true,
      series: {
        include: {
          posts: {
            where: { published: true, deletedAt: null },
            orderBy: { order: 'asc' },
            select: { id: true, title: true, slug: true }
          }
        }
      },
      author: {
        select: { name: true, image: true },
      },
    },
  });

  if (!post || !post.published) return null;

  return {
    ...post,
    readingTime: readingTime(post.content).text,
  };
}

export const getPostBySlug = async (slug: string) => {
  const post = await unstable_cache(
    () => _getPostBySlug(slug),
    ['post-by-slug', slug],
    { tags: [BLOG_CACHE_TAGS.posts, BLOG_CACHE_TAGS.post(slug)], revalidate: 3600 }
  )();

  return post ? hydratePost(post) : null;
};

async function _getAllTags(): Promise<TagWithCount[]> {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: { where: { published: true, deletedAt: null } } },
      },
    },
  });
}

export const getAllTags = unstable_cache(
  _getAllTags,
  ['all-tags'],
  { tags: [BLOG_CACHE_TAGS.tags, BLOG_CACHE_TAGS.posts], revalidate: 3600 }
);
