'use client';

import React from 'react';
import { GlobalStyles, useTheme, alpha } from '@mui/material';

// Reading progress bar that runs on CSS `animation-timeline: scroll()` where
// supported — completely off the JS main thread and off the render cycle.
// Fallback for browsers without scroll-timeline: a rAF-throttled scroll
// listener that mutates a CSS variable. No React state, so React does zero
// re-renders on scroll.
//
// The keyframe is injected via MUI's GlobalStyles rather than living in
// app/globals.css, because globals.css is not imported by this app — MUI
// owns the stylesheet pipeline.
export default function ReadingProgressBar() {
  const theme = useTheme();
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
    <>
      <GlobalStyles
        styles={{
          '@keyframes readingProgressFill': {
            from: { transform: 'scaleX(0)' },
            to: { transform: 'scaleX(1)' },
          },
        }}
      />
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          transformOrigin: '0 50%',
          backgroundColor: theme.palette.primary.main,
          boxShadow: `0 -2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
          zIndex: 9999,
          transform: 'scaleX(var(--progress, 0))',
          animation: 'readingProgressFill linear both',
          animationTimeline: 'scroll(root)',
          willChange: 'transform',
        }}
      />
    </>
  );
}
