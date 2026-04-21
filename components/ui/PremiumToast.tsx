'use client';

import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { m } from 'framer-motion';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { tokens } from '@/lib/theme-tokens';

export type ToastType = 'success' | 'error' | 'info';

interface PremiumToastProps {
  message: string;
  type?: ToastType;
}

export const PremiumToast = ({ message, type = 'success' }: PremiumToastProps) => {
  const theme = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircleRoundedIcon sx={{ fontSize: '1.25rem' }} />;
      case 'error': return <ErrorRoundedIcon sx={{ fontSize: '1.25rem' }} />;
      case 'info': return <InfoRoundedIcon sx={{ fontSize: '1.25rem' }} />;
      default: return <CheckCircleRoundedIcon sx={{ fontSize: '1.25rem' }} />;
    }
  };

  const getGlowColor = () => {
    switch (type) {
      case 'success': return tokens.color.success;
      case 'error': return tokens.color.error;
      case 'info': return tokens.color.info;
      default: return tokens.color.primary;
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 400,
        mass: 0.8
      }}
    >
      <Box
        sx={{
          minWidth: { xs: 'calc(100vw - 48px)', sm: 380 },
          maxWidth: 500,
          p: '14px 20px',
          borderRadius: '24px', // Premium rounded corners
          bgcolor: alpha(theme.palette.mode === 'dark' ? '#0F0F12' : '#FFFFFF', 0.65),
          backdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${alpha(getGlowColor(), 0.2)}`,
          boxShadow: theme.palette.mode === 'dark' 
            ? `0 12px 48px ${alpha(theme.palette.common.black, 0.6)}, inset 0 0 20px ${alpha(getGlowColor(), 0.05)}`
            : `0 12px 48px ${alpha(theme.palette.common.black, 0.12)}, inset 0 0 20px ${alpha(getGlowColor(), 0.02)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          position: 'relative',
          overflow: 'hidden',
          // Top light reflection (liquid effect)
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(getGlowColor(), 0.5)}, transparent)`,
            opacity: 0.8,
          }
        }}
      >
        {/* Icon Container with soft glow */}
        <Box 
          sx={{ 
            display: 'flex',
            p: 1.25,
            borderRadius: '16px',
            bgcolor: alpha(getGlowColor(), 0.1),
            color: getGlowColor(),
            boxShadow: `0 0 20px ${alpha(getGlowColor(), 0.1)}`,
          }}
        >
          {getIcon()}
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 750, 
              color: 'text.primary',
              lineHeight: 1.5,
              letterSpacing: '-0.015em',
              fontSize: '0.925rem'
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Liquid Gradient Blob 1 */}
        <Box 
          sx={{
            position: 'absolute',
            top: -60,
            left: -60,
            width: 120,
            height: 120,
            background: `radial-gradient(circle, ${alpha(getGlowColor(), 0.12)} 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: -1,
            filter: 'blur(20px)'
          }}
        />

        {/* Liquid Gradient Blob 2 */}
        <Box 
          sx={{
            position: 'absolute',
            bottom: -40,
            right: -40,
            width: 140,
            height: 140,
            background: `radial-gradient(circle, ${alpha(getGlowColor(), 0.08)} 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: -1,
            filter: 'blur(20px)'
          }}
        />
      </Box>
    </m.div>
  );
};
