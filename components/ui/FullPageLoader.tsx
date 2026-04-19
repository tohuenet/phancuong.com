'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, alpha, useTheme } from '@mui/material';

interface FullPageLoaderProps {
  isLoading?: boolean;
  message?: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({ 
  isLoading = true, 
  message = "Loading platform..." 
}) => {
  const theme = useTheme();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            background: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Main Animated Orb */}
          <Box sx={{ position: 'relative', width: 120, height: 120, mb: 4 }}>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                opacity: 0.6,
                filter: 'blur(8px)',
                position: 'absolute',
              }}
            />
            
            <motion.div
              animate={{
                scale: [1.1, 1, 1.1],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                width: '100%',
                height: '100%',
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: '50%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    // Fallback to a simple circle if logo fails
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </motion.div>
            </Box>
          </Box>

          {/* Loading Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center'
              }}
            >
              {message}
            </Typography>
          </motion.div>

          {/* Sub-text animation */}
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.text.secondary,
                }}
              />
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullPageLoader;
