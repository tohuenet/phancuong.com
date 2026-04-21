'use client';

import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CardActionArea, 
  alpha, 
  useTheme, 
  Stack, 
  IconButton,
  Tooltip,
  Paper
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
  const transitionNames = getPostViewTransitionNames(post.slug);
  const primaryTag = post.tags[0];

  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        transition: `transform ${tokens.duration.medium4}ms ${tokens.transitions.emphasizedDecelerate}`,
        '&:hover': { transform: 'translateY(-8px)' },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <Card
        className="glass"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: featured ? 'row' : 'column' },
          overflow: 'hidden',
          bgcolor: 'transparent',
          position: 'relative',
          // Override the global `.glass` radius (28px / xl) with a tighter,
          // more angular corner to match the grid-card aesthetic.
          borderRadius: `${tokens.radius.md}px`,
          '&:hover': {
            borderColor: 'primary.main',
            '& .card-image': { transform: 'scale(1.05)' },
            '& .admin-actions': { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        {/* Admin Actions Overlay */}
        {isAdmin && (
          <Paper
            elevation={4}
            className="admin-actions"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              display: 'flex',
              gap: 1,
              p: 0.5,
              borderRadius: tokens.radius.full,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              opacity: 0,
              transform: 'translateY(-10px)',
              transition: 'all 0.3s ease',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Tooltip title={post.isPinned ? "Bỏ ghim" : "Ghim bài viết"}>
              <IconButton
                aria-label={post.isPinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPin?.(post.id);
                }}
                sx={{
                  color: post.isPinned ? 'primary.main' : 'inherit',
                  '& svg': {
                    transform: post.isPinned ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover': { color: 'primary.main' }
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
                sx={{ '&:hover': { color: 'primary.main' } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa bài viết">
              <IconButton
                aria-label="Xóa bài viết"
                size="small"
                color="error"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(post.id);
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
            height: '100%'
          }}
        >
          {/* Thumbnail Container */}
          <Box sx={{
            width: { xs: '100%', md: featured ? '55%' : '100%' },
            aspectRatio: featured ? { xs: '16/9', md: 'auto' } : '16/9',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            minHeight: featured ? { md: 320 } : 'auto',
            // Painted placeholder sits behind <Image>; shows when thumbnail
            // is missing so we don't have to ship a 1600px Unsplash fallback.
            background: post.thumbnailUrl
              ? 'transparent'
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.22)} 0%, ${alpha(theme.palette.tertiary, 0.18)} 100%)`,
          }}>
            {post.thumbnailUrl && (
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                priority={featured}
                loading={featured ? 'eager' : 'lazy'}
                sizes={featured ? "(max-width: 800px) 100vw, 440px" : "(max-width: 800px) 100vw, 800px"}
                style={{
                  objectFit: 'cover',
                  transition: `transform 0.8s ${tokens.transitions.standard}`,
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
                  color: alpha(theme.palette.primary.main, 0.5),
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  userSelect: 'none',
                }}
              >
                {(post.title || '').trim().charAt(0).toUpperCase() || '#'}
              </Box>
            )}
            
            {/* Draft Badge */}
            {featured && (
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                bgcolor: 'primary.main', 
                color: 'white', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: tokens.radius.xs,
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'top 0.3s ease'
              }}>
                Nổi bật
              </Box>
            )}

          </Box>

          <CardContent sx={{ 
            p: { xs: 3, md: featured ? 5 : 4 },
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {post.tags.slice(0, 2).map((tag) => (
                <Typography
                  key={tag.slug}
                  variant="caption"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(`/blog?tag=${tag.slug}`);
                  }}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                    '&:hover': {
                      opacity: 0.8,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  #{tag.name}
                </Typography>
              ))}
            </Stack>

            <ViewTransition name={transitionNames.title} share="post-title-shared">
              <Typography
                variant={featured ? "h3" : "h5"}
                component="h2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 2,
                  color: 'text.primary',
                  letterSpacing: '-0.02em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isAdmin && post.published === false && (
                    <HistoryEduIcon sx={{ fontSize: featured ? '1.8rem' : '1.4rem', color: 'warning.main' }} />
                  )}
                  {post.title}
                </Box>
              </Typography>
            </ViewTransition>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                display: '-webkit-box',
                WebkitLineClamp: featured ? 3 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.6,
                fontSize: '1rem',
                opacity: 0.8
              }}
            >
              {post.excerpt}
            </Typography>

            <Box sx={{
              mt: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              opacity: 0.6,
            }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {format(new Date(post.createdAt), 'dd/MM/yyyy')}
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
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
