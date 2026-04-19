import { getPublishedPosts, getAllTags } from '@/lib/blog';
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
  const { tag, q, page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);
  
  const { posts, pages } = await getPublishedPosts({
    tag,
    search: q,
    page,
    limit: 10,
  });

  const tags = await getAllTags();

  return <BlogListClient posts={posts} pages={pages} currentPage={page} tags={tags} />;
}
