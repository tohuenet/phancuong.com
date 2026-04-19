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
    outline: string;
  }
  interface PaletteOptions {
    onSurface?: string;
    surfaceContainerLow?: string;
    surfaceContainer?: string;
    surfaceContainerHigh?: string;
    outline?: string;
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
    
    return createTheme({
      palette: {
        mode,
        primary: {
          main: tokens.color.primary,
          light: alpha(tokens.color.primary, 0.8),
          dark: alpha(tokens.color.primary, 1),
          contrastText: paletteTokens.onPrimary,
        },
        secondary: {
          main: tokens.color.secondary,
          light: alpha(tokens.color.secondary, 0.8),
          dark: alpha(tokens.color.secondary, 1),
          contrastText: '#000000',
        },
        background: {
          default: paletteTokens.background,
          paper: paletteTokens.surface,
        },
        text: {
          primary: paletteTokens.onSurface,
          secondary: alpha(paletteTokens.onSurface, 0.7),
        },
        divider: paletteTokens.outline,
        onSurface: paletteTokens.onSurface,
        surfaceContainerLow: paletteTokens.surfaceContainerLow,
        surfaceContainer: paletteTokens.surfaceContainer,
        surfaceContainerHigh: paletteTokens.surfaceContainerHigh,
        outline: paletteTokens.outline,
        action: {
          hover: alpha(tokens.color.primary, 0.08),
          selected: alpha(tokens.color.primary, 0.16),
        },
      },
      typography: {
        fontFamily: 'var(--font-be-vietnam), sans-serif',
        h1: { fontSize: tokens.typography.h1, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: tokens.lineHeight.heading },
        h2: { fontSize: tokens.typography.h2, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: tokens.lineHeight.heading },
        h3: { fontSize: tokens.typography.h3, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: tokens.lineHeight.heading },
        h4: { fontSize: tokens.typography.h4, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: tokens.lineHeight.heading },
        h5: { fontSize: tokens.typography.h5, fontWeight: 600, lineHeight: 1.4 },
        h6: { fontSize: tokens.typography.h6, fontWeight: 600, lineHeight: 1.4 },
        body1: { fontSize: tokens.typography.body1, lineHeight: tokens.lineHeight.body, letterSpacing: '-0.01em', fontWeight: 450 },
        body2: { fontSize: tokens.typography.body2, lineHeight: tokens.lineHeight.body, letterSpacing: '-0.01em', fontWeight: 400 },
        caption: { fontSize: tokens.typography.caption, lineHeight: 1.5, letterSpacing: '0.01em' },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
        overline: { fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' },
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
            '.glass': {
              position: 'relative',
              overflow: 'hidden',
              background: glassTokens.background,
              backdropFilter: `blur(${tokens.glass.blur})`,
              border: `1px solid ${glassTokens.border}`,
              borderRadius: tokens.radius.xl,
              boxShadow: isDark 
                ? '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)'
                : '0 8px 32px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.5)',
              transition: `all 0.4s ${tokens.transitions.standard}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                opacity: isDark ? 0.04 : 0.02,
                pointerEvents: 'none',
                zIndex: -1,
              },
            },
            '.glass-premium': {
              position: 'relative',
              overflow: 'hidden',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.4)'}`,
              borderRadius: tokens.radius.xl,
              boxShadow: isDark 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255,255,255,0.1)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255,255,255,0.8)',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(120deg, rgba(255,255,255,0) 30%, ${alpha(tokens.color.primary, isDark ? 0.05 : 0.1)} 70%, rgba(255,255,255,0) 100%)`,
                pointerEvents: 'none',
              }
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
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 16px ${alpha(tokens.color.primary, 0.2)}`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            },
            contained: {
              background: tokens.color.primary,
              '&:hover': {
                background: tokens.color.primary,
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
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: paletteTokens.surface,
              border: `1px solid ${paletteTokens.outline}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDark 
                  ? '0 20px 40px rgba(0,0,0,0.6)' 
                  : '0 20px 40px rgba(0,0,0,0.1)',
                borderColor: tokens.color.primary,
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              background: glassTokens.background,
              backdropFilter: `blur(${tokens.glass.blur})`,
              borderBottom: `1px solid ${glassTokens.border}`,
              color: paletteTokens.onSurface,
              height: tokens.layout.navbarHeight,
              justifyContent: 'center',
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
