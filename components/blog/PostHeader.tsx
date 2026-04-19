'use client';

import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { tokens } from '@/lib/theme-tokens';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';

interface PostHeaderProps {
  post: {
    title: string;
    slug: string;
    createdAt: Date;
    readingTime: string;
    tags: Array<{ name: string; slug: string }>;
  };
  transitionNames: any;
}

export default function PostHeader({ post, transitionNames }: PostHeaderProps) {
  const primaryTag = post.tags[0] ?? { name: 'general', slug: 'general' };

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box component="header" sx={{ mb: 5 }}>
        <ViewTransition name={transitionNames.title} share="post-title-shared">
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
            </Link>

            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
            </Typography>

            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.3 }} />

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <AccessTimeIcon sx={{ fontSize: '0.8rem', opacity: 0.7 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {post.readingTime}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
}
