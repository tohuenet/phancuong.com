import { getPublishedPosts, getAllTags } from '@/lib/blog';
import { Metadata } from 'next';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = {
  title: 'Phan Cuong - Senior Fullstack Engineer',
  description: 'Technical articles, career advice and coding tutorials by Phan Cuong.',
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
  
  const { posts, pages, total } = await getPublishedPosts({
    tag,
    search: q,
    page,
    limit: 10, // Increased limit for home page
  });

  const tags = await getAllTags();

  return <BlogListClient posts={posts} pages={pages} currentPage={page} tags={tags} />;
}
