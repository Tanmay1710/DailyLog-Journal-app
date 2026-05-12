/**
 * IconButton Component
 *
 * Header icon buttons used consistently across all wireframe nav bars.
 * Supports: ← back, ＋ add, ✎ edit, ⋯ overflow, ✓ save, ⌕ search, › chevron
 *
 * Wireframe reference: All 9 screens (nav bars)
 */

import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { radii } from '@constants/layout';
import { lightColors } from '@constants/colors';

type IconSymbol = '←' | '＋' | '✎' | '⋯' | '✓' | '⌕' | '›' | '⊕' | '✕';

interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: IconSymbol;
  /** Accessible label for the action (required for accessibility) */
  label: string;
  size?: number;
}

export function IconButton({
  icon,
  label,
  size = 36,
  accessibilityLabel,
  ...rest
}: IconButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      activeOpacity={0.7}
      style={{
        width: size,
        height: size,
        borderRadius: radii.sm,
        backgroundColor: lightColors.surface2,
        borderWidth: 1,
        borderColor: lightColors.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...rest}
    >
      <Text style={{ fontSize: size * 0.38, color: lightColors.muted }}>{icon}</Text>
    </TouchableOpacity>
  );
}
