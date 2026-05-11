'use client';

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ViewTransition } from 'react';
import { format } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { tokens } from '@/lib/theme-tokens';
import { getPostViewTransitionNames } from '@/lib/post-view-transition';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    isPinned: boolean;
    createdAt: Date | string;
    readingTime: string;
    tags: Array<{ name: string; slug: string }>;
    thumbnailUrl?: string | null;
    published?: boolean;
  };
  featured?: boolean;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
}

export default function PostCard({ post, featured, isAdmin, onDelete, onPin }: PostCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const transitionNames = getPostViewTransitionNames(post.slug, post.isPinned);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: featured ? 'row' : 'column' },
          overflow: 'hidden',
          bgcolor: 'background.paper',
          position: 'relative',
          borderRadius: `${tokens.radius.md}px`,
          border: '1px solid',
          borderColor: (t) => t.palette.outlineVariant,
          boxShadow: 'none',
          transition: `border-color ${tokens.duration.short3}ms ${tokens.transitions.standard}, transform ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
          '&:hover': {
            borderColor: 'text.primary',
            transform: 'translateY(-2px)',
            '& .card-image': { transform: 'scale(1.02)' },
            '& .admin-actions': { opacity: 1 },
          },
          '&:focus-within': {
            borderColor: 'text.primary',
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
        {isAdmin && (
          <Paper
            className="admin-actions"
            elevation={0}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 10,
              display: 'flex',
              gap: 0.25,
              p: 0.25,
              borderRadius: `${tokens.radius.sm}px`,
              bgcolor: (t) => t.palette.surfaceContainerHigh,
              border: '1px solid',
              borderColor: (t) => t.palette.outlineVariant,
              opacity: 0,
              transition: `opacity ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
            }}
          >
            <Tooltip title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}>
              <IconButton
                aria-label={post.isPinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPin?.(post.id);
                }}
                sx={{
                  color: post.isPinned ? 'text.primary' : 'text.secondary',
                  '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
                }}
              >
                <PushPinIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <IconButton
                aria-label="Chỉnh sửa bài viết"
                size="small"
                component={Link}
                href={`/admin/posts/edit/${post.id}`}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa bài viết">
              <IconButton
                aria-label="Xóa bài viết"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(post.id);
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main', bgcolor: 'transparent' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        )}

        <CardActionArea
          component={Link}
          href={`/blog/${post.slug}`}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: featured ? 'row' : 'column' },
            alignItems: 'stretch',
            height: '100%',
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: featured ? '55%' : '100%' },
              aspectRatio: featured ? { xs: '16/9', md: 'auto' } : '16/9',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
              minHeight: featured ? { md: 320 } : 'auto',
              bgcolor: (t) => t.palette.surfaceContainerHigh,
            }}
          >
            {post.thumbnailUrl && (
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                priority={featured}
                loading={featured ? 'eager' : 'lazy'}
                sizes={featured ? '(max-width: 800px) 100vw, 440px' : '(max-width: 800px) 100vw, 800px'}
                style={{
                  objectFit: 'cover',
                  transition: `transform ${tokens.duration.medium2}ms ${tokens.transitions.standard}`,
                }}
                className="card-image"
              />
            )}
            {!post.thumbnailUrl && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: (t) => alpha(t.palette.onSurface ?? t.palette.text.primary, 0.18),
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.05em',
                  userSelect: 'none',
                }}
              >
                {(post.title || '').trim().charAt(0).toUpperCase() || '#'}
              </Box>
            )}

            {featured && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  bgcolor: (t) => t.palette.secondaryContainer,
                  color: (t) => t.palette.onSecondaryContainer,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: `${tokens.radius.full}px`,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: tokens.typography.tracking.micro,
                  textTransform: 'uppercase',
                  zIndex: 2,
                }}
              >
                Nổi bật
              </Box>
            )}
          </Box>

          <CardContent
            sx={{
              p: { xs: 3, md: featured ? 5 : 4 },
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ mb: 1.5 }}>
              {post.tags.slice(0, 2).map((tag) => (
                <Typography
                  key={tag.slug}
                  variant="caption"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(`/?tag=${tag.slug}`);
                  }}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: tokens.typography.tracking.micro,
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  #{tag.name}
                </Typography>
              ))}
            </Stack>

            <ViewTransition name={transitionNames.title} share="post-title-shared">
              <Typography
                variant={featured ? 'h3' : 'h5'}
                component="h2"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.25,
                  mb: 1.5,
                  color: 'text.primary',
                  letterSpacing: '-0.015em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isAdmin && post.published === false && (
                    <HistoryEduIcon
                      sx={{
                        fontSize: featured ? '1.6rem' : '1.25rem',
                        color: 'text.secondary',
                      }}
                    />
                  )}
                  {post.title}
                </Box>
              </Typography>
            </ViewTransition>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                display: '-webkit-box',
                WebkitLineClamp: featured ? 3 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.6,
                fontSize: '0.95rem',
              }}
            >
              {post.excerpt}
            </Typography>

            <Box
              sx={{
                mt: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'text.secondary',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {format(new Date(post.createdAt), 'dd/MM/yyyy')}
              </Typography>
              <Box
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  bgcolor: 'currentColor',
                  opacity: 0.5,
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: '0.85rem' }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {post.readingTime}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
