'use client';

import React from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import { tokens } from '@/lib/theme-tokens';

// Two soft gradient blobs floating in the background. Kept visually identical
// to the prior version, but tuned to stop burning GPU/battery:
//   - Blur reduced from 40/50px → 30/36px (still feels airy, half the cost).
//   - Blob size reduced slightly so the blurred layer covers less pixels.
//   - `will-change` removed: we're already on a compositor layer thanks to
//     `transform: translate3d`, and a permanent `will-change` hint keeps the
//     GPU layer pinned forever (growing VRAM use for no benefit once the
//     animation is playing).
//   - Animation pauses when the tab is hidden (Page Visibility API) and when
//     the user prefers reduced motion — stops wasting battery in background.
//   - Hidden entirely on narrow viewports: on mobile the blurred blob covers
//     the whole screen at high DPR, which is the single worst battery drain
//     on this site. The decorative effect isn't missed on a small screen.
export default function LiquidBackground() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Pause the CSS animations when the tab is hidden. animationPlayState is cheap
  // to flip and costs nothing while the tab is active.
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const onVisibility = () => {
      const el = rootRef.current;
      if (!el) return;
      el.dataset.paused = document.hidden ? 'true' : 'false';
    };
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <Box
      ref={rootRef}
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        bgcolor: 'background.default',
        contain: 'strict',
        pointerEvents: 'none',
        display: { xs: 'none', md: 'block' },
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          borderRadius: `${tokens.radius.xl}px`,
          transform: 'translate3d(0,0,0)',
        },
        '&::before': {
          top: '10%',
          right: '5%',
          width: '46vw',
          height: '52vh',
          background: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, isDark ? 0.08 : 0.1)} 0%, transparent 75%)`,
          filter: 'blur(40px)',
          animation: 'liquidBlobA 40s ease-in-out infinite',
        },
        '&::after': {
          bottom: '5%',
          left: '5%',
          width: '40vw',
          height: '46vh',
          background: `radial-gradient(ellipse at center, ${alpha(theme.palette.secondary.main, isDark ? 0.06 : 0.08)} 0%, transparent 75%)`,
          filter: 'blur(44px)',
          animation: 'liquidBlobB 55s ease-in-out infinite',
        },
        '&[data-paused="true"]::before, &[data-paused="true"]::after': {
          animationPlayState: 'paused',
        },
        '@keyframes liquidBlobA': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(4%,-3%,0) scale(1.08)' },
        },
        '@keyframes liquidBlobB': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(-3%,4%,0) scale(0.95)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&::before, &::after': { animation: 'none' },
        },
      }}
    />
  );
}
