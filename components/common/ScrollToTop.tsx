'use client';

import { useState, useEffect } from 'react';
import { IconButton, useTheme, alpha } from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    let ticking = false;
    const toggleVisibility = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 500);
        ticking = false;
      });
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          style={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            zIndex: 1000,
          }}
        >
          <IconButton
            aria-label="Cuộn lên đầu trang"
            onClick={scrollToTop}
            sx={{
              padding: '12px',
              bgcolor: alpha(theme.palette.background.default, 0.4),
              backdropFilter: 'blur(12px) saturate(180%)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
              color: 'primary.main',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: alpha(theme.palette.primary.main, 0.5),
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
            }}
          >
            <KeyboardArrowUpRoundedIcon />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
