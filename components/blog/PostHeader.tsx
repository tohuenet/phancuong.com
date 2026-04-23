'use client';

import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PushPinIcon from '@mui/icons-material/PushPin';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { m } from 'framer-motion';
import type { PostViewTransitionNames } from '@/lib/post-view-transition';

interface PostHeaderProps {
  post: {
    title: string;
    slug: string;
    createdAt: Date;
    readingTime: string;
    tags: Array<{ name: string; slug: string }>;
    published?: boolean;
    isPinned?: boolean;
  };
  transitionNames: PostViewTransitionNames;
}

export default function PostHeader({ post, transitionNames }: PostHeaderProps) {
  const primaryTag = post.tags[0] ?? { name: 'general', slug: 'general' };

  return (
    <m.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box component="header" sx={{ mb: 5 }}>
        <ViewTransition name={transitionNames.title} share="post-title-shared">
          <Typography
            variant="h3"
            component="h1"
            className="title-text"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: 'text.primary',
              transition: 'color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              wordBreak: 'break-word',
            }}
          >
            {post.isPinned && (
              <PushPinIcon sx={{ fontSize: '1.8rem', mr: 2, color: 'primary.main', transform: 'rotate(20deg)' }} />
            )}
            {post.published === false && (
              <HistoryEduIcon sx={{ fontSize: '1.8rem', mr: 2, color: 'warning.main' }} />
            )}
            {post.title}
          </Typography>
        </ViewTransition>

        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ 
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
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.2s ease',
                  '&:hover': {
                    opacity: 0.8,
                    textDecoration: 'underline',
                  },
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
    </m.div>
  );
}
