import { MetadataRoute } from 'next';
import { PostsDB } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com';

  // 1. Fetch all dynamic content from FileStorage
  const allPosts = await PostsDB.getAll();
  const posts = allPosts.filter(p => p.published && !p.deletedAt);

  // 2. Static Routes
  // Only home page is needed as /blog is now home
  const staticRoutes = [''].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // 3. Dynamic Routes
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
