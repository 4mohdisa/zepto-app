// TrackrAI Design System — single source of truth for all tokens
// Every component and screen imports from this file only.
// No colour, spacing, or radius value is ever hardcoded elsewhere.

export const COLOURS = {
  // Brand
  accent: '#295EFF',
  accentHover: '#1a4fd6',
  accentLight: '#295EFF1A',

  // Backgrounds
  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',

  // Borders
  border: '#E5E7EB',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnAccent: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Finance
  income: '#10B981',
  expense: '#EF4444',

  // Legacy aliases used by existing components
  foreground: '#111827',
  mutedText: '#6B7280',
  primary: '#295EFF',
  danger: '#EF4444',
  card: '#FFFFFF',
} as const;

export const TYPOGRAPHY = {
  heading: {
    fontFamily: 'DMSerifDisplay_400Regular',
  },
  body: {
    fontFamily: 'Inter_400Regular',
  },
  medium: {
    fontFamily: 'Inter_500Medium',
  },
  semibold: {
    fontFamily: 'Inter_600SemiBold',
  },
  bold: {
    fontFamily: 'Inter_700Bold',
  },
  mono: {
    fontFamily: 'SpaceMono',
  },
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const LINE_HEIGHTS = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
  display: 48,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const Z_INDEX = {
  base: 0,
  card: 10,
  overlay: 90,
  modal: 100,
  toast: 200,
} as const;

