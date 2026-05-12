/**
 * MetricBadge Component
 *
 * Small card displaying a label + large value/emoji.
 * Used for streak, entry count, best streak metrics.
 *
 * Wireframe reference: Screens 1, 3, 5 (streak keeper, entry counts)
 */

import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface MetricBadgeProps {
  /** Label text (e.g., "Streak", "Entries") */
  label: string;
  /** Primary value displayed large */
  value: string | number;
  /** Optional emoji suffix/prefix for visual flair */
  emoji?: string;
  /** Background color override */
  backgroundColor?: string;
  /** Optional callback to render a custom value node instead of a string */
  children?: ReactNode;
}

export function MetricBadge({
  label,
  value,
  emoji,
  backgroundColor,
  children,
}: MetricBadgeProps): JSX.Element {
  return (
    <View
      style={{
        borderRadius: radii.sm,
        backgroundColor: backgroundColor ?? lightColors.surface2,
        borderWidth: 1,
        borderColor: lightColors.line,
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
      }}
    >
      {/* Value */}
      {children ?? (
        <Text style={{ fontSize: 22, fontWeight: '800', color: lightColors.text }}>
          {value}
          {emoji ? ` ${emoji}` : ''}
        </Text>
      )}

      {/* Label */}
      <Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: lightColors.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
