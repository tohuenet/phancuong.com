'use client';

import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
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
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
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
    published?: boolean;
  };
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
}

export default function PostListItem({ post, isAdmin, onDelete, onPin, dragHandleProps }: PostListItemProps) {
  const transitionNames = getPostViewTransitionNames(post.slug, post.isPinned);
  const primaryTag = post.tags[0] ?? { name: 'all', slug: 'all' };

  return (
    <Box
      sx={{
        py: 2.5,
        px: { xs: 2, md: 3 },
        mb: 2,
        borderRadius: `${tokens.radius.md}px`,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: (t) => t.palette.outlineVariant,
        position: 'relative',
        containerType: 'inline-size',
        transition: `border-color ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
        '&:hover': {
          borderColor: 'text.primary',
          '& .action-buttons': { opacity: 1 },
          '& .title-text': { color: 'text.primary' },
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        {isAdmin && post.isPinned && (
          <Box
            {...dragHandleProps}
            sx={{
              display: { xs: 'none', md: 'block' },
              cursor: 'grab',
              mt: 0.5,
              color: 'text.secondary',
              opacity: 0.4,
              '&:hover': { opacity: 1 },
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Link
            href={`/blog/${post.slug}`}
            prefetch={true}
            transitionTypes={['post-open']}
            style={{ textDecoration: 'none' }}
          >
            <ViewTransition name={transitionNames.title} share="post-title-shared">
              <Typography
                variant="h3"
                className="title-text"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.15rem', md: '1.4rem' },
                  lineHeight: 1.3,
                  letterSpacing: '-0.015em',
                  color: 'text.primary',
                  transition: 'color 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  wordBreak: 'break-word',
                }}
              >
                {post.isPinned && (
                  <PushPinIcon
                    sx={{
                      fontSize: '1.1rem',
                      mr: 1.25,
                      color: 'text.secondary',
                    }}
                  />
                )}
                {isAdmin && post.published === false && (
                  <HistoryEduIcon
                    sx={{ fontSize: '1.1rem', mr: 1.25, color: 'text.secondary' }}
                  />
                )}
                {post.title}
              </Typography>
            </ViewTransition>
          </Link>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: 1.25,
              alignItems: 'center',
              flexWrap: 'nowrap',
              width: '100%',
              overflow: 'hidden',
              color: 'text.secondary',
              '& > *': { minWidth: 0 },
            }}
          >
            <Link
              href={`/?tag=${primaryTag.slug}`}
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'lowercase',
                  letterSpacing: tokens.typography.tracking.micro,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                #{primaryTag.name}
              </Typography>
            </Link>

            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: 'currentColor',
                opacity: 0.4,
                flexShrink: 0,
              }}
            />

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center', flexShrink: 1, overflow: 'hidden' }}
            >
              <CalendarMonthIcon sx={{ fontSize: '0.8rem', opacity: 0.7, flexShrink: 0 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
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
                flexShrink: 0,
              }}
            />

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center', flexShrink: 0 }}
            >
              <AccessTimeIcon sx={{ fontSize: '0.8rem', opacity: 0.7, flexShrink: 0 }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}
              >
                {post.readingTime}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {isAdmin && (
          <Stack
            direction="row"
            spacing={0.25}
            className="action-buttons"
            sx={{
              display: { xs: 'none', md: 'flex' },
              opacity: { md: 0.4 },
              transition: `opacity ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
              ml: 1,
              mt: 0.25,
            }}
          >
            <Tooltip title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}>
              <IconButton
                size="small"
                onClick={() => onPin?.(post.id)}
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

            <Tooltip title="Xóa">
              <IconButton
                size="small"
                onClick={() => onDelete?.(post.id)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main', bgcolor: 'transparent' },
                }}
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
