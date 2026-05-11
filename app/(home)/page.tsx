import { getPublishedPosts, getAllTags } from '@/lib/blog';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-config';
import { Metadata } from 'next';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = {
  title: 'Technical Blog & Portfolio',
  description: 'Technical articles, engineering insights, and software development tutorials.',
};

interface HomePageProps {
  searchParams: Promise<{
    tag?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth();
  const admin = isAdmin(session);

  const { tag, q, page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);

  const { posts, pages } = await getPublishedPosts({
    tag,
    search: q,
    page,
    limit: 10,
    isAdmin: admin,
  });

  const tags = await getAllTags(admin);

  return <BlogListClient posts={posts} pages={pages} currentPage={page} tags={tags} />;
}
