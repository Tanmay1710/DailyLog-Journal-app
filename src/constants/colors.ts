/**
 * DailyLog Design Tokens — Color Palette
 *
 * Matches the wireframe color system from dailylog-wireframes.html.
 * Supports light and dark mode via ThemeContext.
 */

export const lightColors = {
  /** Page background — warm off-white */
  bg: '#f6f4ef',
  /** Card surface white */
  surface: '#fcfbf8',
  /** Slightly darker surface for secondary areas */
  surface2: '#f0ede7',
  /** Card borders and dividers */
  surface3: '#e8e3db',
  /** Primary text */
  text: '#26231d',
  /** Secondary/muted text */
  muted: '#706b63',
  /** Separator lines and card borders */
  line: '#d8d1c6',
  /** Primary accent — teal/emerald */
  accent: '#0d6b68',
  /** Soft accent background tint */
  accentSoft: '#d9ebe8',
  /** Success states */
  success: '#437a22',
  /** Warning states */
  warning: '#b3741a',
  /** Danger/destructive states */
  danger: '#a04254',
  /** Soft danger background tint */
  dangerSoft: '#fce8eb',
  /** White for overlays */
  white: '#ffffff',
  /** Near-black for dark text */
  black: '#1f1c18',
} as const;

export const darkColors = {
  bg: '#181715',
  surface: '#201f1c',
  surface2: '#2a2825',
  surface3: '#33302b',
  text: '#f1eee8',
  muted: '#b3ada5',
  line: '#44403a',
  accent: '#61a8a2',
  accentSoft: '#243633',
  success: '#78a95b',
  warning: '#d8a455',
  danger: '#d17988',
  dangerSoft: '#3d1c24',
  white: '#201f1c',
  black: '#f1eee8',
} as const;

export type ColorScheme = typeof lightColors;
