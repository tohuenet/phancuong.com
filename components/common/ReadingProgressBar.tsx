'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme, alpha } from '@mui/material';

export default function ReadingProgressBar() {
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: theme.palette.primary.main,
        transformOrigin: '0%',
        zIndex: 9999,
        boxShadow: `0 -2px 8px ${alpha(theme.palette.primary.main, 0.4)}`
      }}
    />
  );
}
