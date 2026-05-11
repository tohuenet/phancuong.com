import { MetadataRoute } from 'next';
import { PostsDB } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com';

  const allPosts = await PostsDB.getAll();
  const posts = allPosts.filter(p => p.published && !p.deletedAt);

  // Home (the blog list lives here now)
  const home = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  };

  // Each post detail
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Tag landing pages. Tags are query params (`/?tag=xxx`), not routes —
  // listing them here so crawlers discover and index per-tag entry points.
  // `lastModified` = newest post in that tag, so Google re-crawls when
  // fresh content lands. Dedupe by slug because the same tag can appear
  // across many posts.
  const tagLatest = new Map<string, { slug: string; updatedAt: Date }>();
  for (const post of posts) {
    for (const tag of post.tags || []) {
      const prev = tagLatest.get(tag.slug);
      const postUpdated = new Date(post.updatedAt);
      if (!prev || postUpdated > prev.updatedAt) {
        tagLatest.set(tag.slug, { slug: tag.slug, updatedAt: postUpdated });
      }
    }
  }
  const tagRoutes = Array.from(tagLatest.values()).map(({ slug, updatedAt }) => ({
    url: `${baseUrl}/?tag=${encodeURIComponent(slug)}`,
    lastModified: updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [home, ...postRoutes, ...tagRoutes];
}
