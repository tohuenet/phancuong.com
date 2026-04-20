import { getPublishedPosts, getAllTags } from '@/lib/blog';
import { auth } from '@/auth';
import { Metadata } from 'next';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Technical articles, career advice and coding tutorials.',
};

interface BlogPageProps {
  searchParams: Promise<{
    tag?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const session = await auth();
  const isAdmin = session?.user?.email === process.env.ALLOWED_EMAIL;
  
  const { tag, q, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const { posts, pages } = await getPublishedPosts({
    tag,
    search: q,
    page,
    limit: 10,
    isAdmin,
  });

  const tags = await getAllTags();

  return <BlogListClient posts={posts} pages={pages} currentPage={page} tags={tags} />;
}
