'use client';

import * as React from 'react';
import { Box, Typography, Button, Container, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { tokens } from '@/lib/theme-tokens';
import HomeIcon from '@mui/icons-material/Home';

export default function NotFound() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        zIndex: 5000, // Higher than AppShell header
        overflow: 'hidden',
        color: 'text.primary',
        p: 2
      }}
    >
      {/* Background Decorative Elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '100vh',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />

      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative', 
          zIndex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%' 
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Animated SVG Portal Illustration - Responsive Size */}
          <Box sx={{ 
            mb: { xs: 1, md: 3 }, 
            display: 'flex', 
            justifyContent: 'center',
            width: { xs: 140, sm: 180, md: 240 },
            height: { xs: 140, sm: 180, md: 240 }
          }}>
            <motion.svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 240 240" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="120" cy="120" r="100" stroke={theme.palette.primary.main} strokeWidth="0.5" strokeDasharray="10 5" opacity="0.3" />
              <motion.circle 
                cx="120" cy="120" r="80" 
                stroke={theme.palette.primary.main} 
                strokeWidth="1" 
                animate={{ r: [80, 85, 80], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle 
                cx="120" cy="120" r="60" 
                stroke={theme.palette.primary.main} 
                strokeWidth="1.5"
                animate={{ r: [60, 65, 60], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
              <path d="M120 40L189.282 160H50.7179L120 40Z" stroke={theme.palette.primary.main} strokeWidth="1" opacity="0.3" />
              <path d="M120 200L50.7179 80H189.282L120 200Z" stroke={theme.palette.primary.main} strokeWidth="1" opacity="0.3" />
              <motion.circle 
                cx="120" cy="120" r="10" 
                fill={theme.palette.primary.main}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.svg>
          </Box>

          {/* 404 Text - Scaled for Mobile */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 900, 
              fontSize: { xs: '4.5rem', sm: '6rem', md: '8rem' },
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.6)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 2, md: 3 },
              filter: `drop-shadow(0 0 20px ${alpha(theme.palette.primary.main, 0.2)})`
            }}
          >
            404
          </Typography>

          <Box 
            className="glass"
            sx={{ 
              p: { xs: 3, md: 4 }, 
              borderRadius: tokens.radius.lg,
              bgcolor: alpha(theme.palette.background.default, 0.7),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              backdropFilter: 'blur(30px)',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              Trang này không tồn tại
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: { xs: 3, md: 4 }, lineHeight: 1.5, fontSize: '0.95rem' }}>
              Có vẻ bạn đã lạc vào hư không. Hãy quay về trang chủ để tiếp tục hành trình nhé.
            </Typography>

            <Button
              variant="contained"
              component={Link}
              href="/"
              size="large"
              startIcon={<HomeIcon />}
              sx={{
                borderRadius: tokens.radius.full,
                px: 5,
                py: 1.5,
                fontWeight: 900,
                fontSize: { xs: '0.875rem', md: '1rem' },
                boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              VỀ TRANG CHỦ
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
