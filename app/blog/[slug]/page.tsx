import { Typography, Box, Stack, Button } from '@mui/material';
import { getPostBySlug } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense, ViewTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { tokens } from '@/lib/theme-tokens';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PostArticleContent from '@/components/blog/PostArticleContent';
import ArticleBodySkeleton from '@/components/blog/ArticleBodySkeleton';
import PostDetailShell from '@/components/blog/PostDetailShell';
import { getPostViewTransitionNames } from '@/lib/post-view-transition';

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Phan Cuong Blog`,
    description: post.excerpt || 'Technical article by Phan Cuong',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: new Date(post.createdAt).toISOString(),
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const transitionNames = getPostViewTransitionNames(post.slug);
  const primaryTag = post.tags[0] ?? { name: 'general', slug: 'general' };

  return (
    <PostDetailShell>
        <Box sx={{ mb: 5 }}>
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
              Back to Home
            </Button>
          </Link>
        </Box>

        <Box component="header" sx={{ mb: 5 }}>
          <ViewTransition name={transitionNames.title} share="post-header-shared">
            <Typography
              variant="h4"
              className="title-text"
              sx={{
                fontWeight: 850,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: 'text.primary',
                textTransform: 'uppercase',
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                mb: 2,
              }}
            >
              {post.title}
            </Typography>
          </ViewTransition>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={`/blog?tag=${primaryTag.slug}`} style={{ textDecoration: 'none' }}>
              <ViewTransition name={transitionNames.tag} share="post-header-shared">
                <Typography
                  variant="caption"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 800,
                    textTransform: 'lowercase',
                    letterSpacing: '0.05em',
                    transition: 'opacity 0.2s ease',
                    '&:hover': {
                      opacity: 0.8,
                      textDecoration: 'underline',
                    },
                  }}
                >
                  #{primaryTag.name}
                </Typography>
              </ViewTransition>
            </Link>

            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />

            <ViewTransition name={transitionNames.publishedAt} share="post-header-shared">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
              </Typography>
            </ViewTransition>

            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />

            <ViewTransition name={transitionNames.readingTime} share="post-header-shared">
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <AccessTimeIcon sx={{ fontSize: '0.8rem', opacity: 0.7 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {post.readingTime}
                </Typography>
              </Stack>
            </ViewTransition>
          </Stack>
        </Box>

        <Box component="article">
          <Suspense
            fallback={
              <ViewTransition name={`post-${post.slug}-body`} exit="post-body-exit">
                <ArticleBodySkeleton />
              </ViewTransition>
            }
          >
            <ViewTransition name={`post-${post.slug}-body`} enter="post-body-enter" default="none">
              <PostArticleContent content={post.content} />
            </ViewTransition>
          </Suspense>
        </Box>
    </PostDetailShell>
  );
}
