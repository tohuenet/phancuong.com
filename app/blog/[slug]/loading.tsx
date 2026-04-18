'use client';

import { Box, Stack, Button, Skeleton } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ViewTransition } from 'react';
import { tokens } from '@/lib/theme-tokens';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleBodySkeleton from '@/components/blog/ArticleBodySkeleton';
import PostDetailShell from '@/components/blog/PostDetailShell';
import { getPostViewTransitionNames } from '@/lib/post-view-transition';

/**
 * Segment-level loading UI for /blog/[slug].
 *
 * This file is *required* — without it, Next.js walks up the segment tree and
 * falls back to `app/loading.tsx` (the HomePageSkeleton), which is why the
 * detail route was flashing the homepage skeleton instead of the hoisted
 * header + article-body skeleton the ViewTransition choreography expects.
 *
 * It mirrors the real detail page's frame exactly (back button, hoisted
 * header row, article column) and wraps the shared header slots in
 * `<ViewTransition>` using the *same* names as both `PostListItem` (the
 * originating element on the home list) and `app/blog/[slug]/page.tsx`
 * (the eventual target). That chain lets the browser morph the title,
 * tag, published-at and reading-time smoothly from the list row up into
 * the detail header, while the article body animates in via the
 * `post-body-exit` / `post-body-enter` pair.
 */
export default function PostDetailLoading() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const transitionNames = getPostViewTransitionNames(slug);

  return (
    <PostDetailShell>
      {/* Back button — no transition; matches the real page layout so
          the header below lands at an identical y-offset. */}
      <Box sx={{ mb: 5 }}>
        <Link href="/" transitionTypes={['nav-back']} style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<ArrowBackRoundedIcon sx={{ fontSize: '1.2rem' }} />}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.9rem',
              fontFamily: tokens.typography.fontFamily.serif,
              p: 0,
              minWidth: 0,
              textTransform: 'none',
              opacity: 0.75,
              '&:hover': { color: 'primary.main', bgcolor: 'transparent', opacity: 1 },
            }}
          >
            Back to Home
          </Button>
        </Link>
      </Box>

      {/* Hoisted header — ViewTransition names must match PostListItem
          and the real detail page for the shared-element morph to fire. */}
      <Box component="header" sx={{ mb: 5 }}>
        <ViewTransition name={transitionNames.title} share="post-header-shared">
          <Skeleton
            variant="text"
            height={44}
            sx={{ width: '72%', mb: 2, transform: 'none', borderRadius: 1 }}
          />
        </ViewTransition>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <ViewTransition name={transitionNames.tag} share="post-header-shared">
            <Skeleton variant="text" width={64} height={18} />
          </ViewTransition>

          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />

          <ViewTransition name={transitionNames.publishedAt} share="post-header-shared">
            <Skeleton variant="text" width={96} height={18} />
          </ViewTransition>

          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />

          <ViewTransition name={transitionNames.readingTime} share="post-header-shared">
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <AccessTimeIcon sx={{ fontSize: '0.8rem', opacity: 0.7 }} />
              <Skeleton variant="text" width={56} height={18} />
            </Stack>
          </ViewTransition>
        </Stack>
      </Box>

      {/* Article body — exits via post-body-exit; the real content in
          page.tsx enters via post-body-enter (keyframes in globals.css). */}
      <Box component="article">
        <ViewTransition name={`post-${slug}-body`} exit="post-body-exit">
          <ArticleBodySkeleton />
        </ViewTransition>
      </Box>
    </PostDetailShell>
  );
}
