/**
 * InlineBanner Component
 *
 * Static banner for contextual information (draft status, notification preview,
 * deep-link welcome, error state). Unlike Toast, this is persistent and
 * does not auto-dismiss.
 *
 * Wireframe reference: Screens 4, 7, 8
 */

import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { radii } from '@constants/layout';
import { lightColors } from '@constants/colors';

type BannerVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface InlineBannerProps {
  message: string;
  variant?: BannerVariant;
  /** Optional secondary text below the message */
  secondary?: string;
  /** Optional action element (e.g., a "Discard" button) */
  action?: ReactNode;
  /** Optional icon/emoji prefix */
  icon?: string;
}

const variantStyles: Record<BannerVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: lightColors.surface,
    text: lightColors.text,
    border: lightColors.line,
  },
  success: {
    bg: lightColors.accentSoft,
    text: lightColors.accent,
    border: lightColors.accentSoft,
  },
  warning: {
    bg: '#fdf3e0',
    text: lightColors.warning,
    border: '#f5dbb4',
  },
  danger: {
    bg: lightColors.dangerSoft,
    text: lightColors.danger,
    border: lightColors.dangerSoft,
  },
  info: {
    bg: lightColors.surface2,
    text: lightColors.muted,
    border: lightColors.line,
  },
};

export function InlineBanner({
  message,
  variant = 'default',
  secondary,
  action,
  icon,
}: InlineBannerProps): JSX.Element {
  const style = variantStyles[variant];

  return (
    <View
      style={{
        borderRadius: radii.sm,
        backgroundColor: style.bg,
        borderWidth: 1,
        borderColor: style.border,
        padding: 12,
      }}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Text style={{ fontSize: 16 }}>{icon}</Text> : null}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: style.text }}>{message}</Text>
            {secondary ? (
              <Text
                style={{
                  fontSize: 11,
                  color: style.text,
                  opacity: 0.8,
                  marginTop: 2,
                }}
              >
                {secondary}
              </Text>
            ) : null}
          </View>
        </View>
        {action ?? null}
      </View>
    </View>
  );
}
