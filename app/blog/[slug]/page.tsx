import { Box, Button, alpha } from '@mui/material';
import { getPostBySlug, getPostMetaBySlug } from '@/lib/blog';
import { PostsDB } from '@/lib/storage';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Suspense, ViewTransition } from 'react';
import { tokens } from '@/lib/theme-tokens';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PostArticleContent from '@/components/blog/PostArticleContent';
import ArticleBodySkeleton from '@/components/blog/ArticleBodySkeleton';
import PostDetailShell from '@/components/blog/PostDetailShell';
import CommentSection from '@/components/blog/CommentSection';
import { getPostViewTransitionNames } from '@/lib/post-view-transition';
import PostHeader from '@/components/blog/PostHeader';
import ReadingProgressBar from '@/components/common/ReadingProgressBar';
import ScrollToTop from '@/components/common/ScrollToTop';

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostMetaBySlug(slug);

  if (!post) return { title: 'Không tìm thấy bài viết' };

  const canonicalPath = `/blog/${post.slug}`;
  const ogImage = post.thumbnailUrl || undefined;

  return {
    title: `${post.title} | phancuong.com`,
    description: post.excerpt || 'Technical article and exploration.',
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      url: canonicalPath,
      publishedTime: new Date(post.createdAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.excerpt || '',
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;

  return (
    <PostDetailShell>
        <Suspense fallback={null}>
          <ArticleSchema slug={slug} />
        </Suspense>
        <ReadingProgressBar />
        <ScrollToTop />
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" transitionTypes={['nav-back']} style={{ textDecoration: 'none' }}>
            <Button
              startIcon={<ArrowBackRoundedIcon sx={{ fontSize: '1.2rem', transition: 'transform 0.2s' }} />}
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: tokens.typography.fontFamily.serif,
                p: 0,
                minWidth: 0,
                textTransform: 'none',
                opacity: 0.75,
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'transparent',
                  opacity: 1,
                  '& .MuiButton-startIcon': {
                    transform: 'translateX(-4px)',
                  },
                },
              }}
            >
              Về trang chủ
            </Button>
          </Link>

          <Suspense fallback={null}>
            <EditButtonLoader slug={slug} />
          </Suspense>
        </Box>

        {/* Granular Suspense for Header (Title rising up) */}
        <Suspense fallback={<Box sx={{ height: 100, opacity: 0 }} />}>
          <HeaderLoader slug={slug} />
        </Suspense>

        <Box component="article">
          {/* Granular Suspense for Body (Skeleton) */}
          <Suspense
            fallback={
              <ViewTransition name={`post-${slug}-body`} exit="post-body-exit">
                <ArticleBodySkeleton />
              </ViewTransition>
            }
          >
            <ArticleBodyLoader slug={slug} />
          </Suspense>
        </Box>

        <CommentSection postSlug={slug} />
    </PostDetailShell>
  );
}

// JSON-LD BlogPosting schema for rich results. Reuses the cached meta fetch
// (`getPostMetaBySlug` is wrapped in React `cache()`), so no extra DB hit.
async function ArticleSchema({ slug }: { slug: string }) {
  const post = await getPostMetaBySlug(slug);
  if (!post) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com';
  const url = `${siteUrl}/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.thumbnailUrl || undefined,
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.name || 'phancuong.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'phancuong.com',
      url: siteUrl,
    },
    keywords: post.tags?.map((t) => t.name).join(', ') || undefined,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Independent Metadata/Header Loader
async function HeaderLoader({ slug }: { slug: string }) {
  const postMeta = await getPostMetaBySlug(slug);
  if (!postMeta) notFound();

  const transitionNames = getPostViewTransitionNames(postMeta.slug);
  return <PostHeader post={postMeta} transitionNames={transitionNames} />;
}

// Independent Article Content Loader
async function ArticleBodyLoader({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);
  if (!post) return null;

  return (
    <ViewTransition name={`post-${post.slug}-body`} enter="post-body-enter" exit="post-body-exit" default="none">
      <PostArticleContent content={post.content} />
    </ViewTransition>
  );
}

// Independent Edit Button Loader
async function EditButtonLoader({ slug }: { slug: string }) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === process.env.ALLOWED_EMAIL;

  if (!isAdmin) return null;

  const post = await PostsDB.getBySlug(slug);
  if (!post) return null;

  return (
    <Link href={`/admin/posts/edit/${post.id}`} style={{ textDecoration: 'none' }}>
      <Button
        variant="outlined"
        startIcon={<EditRoundedIcon sx={{ fontSize: '1.2rem' }} />}
        sx={{
          color: 'primary.main',
          borderColor: alpha(tokens.color.primary, 0.2),
          fontWeight: 700,
          fontSize: '0.85rem',
          textTransform: 'none',
          borderRadius: '8px',
          px: 3,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: alpha(tokens.color.primary, 0.05),
          },
        }}
      >
        Sửa bài viết
      </Button>
    </Link>
  );
}

