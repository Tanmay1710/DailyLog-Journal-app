/**
 * DailyLog Design Tokens — Spacing, Border Radius, Shadows
 *
 * Matches the wireframe spacing system from dailylog-wireframes.html.
 */

/** Spacing scale (multiples of 4) */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

/** Border radius values matching wireframe — `--radius: 24px`, `--radius-sm: 16px` */
export const radii = {
  /** Cards, sheets, toasts — 24px */
  lg: 24,
  /** Inputs, pills, smaller containers — 16px */
  sm: 16,
  /** Tags, small badges — 999px (pill shape) */
  full: 999,
} as const;

/** Shadow preset matching wireframe `--shadow: 0 16px 50px rgba(31, 28, 24, 0.08)` */
export const shadows = {
  card: {
    shadowColor: '#1f1c18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#1f1c18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

/** Icon sizes for IconButton */
export const iconSizes = {
  sm: 18,
  md: 22,
  lg: 26,
} as const;
