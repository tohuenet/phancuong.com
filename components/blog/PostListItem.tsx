'use client';

import { 
  Typography, 
  Box, 
  alpha, 
  useTheme, 
  Stack, 
  IconButton,
  Tooltip
} from '@mui/material';
import Link from 'next/link';
import type { HTMLAttributes } from 'react';
import { ViewTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getPostViewTransitionNames } from '@/lib/post-view-transition';
import { tokens } from '@/lib/theme-tokens';

interface PostListItemProps {
  post: {
    id: string;
    title: string;
    slug: string;
    createdAt: Date | string;
    readingTime: string;
    tags: Array<{ name: string; slug: string }>;
    isPinned: boolean;
  };
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>; // For framer-motion reorder
}

export default function PostListItem({ post, isAdmin, onDelete, onPin, dragHandleProps }: PostListItemProps) {
  const theme = useTheme();
  const transitionNames = getPostViewTransitionNames(post.slug);
  const primaryTag = post.tags[0] ?? { name: 'general', slug: 'general' };

  return (
      <Box
        sx={{
          py: 2.5,
          px: { xs: 2, md: 3 },
          mb: 2,
          borderRadius: `${tokens.radius.md}px`,
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          containerType: 'inline-size',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.25),
            bgcolor: alpha(theme.palette.background.paper, 0.55),
            '& .action-buttons': { opacity: 1, transform: 'translateX(0)' },
            '& .title-text': { color: 'primary.main' },
            '& .glint': {
              left: '125%',
            }
          }
        }}
      >
        {/* Premium Glint Effect */}
        <Box
          className="glint"
          sx={{
            position: 'absolute',
            top: 0,
            left: '-25%',
            width: '25%',
            height: '100%',
            background: `linear-gradient(to right, transparent, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
            transform: 'skewX(-25deg)',
            transition: 'left 0.7s ease-in-out',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        {/* Drag Handle (Admin only, during reorder) */}
        {isAdmin && post.isPinned && (
          <Box {...dragHandleProps} sx={{ display: { xs: 'none', md: 'block' }, cursor: 'grab', mt: 0.5, color: 'text.secondary', opacity: 0.3, '&:hover': { opacity: 1 } }}>
            <DragIndicatorIcon fontSize="small" />
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }}>
            {/* Title */}
            <Link
              href={`/blog/${post.slug}`}
              prefetch={true}
              transitionTypes={['post-open']}
              style={{ textDecoration: 'none' }}
            >
              <ViewTransition name={transitionNames.title} share="post-title-shared">
                <Typography
                  variant="h4"
                  className="title-text"
                  sx={{
                    fontWeight: 850,
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    color: 'text.primary',
                    textTransform: 'uppercase',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    wordBreak: 'break-word'
                  }}
                >
                  {post.isPinned && (
                    <PushPinIcon sx={{ fontSize: '1.4rem', mr: 1.5, color: 'primary.main', transform: 'rotate(20deg)' }} />
                  )}
                  {post.title}
                </Typography>
              </ViewTransition>
            </Link>

            {/* Metadata Row */}
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ 
                mt: 1.5, 
                alignItems: 'center',
                flexWrap: 'nowrap',
                width: '100%',
                overflow: 'hidden',
                '& > *': { minWidth: 0 }
              }}
            >
              <Link href={`/blog?tag=${primaryTag.slug}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 800,
                    textTransform: 'lowercase',
                    letterSpacing: '0.05em',
                    transition: 'opacity 0.2s ease',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      opacity: 0.8,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  #{primaryTag.name}
                </Typography>
              </Link>
              
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3, flexShrink: 0 }} />
              
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: 'center',
                  color: 'text.secondary',
                  flexShrink: 1,
                  overflow: 'hidden'
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: '0.8rem', opacity: 0.7, flexShrink: 0 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }).replace(/^khoảng\s/, '')}
                </Typography>
              </Stack>
 
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3, flexShrink: 0 }} />
 
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: 'center',
                  color: 'text.secondary',
                  flexShrink: 0
                }}
              >
                <AccessTimeIcon sx={{ fontSize: '0.8rem', opacity: 0.7, flexShrink: 0 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {post.readingTime}
                </Typography>
              </Stack>
            </Stack>
        </Box>
 
        {/* Action Buttons (Admin Only) */}
        {isAdmin && (
          <Stack
            direction="row"
            spacing={0.5}
            className="action-buttons"
            sx={{
              display: { xs: 'none', md: 'flex' },
              opacity: { md: 0.5 },
              transform: { md: 'translateX(5px)' },
              transition: 'all 0.3s ease',
              ml: 2,
              mt: 0.5
            }}
          >
            <Tooltip title={post.isPinned ? "Bỏ ghim" : "Ghim bài viết"}>
              <IconButton 
                size="small" 
                onClick={() => onPin?.(post.id)}
                sx={{ 
                  color: post.isPinned ? 'primary.main' : 'inherit',
                  '& svg': {
                    transform: post.isPinned ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                <PushPinIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Chỉnh sửa">
              <IconButton 
                size="small" 
                component={Link} 
                href={`/admin/posts/edit/${post.id}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Xóa">
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => onDelete?.(post.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
      </Box>
  );
}
