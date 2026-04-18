'use client';

import React from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

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
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: isDark ? 0.05 : 0.02,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Primary Blob */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.08 : 0.1)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />

      {/* Secondary Blob */}
      <motion.div
        animate={{
          x: [0, -80, 100, 0],
          y: [0, 120, -50, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, isDark ? 0.06 : 0.08)} 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
      />

      {/* Tertiary Blob (Accent) */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 50, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, isDark ? 0.03 : 0.05)} 0%, transparent 70%)`,
          filter: 'blur(120px)',
        }}
      />
    </Box>
  );
}
