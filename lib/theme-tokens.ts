// Design Tokens - Shared between Client and Server components.
// Source color: #9333EA (M3 Purple 600). Tonal ramps approximated from that
// source using M3 HCT so M3's role-based surfaces, containers, and state
// layers have real values to bind to — not just two tones.

const purpleTones = {
  0: '#000000',
  10: '#2B0B4E',
  20: '#441A78',
  30: '#5E2AA2',
  40: '#7A35CC',
  50: '#9333EA',
  60: '#A855F7',
  70: '#B978F8',
  80: '#C99CFA',
  90: '#E9D5FF',
  95: '#F3E8FF',
  99: '#FEF7FF',
  100: '#FFFFFF',
};

const neutralTones = {
  0: '#000000',
  4: '#0B0B10',
  6: '#101018',
  10: '#1A1A22',
  12: '#1E1E28',
  17: '#26262F',
  20: '#2C2C36',
  22: '#30303A',
  24: '#343440',
  87: '#E0DDE4',
  90: '#E7E4EC',
  92: '#ECE9F0',
  94: '#F0EDF3',
  95: '#F3F0F6',
  96: '#F5F2F8',
  98: '#FBF8FD',
  99: '#FEFBFF',
  100: '#FFFFFF',
};

const errorTones = {
  10: '#410002',
  20: '#690005',
  30: '#93000A',
  40: '#BA1A1A',
  80: '#FFB4AB',
  90: '#FFDAD6',
};

export const tokens = {
  // Legacy flat entries — kept because existing components reference them.
  color: {
    primary: purpleTones[50],
    secondary: purpleTones[70],
    error: errorTones[40],
    warning: '#F59E0B',
    info: '#3B82F6',
    success: '#22C55E',

    // M3 dark scheme — tonal roles.
    dark: {
      background: neutralTones[4],
      surface: neutralTones[6],
      surfaceContainerLow: neutralTones[10],
      surfaceContainer: neutralTones[12],
      surfaceContainerHigh: neutralTones[17],
      outline: 'rgba(255, 255, 255, 0.12)',
      onSurface: '#F5F5F7',

      primary: purpleTones[80],
      onPrimary: purpleTones[20],
      primaryContainer: purpleTones[30],
      onPrimaryContainer: purpleTones[90],
      secondary: purpleTones[80],
      onSecondary: purpleTones[20],
      secondaryContainer: purpleTones[30],
      onSecondaryContainer: purpleTones[90],
      tertiary: '#F5A7CA',
      onTertiary: '#4B1438',
      tertiaryContainer: '#693251',
      onTertiaryContainer: '#FFD8E7',
      errorContainer: errorTones[30],
      onErrorContainer: errorTones[90],

      surfaceDim: neutralTones[4],
      surfaceBright: neutralTones[24],
      surfaceContainerLowest: neutralTones[0],
      surfaceContainerHighest: neutralTones[22],
      surfaceVariant: neutralTones[20],
      onSurfaceVariant: '#C8C4CF',
      outlineVariant: 'rgba(255, 255, 255, 0.06)',
      inverseSurface: neutralTones[90],
      inverseOnSurface: neutralTones[20],
      inversePrimary: purpleTones[40],
    },

    light: {
      background: neutralTones[98],
      surface: neutralTones[99],
      surfaceContainerLow: neutralTones[96],
      surfaceContainer: neutralTones[94],
      surfaceContainerHigh: neutralTones[92],
      outline: 'rgba(0, 0, 0, 0.12)',
      onSurface: '#111827',

      primary: purpleTones[40],
      onPrimary: '#FFFFFF',
      primaryContainer: purpleTones[90],
      onPrimaryContainer: purpleTones[10],
      secondary: purpleTones[40],
      onSecondary: '#FFFFFF',
      secondaryContainer: purpleTones[95],
      onSecondaryContainer: purpleTones[10],
      tertiary: '#8A365C',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#FFD8E7',
      onTertiaryContainer: '#3B0723',
      errorContainer: '#FFDAD6',
      onErrorContainer: errorTones[10],

      surfaceDim: neutralTones[87],
      surfaceBright: neutralTones[98],
      surfaceContainerLowest: neutralTones[100],
      surfaceContainerHighest: neutralTones[90],
      surfaceVariant: neutralTones[90],
      onSurfaceVariant: '#49454F',
      outlineVariant: 'rgba(0, 0, 0, 0.06)',
      inverseSurface: neutralTones[20],
      inverseOnSurface: neutralTones[95],
      inversePrimary: purpleTones[80],
    },
  },

  // M3 state-layer opacities — applied on top of role colors for
  // hover/focus/pressed/dragged states.
  state: {
    hover: 0.08,
    focus: 0.12,
    pressed: 0.12,
    dragged: 0.16,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    tight: 24,
    lg: 24,
    xl: 32,
    block: 40,
    xxl: 48,
    huge: 64,
    section: 64,
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

  // Liquid Glass v2 — iOS 26 / visionOS-style surfaces.
  // Stronger blur, saturation boost, and a gradient border for specular feel.
  glass: {
    blur: '12px', // legacy alias
    blurLg: '24px',
    saturate: '180%',
    dark: {
      background: 'rgba(18, 18, 26, 0.55)',
      backgroundSolid: 'rgba(18, 18, 26, 0.75)', // fallback when backdrop-filter unsupported
      border: 'rgba(255, 255, 255, 0.08)',
      borderTop: 'rgba(255, 255, 255, 0.22)', // specular highlight
      borderBottom: 'rgba(255, 255, 255, 0.04)',
      highlight: 'rgba(255, 255, 255, 0.04)',
      innerGlow: 'rgba(255, 255, 255, 0.12)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.55)',
      backgroundSolid: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(0, 0, 0, 0.06)',
      borderTop: 'rgba(255, 255, 255, 0.9)',
      borderBottom: 'rgba(0, 0, 0, 0.04)',
      highlight: 'rgba(255, 255, 255, 0.6)',
      innerGlow: 'rgba(255, 255, 255, 0.8)',
      shadow: '0 8px 32px rgba(15, 15, 18, 0.08)',
    },
  },

  typography: {
    fontFamily: {
      sans: 'var(--font-be-vietnam), sans-serif',
      serif: 'var(--font-be-vietnam), sans-serif',
      mono: 'var(--font-mono), monospace',
    },
    // Headings: all fluid via clamp() for consistent responsive rhythm.
    h1: 'clamp(2.25rem, 8vw, 3.5rem)',
    h2: 'clamp(1.85rem, 6vw, 2.75rem)',
    h3: 'clamp(1.5rem, 4vw, 2rem)',
    h4: 'clamp(1.25rem, 3vw, 1.5rem)',
    h5: 'clamp(1.0625rem, 2vw, 1.25rem)',
    h6: 'clamp(1rem, 1.5vw, 1.125rem)',
    body1: '1.0625rem',
    body2: '0.9375rem',
    caption: '0.8125rem',
    label: '0.875rem',
    // M3 letter-spacing — tightened headings, neutral body, widened micro-text.
    tracking: {
      displayLarge: '-0.02em',
      displayMedium: '-0.015em',
      displaySmall: '-0.01em',
      headline: '-0.005em',
      body: '0em',
      label: '0.01em',
      micro: '0.08em',
    },
  },
  // Line-heights tuned for Vietnamese diacritics — tighter than English to
  // avoid excessive leading while leaving room for dấu and mũ.
  lineHeight: {
    display: 1.15,
    heading: 1.25,
    body: 1.6,
    code: 1.6,
  },

  curves: {
    standard: [0.2, 0, 0, 1] as [number, number, number, number],
    decelerate: [0, 0, 0, 1] as [number, number, number, number],
    accelerate: [0.3, 0, 1, 1] as [number, number, number, number],
    // M3 emphasized easing for expressive motion.
    emphasized: [0.2, 0, 0, 1] as [number, number, number, number],
    emphasizedDecelerate: [0.05, 0.7, 0.1, 1] as [number, number, number, number],
    emphasizedAccelerate: [0.3, 0, 0.8, 0.15] as [number, number, number, number],
  },
  transitions: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  },

  // M3 duration tokens — pick by motion intent, not raw milliseconds.
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
    extraLong3: 900,
    extraLong4: 1000,
  },

  layout: {
    contentWidth: 1200,
    navbarHeight: 64,
  },
};
