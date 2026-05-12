/**
 * Toast Component
 *
 * Slide-up toast notification for success/error/info messages.
 * Auto-dismisses after 3 seconds by default.
 *
 * Wireframe reference: All screens (draft saves, entry saves, errors)
 */

import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const typeStyles: Record<ToastType, { bg: string; text: string }> = {
  success: {
    bg: lightColors.accentSoft,
    text: lightColors.accent,
  },
  error: {
    bg: lightColors.dangerSoft,
    text: lightColors.danger,
  },
  info: {
    bg: lightColors.surface2,
    text: lightColors.text,
  },
};

export function Toast({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps): null | JSX.Element {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Slide in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, translateY, opacity, onDismiss]);

  if (!visible) return null;

  const style = typeStyles[type];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        borderRadius: radii.lg,
        backgroundColor: style.bg,
        borderWidth: 1,
        borderColor: lightColors.line,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY }],
        opacity,
        ...shadows.elevated,
      }}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: style.text, textAlign: 'center' }}>
        {message}
      </Text>
    </Animated.View>
  );
}
