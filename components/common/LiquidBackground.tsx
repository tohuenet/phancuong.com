'use client';

import React from 'react';
import { Box, alpha, useTheme } from '@mui/material';

export default function LiquidBackground() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        bgcolor: 'background.default',
        contain: 'strict',
        pointerEvents: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.08 : 0.1)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          willChange: 'transform',
          animation: 'liquidBlobA 40s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, isDark ? 0.06 : 0.08)} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          willChange: 'transform',
          animation: 'liquidBlobB 55s ease-in-out infinite',
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
