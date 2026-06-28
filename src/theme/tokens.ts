/**
 * Design tokens — single source of truth for the PrepMeal design system.
 * Mirrors docs/03-design-system.md. Components must consume semantic tokens
 * (via useTheme()), never raw primitives directly.
 */

// 2.1 Color — primitives
export const palette = {
  brand500: '#10B981',
  brand600: '#059669',
  brand700: '#047857',
  ink900: '#0F172A',
  ink700: '#334155',
  ink500: '#64748B',
  ink300: '#CBD5E1',
  ink100: '#F1F5F9',
  white: '#FFFFFF',
  black: '#000000',
  // 2.4 dark surfaces
  darkCanvas: '#0B1220',
  darkSurface: '#131C2B',
  darkElevated: '#1B2638',
  darkText: '#E2E8F0',
  darkTextSecondary: '#94A3B8',
  darkBorder: '#2A3850',
} as const;

// 2.2 Macro colors — fixed semantics across the whole app
export const macroColors = {
  protein: '#6366F1',
  carbs: '#F59E0B',
  fat: '#EF4444',
  calories: '#0F172A',
} as const;

// 2.3 Feedback
export const feedback = {
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
} as const;

// 2.6 Spacing (base-4 scale)
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

// 2.7 Radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// 2.5 Typography scale (size / lineHeight / weight)
export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const;

export type TypographyVariant = keyof typeof typography;

// 2.8 Motion
export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;
