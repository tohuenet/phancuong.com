'use client';

import React from 'react';
import { useTheme, alpha } from '@mui/material';

// Reading progress bar that runs on CSS `animation-timeline: scroll()` where
// supported — completely off the JS main thread and off the render cycle.
//
// Previously this used framer-motion's `useSpring(useScroll())`, which attaches
// a scroll listener and runs a spring solver every frame on the main thread.
// That's wasted work for a purely decorative bar: we don't need any JS for
// this on a modern browser.
//
// Fallback for browsers without scroll-timeline (Safari < 18): a lightweight
// rAF-throttled scroll listener that mutates a CSS variable. No React state,
// so React does zero re-renders on scroll.
export default function ReadingProgressBar() {
  const theme = useTheme();
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Feature-detect scroll-linked animations. If supported, the CSS keyframes
    // below drive the transform directly — no listener needed.
    const supportsScrollTimeline =
      typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: scroll()');
    if (supportsScrollTimeline) return;

    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const progress = max > 0 ? h.scrollTop / max : 0;
      el.style.setProperty('--progress', String(progress));
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        transformOrigin: '0 50%',
        backgroundColor: theme.palette.primary.main,
        boxShadow: `0 -2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
        zIndex: 9999,
        // Fallback path: scale by CSS var driven from the scroll listener.
        // Scroll-timeline path overrides via the animation below.
        transform: 'scaleX(var(--progress, 0))',
        animation: 'readingProgressFill linear both',
        animationTimeline: 'scroll(root)',
        willChange: 'transform',
      }}
    />
  );
}
