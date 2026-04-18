'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import React from 'react';

// Animation Presets
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface MotionBoxProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

/**
 * FadeIn Component
 */
export const FadeIn = ({ children, transition, ...props }: MotionBoxProps) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], ...transition }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * SlideIn Component - Defaults to slide up
 */
export const SlideIn = ({ children, transition, ...props }: MotionBoxProps) => (
  <motion.div
    variants={slideUp}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], ...transition }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * Stagger Component for lists/grids
 */
export const Stagger = ({ children, interval = 0.1, ...props }: MotionBoxProps & { interval?: number }) => (
  <motion.div
    variants={{
      animate: {
        transition: {
          staggerChildren: interval,
        },
      },
    }}
    initial="initial"
    animate="animate"
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * HoverScale Component for buttons/cards
 */
export const HoverScale = ({ children, ...props }: MotionBoxProps) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.div>
);
