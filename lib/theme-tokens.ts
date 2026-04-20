// Design Tokens - Shared between Client and Server components
export const tokens = {
  color: {
    primary: '#9333EA', // M3 Purple 600
    secondary: '#C084FC', // M3 Purple 400
    error: '#F43F5E', // Rose 500
    warning: '#F59E0B', // Amber 500
    info: '#3B82F6', // Blue 500
    success: '#22C55E', // Green 500
    dark: {
      background: '#0B0B0F',
      surface: '#12121A',
      surfaceContainerLow: '#181824',
      surfaceContainer: '#1F1F2E',
      surfaceContainerHigh: '#28283D',
      outline: 'rgba(255, 255, 255, 0.08)',
      onSurface: '#F5F5F7',
      onPrimary: '#FFFFFF', // Light text on deep purple primary
    },
    light: {
      background: '#F9FAFB',
      surface: '#FFFFFF',
      surfaceContainerLow: '#F3F4F6',
      surfaceContainer: '#E5E7EB',
      surfaceContainerHigh: '#D1D5DB',
      outline: 'rgba(0, 0, 0, 0.08)',
      onSurface: '#111827',
      onPrimary: '#FFFFFF',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    tight: 24, // Standardized Tight spacing
    lg: 24, 
    xl: 32,
    block: 40, // Standardized Block spacing
    xxl: 48,
    huge: 64,
    section: 64, // Standardized Section spacing
    section_large: 80,
    max: 120,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  glass: {
    blur: '12px',
    dark: {
      background: 'rgba(18, 18, 26, 0.75)',
      border: 'rgba(255, 255, 255, 0.06)',
      highlight: 'rgba(255, 255, 255, 0.03)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(0, 0, 0, 0.04)',
      highlight: 'rgba(0, 0, 0, 0.01)',
    }
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-be-vietnam), sans-serif',
      serif: 'var(--font-be-vietnam), sans-serif',
      mono: 'var(--font-mono), monospace',
    },
    h1: 'clamp(2.25rem, 8vw, 3.5rem)',
    h2: 'clamp(1.85rem, 6vw, 2.75rem)',
    h3: 'clamp(1.5rem, 4vw, 2rem)',
    h4: '1.375rem',
    h5: '1.125rem',
    h6: '1rem',
    body1: '1.125rem',
    body2: '1rem',
    caption: '0.875rem',
    label: '0.875rem',
  },
  lineHeight: {
    heading: 1.25,
    body: 1.75,
    code: 1.6,
  },
  curves: {
    standard: [0.2, 0, 0, 1] as [number, number, number, number],
    decelerate: [0, 0, 0, 1] as [number, number, number, number],
    accelerate: [0.3, 0, 1, 1] as [number, number, number, number],
  },
  transitions: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  },
  layout: {
    contentWidth: 1200,
    navbarHeight: 64,
  },
};
