'use client';

import * as React from 'react';
import {
  Box,
  Dialog,
  Grow,
  IconButton,
  Typography,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { tokens } from '@/lib/theme-tokens';
import type { TocEntry } from '@/lib/toc';
import { LayoutModeContext } from '@/components/ThemeRegistry/ThemeContextProvider';

interface TableOfContentsProps {
  headings: TocEntry[];
}

// Programmatic smooth scroll with explicit offset (see git log for why we
// don't rely on the browser's native hash-anchor scroll).
const HEADING_OFFSET_PX = 96;

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const theme = useTheme();
  const { isWide } = React.useContext(LayoutModeContext);

  const isLgUp = useMediaQuery('(min-width: 1180px)');
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const showSidebar = isLgUp && !isWide;
  const showInline = isMdUp && isWide;
  const showFab = !showSidebar;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gate render until first client commit
    setMounted(true);
  }, []);

  const [active, setActive] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const programmaticScrollRef = React.useRef(false);
  const [inlineInView, setInlineInView] = React.useState(true);
  const inlineRef = React.useRef<HTMLDetailsElement | null>(null);

  React.useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScrollRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-100px 0px -65% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  React.useEffect(() => {
    if (!showInline) return;
    const el = inlineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInlineInView(entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showInline, mounted]);

  if (!mounted || headings.length < 2) return null;

  const fabActive = showFab && !(showInline && inlineInView);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setDialogOpen(false);
    setActive(id);

    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - HEADING_OFFSET_PX;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    programmaticScrollRef.current = true;
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      programmaticScrollRef.current = false;
      setActive(id);
      window.removeEventListener('scrollend', release);
    };
    window.addEventListener('scrollend', release, { once: true });
    window.setTimeout(release, prefersReduced ? 50 : 900);

    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${id}`);
    }
  };

  // Fixed (sidebar / inline) — minimalist rail style: 1px outline-variant
  // border, accents to text.primary on hover/active. No fill, no gradient.
  const linkListFixed = (
    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {headings.map((h) => {
        const isActive = active === h.id;
        return (
          <Box
            component="li"
            key={h.id}
            sx={{ pl: h.level === 3 ? 2 : 0 }}
          >
            <Box
              component="a"
              href={`#${h.id}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, h.id)}
              sx={{
                display: 'block',
                py: 0.6,
                pl: 1.5,
                fontSize: h.level === 2 ? '0.875rem' : '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                color: isActive ? 'text.primary' : 'text.secondary',
                borderLeft: '1px solid',
                borderColor: isActive
                  ? 'text.primary'
                  : (t) => t.palette.outlineVariant,
                lineHeight: 1.5,
                transition: 'color 0.15s ease, border-color 0.15s ease',
                '&:hover': {
                  color: 'text.primary',
                  borderColor: 'text.primary',
                },
              }}
            >
              {h.text}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  // Dialog (mobile / fab) — M3 navigation list pattern: pill items, secondary
  // container fill for selected, state-layer overlay for hover. No gradients.
  const linkListDialog = (
    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {headings.map((h) => {
        const isActive = active === h.id;
        return (
          <Box
            component="li"
            key={h.id}
            sx={{ pl: h.level === 3 ? 3 : 0, mb: 0.25 }}
          >
            <Box
              component="a"
              href={`#${h.id}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, h.id)}
              sx={{
                display: 'block',
                py: 1.1,
                px: 2,
                fontSize: h.level === 2 ? '0.95rem' : '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive
                  ? (t) => t.palette.onSecondaryContainer
                  : (t) => t.palette.onSurfaceVariant,
                bgcolor: isActive
                  ? (t) => t.palette.secondaryContainer
                  : 'transparent',
                borderRadius: `${tokens.radius.full}px`,
                lineHeight: 1.4,
                transition: `background-color ${tokens.duration.short3}ms ${tokens.transitions.standard}, color ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
                '&:hover': {
                  bgcolor: isActive
                    ? (t) => t.palette.secondaryContainer
                    : (t) => alpha(t.palette.onSurface ?? t.palette.text.primary, tokens.state.hover),
                  color: isActive
                    ? (t) => t.palette.onSecondaryContainer
                    : 'text.primary',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
            >
              {h.text}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  const heading = (
    <Typography
      sx={{
        display: 'block',
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: tokens.typography.tracking.micro,
        textTransform: 'uppercase',
        color: 'text.secondary',
        opacity: 0.7,
        mb: 1.5,
      }}
    >
      Mục lục
    </Typography>
  );

  return (
    <>
      {showSidebar && (
        <Box
          component="nav"
          aria-label="Mục lục bài viết"
          sx={{
            position: 'fixed',
            top: 120,
            right: 'calc((100vw - 720px) / 2 - 272px)',
            width: 240,
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            zIndex: 1,
            pr: 1,
            scrollbarWidth: 'thin',
          }}
        >
          {heading}
          {linkListFixed}
        </Box>
      )}

      {showInline && (
        <Box
          ref={inlineRef}
          component="details"
          open
          aria-label="Mục lục bài viết"
          sx={{
            mb: 5,
            py: 2,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: (t) => t.palette.outlineVariant,
            '& > summary': {
              listStyle: 'none',
              cursor: 'pointer',
              userSelect: 'none',
              outline: 'none',
              '&::-webkit-details-marker': { display: 'none' },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'text.primary',
                outlineOffset: 2,
              },
            },
          }}
        >
          <Box component="summary" sx={{ mb: 1.5 }}>
            {heading}
          </Box>
          <Box component="nav" aria-label="Mục lục bài viết">
            {linkListFixed}
          </Box>
        </Box>
      )}

      {showFab && (
        <>
          {/* FAB — liquid glass, monochrome (no primary tint), subtle elevation */}
          <IconButton
            aria-label="Mở mục lục"
            onClick={() => setDialogOpen(true)}
            sx={{
              position: 'fixed',
              right: 20,
              bottom: 24,
              zIndex: 1200,
              width: 48,
              height: 48,
              color: 'text.primary',
              background: (t) =>
                t.palette.mode === 'dark'
                  ? tokens.glass.dark.background
                  : tokens.glass.light.background,
              backdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
              WebkitBackdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
              border: (t) =>
                `1px solid ${
                  t.palette.mode === 'dark'
                    ? tokens.glass.dark.border
                    : tokens.glass.light.border
                }`,
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? tokens.glass.dark.shadow
                  : tokens.glass.light.shadow,
              opacity: fabActive ? 1 : 0,
              transform: fabActive ? 'scale(1)' : 'scale(0.85)',
              pointerEvents: fabActive ? 'auto' : 'none',
              transition: `opacity ${tokens.duration.short4}ms ${tokens.transitions.emphasized}, transform ${tokens.duration.short4}ms ${tokens.transitions.emphasized}`,
              '@supports not (backdrop-filter: blur(1px))': {
                background: (t) =>
                  t.palette.mode === 'dark'
                    ? tokens.glass.dark.backgroundSolid
                    : tokens.glass.light.backgroundSolid,
              },
              '&:hover': {
                background: (t) =>
                  t.palette.mode === 'dark'
                    ? tokens.glass.dark.background
                    : tokens.glass.light.background,
                transform: fabActive ? 'translateY(-2px) scale(1.04)' : 'scale(0.85)',
              },
            }}
          >
            <FormatListBulletedRoundedIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>

          {/* Centered dialog — M3 surface tone + Grow scale-fade animation */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            slots={{ transition: Grow }}
            transitionDuration={{
              enter: tokens.duration.medium4,
              exit: tokens.duration.short4,
            }}
            sx={{ zIndex: 2100 }}
            slotProps={{
              backdrop: {
                sx: {
                  backgroundColor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(0,0,0,0.45)'
                      : 'rgba(0,0,0,0.32)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                },
              },
              paper: {
                sx: {
                  width: { xs: '92%', sm: 520 },
                  maxWidth: 560,
                  maxHeight: '85vh',
                  m: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  // Terminal.app aesthetic — flat dark surface, no glass,
                  // no gradient. The header band (rendered below) sits on a
                  // lighter container tone, like a macOS title bar.
                  bgcolor: 'background.paper',
                  borderRadius: `${tokens.radius.md}px`,
                  border: '1px solid',
                  borderColor: (t) => t.palette.outline,
                  boxShadow: (t) =>
                    t.palette.mode === 'dark'
                      ? `0 16px 40px ${alpha(t.palette.common.black, 0.6)}, 0 2px 8px ${alpha(t.palette.common.black, 0.4)}`
                      : `0 16px 40px ${alpha(t.palette.common.black, 0.12)}, 0 2px 8px ${alpha(t.palette.common.black, 0.08)}`,
                },
              },
            }}
          >
            {/* Title row — same dark surface as body, separated by a single
                primary-tinted hairline (matches the data-table pattern used
                elsewhere on the site). */}
            <Box
              sx={{
                px: 2.5,
                py: 1.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: tokens.typography.tracking.micro,
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                Mục lục
              </Typography>
              <IconButton
                aria-label="Đóng mục lục"
                size="small"
                onClick={() => setDialogOpen(false)}
                sx={{
                  width: 36,
                  height: 36,
                  color: (t) => t.palette.onSurfaceVariant,
                  transition: `background-color ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
                  '&:hover': {
                    bgcolor: (t) =>
                      alpha(t.palette.onSurface ?? t.palette.text.primary, tokens.state.hover),
                    color: 'text.primary',
                  },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </Box>

            {/* Scrollable list */}
            <Box
              component="nav"
              aria-label="Mục lục bài viết"
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 1.5,
                py: 1.5,
                scrollbarWidth: 'thin',
                scrollbarColor: (t) =>
                  `${alpha(t.palette.text.primary, 0.18)} transparent`,
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (t) => alpha(t.palette.text.primary, 0.18),
                  borderRadius: 999,
                },
              }}
            >
              {linkListDialog}
            </Box>
          </Dialog>
        </>
      )}
    </>
  );
}
