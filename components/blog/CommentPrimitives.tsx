'use client';

import * as React from 'react';
import { Box, Button, Theme, alpha } from '@mui/material';
import { tokens } from '@/lib/theme-tokens';

// Seeded hue generator so each author gets a stable avatar color.
function stringToHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export const AuthorAvatar = React.memo(function AuthorAvatar({
  name,
  image,
  size = 36,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  if (image) {
    return (
      <Box
        component="img"
        src={image}
        alt={name}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const hue = stringToHue(name || 'anon');
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.42,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        background: `linear-gradient(135deg, hsl(${hue} 72% 55%), hsl(${(hue + 38) % 360} 72% 42%))`,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)',
        userSelect: 'none',
      }}
    >
      {letter}
    </Box>
  );
});

type TextActionTone = 'neutral' | 'danger' | 'primary';

export function TextAction({
  children,
  onClick,
  tone = 'neutral',
  theme,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: TextActionTone;
  theme: Theme;
}) {
  const color =
    tone === 'danger'
      ? theme.palette.error.main
      : tone === 'primary'
      ? theme.palette.primary.main
      : theme.palette.text.secondary;
  return (
    <Button
      size="small"
      onClick={onClick}
      disableRipple
      sx={{
        minWidth: 0,
        px: 1,
        py: 0.25,
        height: 26,
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.01em',
        textTransform: 'none',
        color,
        borderRadius: '999px',
        bgcolor: 'transparent',
        '&:hover': { bgcolor: alpha(color, 0.1) },
      }}
    >
      {children}
    </Button>
  );
}

// Shared style for rich-text comment body — keeps images, code blocks,
// quotes, attachments, and long tokens inside the column no matter what
// the user pastes in.
export function buildCommentContentSx(theme: Theme, isReply: boolean) {
  return {
    mt: 0.5,
    color: 'text.primary',
    fontSize: isReply ? '0.9rem' : '0.95rem',
    lineHeight: 1.65,
    wordBreak: 'break-word' as const,
    overflowWrap: 'anywhere' as const,
    '& p': { mb: 1, '&:last-child': { mb: 0 } },
    '& a.comment-link, & a': {
      color: 'primary.main',
      textDecoration: 'none',
      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      transition: 'border-color 0.2s',
      '&:hover': { borderBottomColor: theme.palette.primary.main },
    },
    '& .comment-mention': {
      color: 'primary.main',
      fontWeight: 700,
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      px: 0.75,
      py: 0.15,
      borderRadius: '999px',
      textDecoration: 'none',
      fontSize: '0.85em',
    },
    '& .comment-image': {
      maxWidth: 160,
      maxHeight: 160,
      width: 'auto',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: 1.5,
      my: 1,
      mr: 1,
      display: 'inline-block',
      verticalAlign: 'top',
      cursor: 'zoom-in',
      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
      transition: 'transform 0.2s ease',
      '&:hover': { transform: 'scale(1.02)' },
    },
    '& .comment-attachments': {
      mt: 1.25,
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(3, 1fr)',
        sm: 'repeat(auto-fill, minmax(112px, 1fr))',
      },
      gap: 0.75,
      maxWidth: 420,
    },
    '& .comment-attachment': {
      width: '100%',
      aspectRatio: '1 / 1',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: 1.5,
      cursor: 'zoom-in',
      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.25)}`,
      },
    },
    '& blockquote': {
      borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.35)}`,
      pl: 1.5,
      py: 0.25,
      my: 1,
      fontStyle: 'italic',
      color: alpha(theme.palette.text.primary, 0.75),
    },
    '& pre': {
      my: 1.25,
      p: 1.5,
      borderRadius: 2,
      bgcolor: theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa',
      color: theme.palette.mode === 'dark' ? '#e6edf3' : '#24292f',
      border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
      fontFamily: tokens.typography.fontFamily.mono,
      fontSize: '0.82rem',
      lineHeight: 1.55,
      maxHeight: 360,
      overflow: 'auto',
      whiteSpace: 'pre',
    },
    '& code': {
      fontFamily: tokens.typography.fontFamily.mono,
      fontSize: '0.88em',
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      color: 'primary.main',
      px: 0.65,
      py: 0.15,
      borderRadius: 0.75,
    },
    '& pre code': {
      bgcolor: 'transparent',
      color: 'inherit',
      p: 0,
      borderRadius: 0,
      fontSize: 'inherit',
    },
    '& ul, & ol': { pl: 2.5, my: 1 },
    '& li': { mb: 0.25 },
  } as const;
}
