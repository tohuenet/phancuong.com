'use client';

import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { tokens } from '@/lib/theme-tokens';

export default function PremiumScrollUp() {
  const theme = useTheme();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Box 
      onClick={scrollToTop}
      sx={{ 
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        py: 2,
        px: 4,
        borderRadius: '20px',
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        '&:hover': {
          '& .scroll-icon': {
            transform: 'translateY(-8px)',
          },
          '& .scroll-text': {
            opacity: 1,
            transform: 'translateY(0)',
          },
          '& .glow-effect': {
            opacity: 1,
            scale: 1.1,
          }
        }
      }}
    >
      {/* Glow Effect Background */}
      <Box
        className="glow-effect"
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
          opacity: 0,
          scale: 0.8,
          transition: 'all 0.6s cubic-bezier(0.2, 0, 0, 1)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main Icon Circle */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ zIndex: 1 }}
      >
        <Box
          className="scroll-icon"
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.1),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            color: 'primary.main',
            transition: 'all 0.4s ease',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          }}
        >
          <KeyboardArrowUpRoundedIcon sx={{ fontSize: '2rem' }} />
        </Box>
      </motion.div>

      {/* Text Label */}
      <Typography
        className="scroll-text"
        variant="caption"
        sx={{
          color: 'primary.main',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          opacity: 0.4,
          transform: 'translateY(4px)',
          transition: 'all 0.4s ease',
          zIndex: 1,
          fontFamily: tokens.typography.fontFamily.serif,
        }}
      >
        Lên đầu trang
      </Typography>

      {/* Animated Rings */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
          marginTop: -15, // Align with icon
        }}
      />
    </Box>
  );
}
