'use client';

import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { tokens } from '@/lib/theme-tokens';
import type { PostWithReadingTime } from '@/lib/blog';

interface RelatedPostsProps {
  posts: PostWithReadingTime[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <Box component="section" aria-labelledby="related-posts-heading" sx={{ mt: 10 }}>
      <Stack
        direction="row"
        sx={{
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          id="related-posts-heading"
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.015em',
            fontSize: 'clamp(1.15rem, 2vw, 1.4rem)',
            color: 'text.primary',
          }}
        >
          Bài viết liên quan
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.micro,
            fontSize: '0.7rem',
          }}
        >
          {posts.length} {posts.length > 1 ? 'bài đọc tiếp' : 'bài đọc tiếp'}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: `repeat(${Math.min(posts.length, 3)}, 1fr)`,
          },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        {posts.map((p) => (
          <RelatedCard key={p.id} post={p} />
        ))}
      </Box>
    </Box>
  );
}

function RelatedCard({ post }: { post: PostWithReadingTime }) {
  const theme = useTheme();
  const primaryTag = post.tags[0];

  return (
    <Box
      component={Link}
      href={`/blog/${post.slug}`}
      prefetch={true}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: `${tokens.radius.md}px`,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: (t) => t.palette.outlineVariant,
        transition: `border-color ${tokens.duration.short3}ms ${tokens.transitions.standard}, transform ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
        '&:hover': {
          borderColor: 'text.primary',
          transform: 'translateY(-2px)',
          '& .related-thumb': { transform: 'scale(1.02)' },
          '& .related-title': { color: 'text.primary' },
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'text.primary',
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          bgcolor: (t) => t.palette.surfaceContainerHigh,
        }}
      >
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            loading="lazy"
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 360px"
            className="related-thumb"
            style={{
              objectFit: 'cover',
              transition: `transform ${tokens.duration.medium2}ms ${tokens.transitions.standard}`,
            }}
          />
        ) : (
          <PlaceholderArt title={post.title} tag={primaryTag?.name} />
        )}

        {primaryTag && post.thumbnailUrl && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              px: 1.25,
              py: 0.4,
              borderRadius: `${tokens.radius.full}px`,
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: tokens.typography.tracking.micro,
              textTransform: 'uppercase',
              color: (t) => t.palette.onSecondaryContainer,
              bgcolor: (t) => t.palette.secondaryContainer,
            }}
          >
            #{primaryTag.name}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: 1.25,
        }}
      >
        <Typography
          component="h3"
          className="related-title"
          sx={{
            fontWeight: 600,
            fontSize: 'clamp(1rem, 1.5vw, 1.1rem)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            color: 'text.primary',
            transition: 'color 0.15s ease',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            hyphens: 'auto',
          }}
        >
          {post.title}
        </Typography>

        {post.excerpt && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.55,
              fontSize: '0.85rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.excerpt}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            mt: 'auto',
            pt: 1.25,
            color: 'text.secondary',
            borderTop: '1px solid',
            borderColor: (t) => t.palette.outlineVariant,
            alignItems: 'center',
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <CalendarMonthIcon sx={{ fontSize: '0.85rem', opacity: 0.7 }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 500, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
            >
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: vi,
              }).replace(/^khoảng\s/, '')}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              bgcolor: 'currentColor',
              opacity: 0.4,
            }}
          />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: '0.85rem', opacity: 0.7 }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 500, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
            >
              {post.readingTime}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function PlaceholderArt({ title, tag }: { title: string; tag?: string }) {
  const theme = useTheme();
  const glyph = (title || '').trim().charAt(0).toUpperCase() || '#';

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0 }}>
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: tokens.typography.fontFamily.mono,
          fontSize: 'clamp(3rem, 8vw, 4.5rem)',
          fontWeight: 600,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: (t) => alpha(t.palette.onSurface ?? t.palette.text.primary, 0.18),
          userSelect: 'none',
        }}
      >
        {glyph}
      </Typography>

      {tag && (
        <Typography
          component="span"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            px: 1.25,
            py: 0.4,
            borderRadius: `${tokens.radius.full}px`,
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: tokens.typography.tracking.micro,
            textTransform: 'uppercase',
            color: theme.palette.onSecondaryContainer,
            bgcolor: theme.palette.secondaryContainer,
          }}
        >
          #{tag}
        </Typography>
      )}
    </Box>
  );
}
