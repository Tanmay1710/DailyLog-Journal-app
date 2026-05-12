/**
 * Button Component
 *
 * Three variants matching wireframe styles:
 * - primary:   Emerald filled, white text, rounded-3xl, shadow (main CTAs)
 * - secondary: Border only, slate text, transparent background (secondary actions)
 * - danger:    Rose border, rose text (destructive actions)
 *
 * Wireframe reference: All 9 screens
 */

import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: lightColors.accent,
    text: lightColors.white,
    border: lightColors.accent,
  },
  secondary: {
    bg: 'transparent',
    text: lightColors.text,
    border: lightColors.line,
  },
  danger: {
    bg: lightColors.dangerSoft,
    text: lightColors.danger,
    border: lightColors.danger,
  },
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  ...rest
}: ButtonProps): JSX.Element {
  const style = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      activeOpacity={0.7}
      style={{
        backgroundColor: isDisabled ? lightColors.surface3 : style.bg,
        borderColor: isDisabled ? lightColors.line : style.border,
        borderWidth: 1,
        borderRadius: radii.lg,
        paddingVertical: 13,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.6 : 1,
        ...shadows.card,
      }}
      {...rest}
    >
      <Text
        style={{
          color: isDisabled ? lightColors.muted : style.text,
          fontSize: 16,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}
