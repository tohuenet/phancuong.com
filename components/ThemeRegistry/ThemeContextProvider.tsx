'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { Components, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

declare module '@mui/material/styles' {
  interface Palette {
    onSurface: string;
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;
    surfaceContainerLowest: string;
    surfaceDim: string;
    surfaceBright: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
  }
  interface PaletteOptions {
    onSurface?: string;
    surfaceContainerLow?: string;
    surfaceContainer?: string;
    surfaceContainerHigh?: string;
    surfaceContainerHighest?: string;
    surfaceContainerLowest?: string;
    surfaceDim?: string;
    surfaceBright?: string;
    surfaceVariant?: string;
    onSurfaceVariant?: string;
    outline?: string;
    outlineVariant?: string;
    primaryContainer?: string;
    onPrimaryContainer?: string;
    secondaryContainer?: string;
    onSecondaryContainer?: string;
    tertiary?: string;
    onTertiary?: string;
    tertiaryContainer?: string;
    onTertiaryContainer?: string;
  }
}

import { tokens } from '@/lib/theme-tokens';

type ToggleColorMode = (event?: React.MouseEvent | { x: number; y: number }) => void;
export const ColorModeContext = React.createContext<{ toggleColorMode: ToggleColorMode }>({
  toggleColorMode: () => {},
});
export const LayoutModeContext = React.createContext({ isWide: false, toggleWideMode: () => {} });

export default function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');
  const [isWide, setIsWide] = React.useState(false);
  const isThemeTransitioningRef = React.useRef(false);

  React.useEffect(() => {
    // Initial initialization
    if (typeof window !== 'undefined') {
      const savedWideMode = localStorage.getItem('phancuong-is-wide-mode');
      if (savedWideMode === 'true') {
        setIsWide(true);
      }
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-mui-color-scheme', mode);
  }, [mode]);

  const layoutMode = React.useMemo(() => ({
    isWide,
    toggleWideMode: () => {
      setIsWide((prev) => {
        const next = !prev;
        localStorage.setItem('phancuong-is-wide-mode', String(next));
        return next;
      });
    }
  }), [isWide]);


  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: (event?: React.MouseEvent | { x: number; y: number }) => {
        if (isThemeTransitioningRef.current) return;

        if (typeof window === 'undefined' || typeof document === 'undefined') {
          setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
          return;
        }

        const doc = document as any;
        if (!doc.startViewTransition) {
          setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
          return;
        }

        isThemeTransitioningRef.current = true;

        const x = event && 'clientX' in event ? event.clientX : (event as any)?.x ?? window.innerWidth / 2;
        const y = event && 'clientY' in event ? event.clientY : (event as any)?.y ?? window.innerHeight / 2;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = doc.startViewTransition(async () => {
          const nextMode = mode === 'light' ? 'dark' : 'light';
          flushSync(() => {
            setMode(nextMode);
          });
          // Ensure attribute is set before the browser takes the new screenshot
          document.documentElement.setAttribute('data-mui-color-scheme', nextMode);
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 500,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            }
          ).finished.finally(() => {
            isThemeTransitioningRef.current = false;
          });
        });

        transition.finished.finally(() => {
          isThemeTransitioningRef.current = false;
        });
      },
    }),
    [mode],
  );

  const theme = React.useMemo(() => {
    const isDark = mode === 'dark';
    const paletteTokens = isDark ? tokens.color.dark : tokens.color.light;
    const glassTokens = isDark ? tokens.glass.dark : tokens.glass.light;
    const primaryMain = paletteTokens.primary;
    const tracking = tokens.typography.tracking;

    return createTheme({
      palette: {
        mode,
        primary: {
          main: primaryMain,
          light: alpha(primaryMain, 0.8),
          dark: alpha(primaryMain, 1),
          contrastText: paletteTokens.onPrimary,
        },
        secondary: {
          main: paletteTokens.secondary,
          light: alpha(paletteTokens.secondary, 0.8),
          dark: alpha(paletteTokens.secondary, 1),
          contrastText: paletteTokens.onSecondary,
        },
        background: {
          default: paletteTokens.background,
          paper: paletteTokens.surface,
        },
        text: {
          primary: paletteTokens.onSurface,
          secondary: paletteTokens.onSurfaceVariant,
        },
        divider: paletteTokens.outline,
        onSurface: paletteTokens.onSurface,
        surfaceContainerLowest: paletteTokens.surfaceContainerLowest,
        surfaceContainerLow: paletteTokens.surfaceContainerLow,
        surfaceContainer: paletteTokens.surfaceContainer,
        surfaceContainerHigh: paletteTokens.surfaceContainerHigh,
        surfaceContainerHighest: paletteTokens.surfaceContainerHighest,
        surfaceDim: paletteTokens.surfaceDim,
        surfaceBright: paletteTokens.surfaceBright,
        surfaceVariant: paletteTokens.surfaceVariant,
        onSurfaceVariant: paletteTokens.onSurfaceVariant,
        outline: paletteTokens.outline,
        outlineVariant: paletteTokens.outlineVariant,
        primaryContainer: paletteTokens.primaryContainer,
        onPrimaryContainer: paletteTokens.onPrimaryContainer,
        secondaryContainer: paletteTokens.secondaryContainer,
        onSecondaryContainer: paletteTokens.onSecondaryContainer,
        tertiary: paletteTokens.tertiary,
        onTertiary: paletteTokens.onTertiary,
        tertiaryContainer: paletteTokens.tertiaryContainer,
        onTertiaryContainer: paletteTokens.onTertiaryContainer,
        action: {
          hover: alpha(primaryMain, tokens.state.hover),
          hoverOpacity: tokens.state.hover,
          selected: alpha(primaryMain, tokens.state.focus),
          selectedOpacity: tokens.state.focus,
          focus: alpha(primaryMain, tokens.state.focus),
          focusOpacity: tokens.state.focus,
        },
      },
      typography: {
        fontFamily: 'var(--font-be-vietnam), sans-serif',
        h1: { fontSize: tokens.typography.h1, fontWeight: 800, letterSpacing: tracking.displayLarge, lineHeight: tokens.lineHeight.display },
        h2: { fontSize: tokens.typography.h2, fontWeight: 700, letterSpacing: tracking.displayMedium, lineHeight: tokens.lineHeight.display },
        h3: { fontSize: tokens.typography.h3, fontWeight: 700, letterSpacing: tracking.displaySmall, lineHeight: tokens.lineHeight.heading },
        h4: { fontSize: tokens.typography.h4, fontWeight: 700, letterSpacing: tracking.headline, lineHeight: tokens.lineHeight.heading },
        h5: { fontSize: tokens.typography.h5, fontWeight: 600, letterSpacing: tracking.headline, lineHeight: tokens.lineHeight.heading },
        h6: { fontSize: tokens.typography.h6, fontWeight: 600, letterSpacing: tracking.headline, lineHeight: tokens.lineHeight.heading },
        body1: { fontSize: tokens.typography.body1, lineHeight: tokens.lineHeight.body, letterSpacing: tracking.body },
        body2: { fontSize: tokens.typography.body2, lineHeight: tokens.lineHeight.body, letterSpacing: tracking.body },
        caption: { fontSize: tokens.typography.caption, lineHeight: 1.45, letterSpacing: tracking.label },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: tracking.label },
        overline: { fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: tracking.micro, textTransform: 'uppercase' },
      },
      shape: {
        borderRadius: tokens.radius.lg,
      },
      spacing: 8,
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            '*': {
              '::selection': {
                backgroundColor: alpha(tokens.color.primary, 0.25),
                color: 'inherit',
              },
            },
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: `${alpha(paletteTokens.onSurface, 0.15)} transparent`,
              '&::-webkit-scrollbar': { width: '8px', height: '8px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(paletteTokens.onSurface, 0.15),
                borderRadius: '10px',
                border: '2px solid transparent',
                backgroundClip: 'content-box',
                '&:hover': { backgroundColor: alpha(paletteTokens.onSurface, 0.25) },
              },
            },
            '::view-transition-old(root), ::view-transition-new(root)': {
              animation: 'none',
              mixBlendMode: 'normal',
            },
            '::view-transition-old(root)': {
              zIndex: 1,
            },
            '::view-transition-new(root)': {
              zIndex: 9999,
            },
            // Liquid Glass v2 — gradient-border specular highlight, saturation
            // boost, and backdrop-filter fallback. Mobile gets halved blur
            // without saturate/noise to keep GPU paint cost down.
            '.glass': {
              position: 'relative',
              overflow: 'hidden',
              background: glassTokens.background,
              backdropFilter: `blur(${tokens.glass.blur})`,
              WebkitBackdropFilter: `blur(${tokens.glass.blur})`,
              border: `1px solid ${glassTokens.border}`,
              borderRadius: tokens.radius.xl,
              boxShadow: `${glassTokens.shadow}, inset 0 1px 0 ${glassTokens.borderTop}`,
              transition: `all ${tokens.duration.medium4}ms ${tokens.transitions.emphasizedDecelerate}`,
              '@supports not (backdrop-filter: blur(1px))': {
                background: glassTokens.backgroundSolid,
              },
              '@media (min-width: 900px)': {
                backdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
                WebkitBackdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
                boxShadow: `${glassTokens.shadow}, inset 0 1px 0 ${glassTokens.borderTop}, inset 0 -1px 0 ${glassTokens.borderBottom}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  opacity: isDark ? 0.04 : 0.02,
                  pointerEvents: 'none',
                  zIndex: -1,
                },
              },
            },
            '.glass-premium': {
              position: 'relative',
              overflow: 'hidden',
              background: glassTokens.background,
              backdropFilter: `blur(${tokens.glass.blur})`,
              WebkitBackdropFilter: `blur(${tokens.glass.blur})`,
              border: `1px solid ${glassTokens.border}`,
              borderRadius: tokens.radius.xl,
              boxShadow: `0 16px 32px -12px ${isDark ? 'rgba(0,0,0,0.55)' : 'rgba(15,15,18,0.1)'}, inset 0 1px 0 ${glassTokens.borderTop}`,
              '@supports not (backdrop-filter: blur(1px))': {
                background: glassTokens.backgroundSolid,
              },
              '@media (min-width: 900px)': {
                backdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
                WebkitBackdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
                boxShadow: `0 25px 50px -12px ${isDark ? 'rgba(0,0,0,0.65)' : 'rgba(15,15,18,0.12)'}, inset 0 1px 0 ${glassTokens.borderTop}, inset 0 -1px 0 ${glassTokens.borderBottom}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${alpha('#FFFFFF', isDark ? 0.06 : 0.25)} 0%, transparent 45%, ${alpha(primaryMain, isDark ? 0.08 : 0.12)} 100%)`,
                  pointerEvents: 'none',
                  mixBlendMode: 'overlay',
                },
              },
            },
            // Accessibility: visible focus ring for keyboard users.
            ':focus-visible': {
              outline: `2px solid ${primaryMain}`,
              outlineOffset: '2px',
              borderRadius: '4px',
            },
            // Skip-link — visually hidden until focused, then slides into view.
            '.skip-link': {
              position: 'fixed',
              top: 12,
              left: 12,
              zIndex: 10000,
              padding: '10px 16px',
              borderRadius: tokens.radius.sm,
              background: paletteTokens.primaryContainer,
              color: paletteTokens.onPrimaryContainer,
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transform: 'translateY(-150%)',
              transition: `transform ${tokens.duration.short4}ms ${tokens.transitions.emphasizedDecelerate}`,
              '&:focus-visible': {
                transform: 'translateY(0)',
                outline: `2px solid ${primaryMain}`,
                outlineOffset: '2px',
              },
            },
          },
        },
        MuiButton: {
          defaultProps: {
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              borderRadius: tokens.radius.sm,
              padding: '10px 24px',
              transition: `all ${tokens.duration.medium2}ms ${tokens.transitions.emphasized}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 16px ${alpha(primaryMain, 0.2)}`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:focus-visible': {
                outline: `2px solid ${primaryMain}`,
                outlineOffset: '2px',
              },
            },
            contained: {
              background: primaryMain,
              '&:hover': {
                background: primaryMain,
                filter: 'brightness(1.1)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: tokens.radius.lg,
              backgroundImage: 'none',
              transition: `all ${tokens.duration.medium2}ms ${tokens.transitions.emphasized}`,
              background: paletteTokens.surface,
              border: `1px solid ${paletteTokens.outline}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDark
                  ? '0 20px 40px rgba(0,0,0,0.6)'
                  : '0 20px 40px rgba(0,0,0,0.1)',
                borderColor: primaryMain,
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              background: glassTokens.background,
              backdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
              WebkitBackdropFilter: `blur(${tokens.glass.blurLg}) saturate(${tokens.glass.saturate})`,
              borderBottom: `1px solid ${glassTokens.border}`,
              color: paletteTokens.onSurface,
              height: tokens.layout.navbarHeight,
              justifyContent: 'center',
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              transition: `all ${tokens.duration.short4}ms ${tokens.transitions.emphasized}`,
              '&:focus-visible': {
                outline: `2px solid ${primaryMain}`,
                outlineOffset: '2px',
              },
            },
          },
        },
        MuiLink: {
          styleOverrides: {
            root: {
              '&:focus-visible': {
                outline: `2px solid ${primaryMain}`,
                outlineOffset: '2px',
                borderRadius: '2px',
              },
            },
          },
        },
        MuiDataGrid: {
          styleOverrides: {
            root: {
              borderRadius: tokens.radius.lg,
              border: `1px solid ${paletteTokens.outline}`,
              background: paletteTokens.surface,
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: paletteTokens.surfaceContainerLow,
              },
              '& .MuiDataGrid-cell': {
                borderColor: paletteTokens.outline,
              },
            },
          },
        },
      } as Components<Omit<Theme, 'components'>>,
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <LayoutModeContext.Provider value={layoutMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </LayoutModeContext.Provider>
    </ColorModeContext.Provider>
  );
}
