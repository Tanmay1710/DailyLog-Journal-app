/**
 * HeroCard Component
 *
 * Gradient-backed hero card with optional metric badge in top-right corner.
 * Matches wireframe hero cards on Screens 1, 3, and 6.
 *
 * Wireframe reference:
 *   Screen 1 (My Journals — "Keep your streak alive")
 *   Screen 3 (Journal Detail — "12 day streak")
 *   Screen 6 (Profile — "Aman Sharma")
 */

import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface HeroCardProps {
  /** Section label like "Today", "Journal summary", "Account" */
  sectionLabel?: string;
  /** Primary headline text */
  title: string;
  /** Subtitle / description */
  subtitle?: string;
  /** Optional metric badge in top-right (e.g., <MetricBadge />) */
  metric?: ReactNode;
  /** Background color (defaults to a gradient from surface to accentSoft) */
  backgroundColor?: string;
  /** Children rendered below title/subtitle for additional content */
  children?: ReactNode;
}

export function HeroCard({
  sectionLabel,
  title,
  subtitle,
  metric,
  backgroundColor,
  children,
}: HeroCardProps): JSX.Element {
  return (
    <View
      style={{
        borderRadius: radii.lg,
        backgroundColor: backgroundColor ?? lightColors.surface,
        borderWidth: 1,
        borderColor: lightColors.line,
        padding: 16,
        ...shadows.card,
      }}
    >
      {/* Top row: section label (left) + optional metric (right) */}
      {sectionLabel || metric ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {sectionLabel ? (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: lightColors.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              {sectionLabel}
            </Text>
          ) : (
            <View />
          )}
          {metric ?? null}
        </View>
      ) : null}

      {/* Title */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          color: lightColors.text,
          letterSpacing: -0.3,
          marginBottom: subtitle ? 4 : 0,
        }}
      >
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle ? (
        <Text style={{ fontSize: 13, color: lightColors.muted }}>{subtitle}</Text>
      ) : null}

      {/* Children */}
      {children ? <View style={{ marginTop: 12 }}>{children}</View> : null}
    </View>
  );
}
