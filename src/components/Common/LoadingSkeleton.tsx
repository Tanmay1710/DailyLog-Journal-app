/**
 * LoadingSkeleton Component
 *
 * Placeholder shimmer elements for loading states.
 * Provides card-shaped and text-line-shaped variants.
 *
 * Wireframe reference: Screen 9 (Component System — loading states)
 */

import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { radii } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface LoadingSkeletonProps {
  /** Number of skeleton lines to render */
  lines?: number;
  /** Width of the skeleton in pixels (omit for full width) */
  width?: number;
  /** Height per line (default: 14) */
  lineHeight?: number;
  /** If true, renders a card-shaped skeleton */
  card?: boolean;
}

function SkeletonLine({
  width,
  height,
}: {
  width?: number | string;
  height: number;
}): JSX.Element {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (

    <View style={{ width: width ?? '100%' } as import('react-native').ViewStyle}>
      <Animated.View
        style={{
          height,
          borderRadius: radii.sm,
          backgroundColor: lightColors.line,
          opacity,
        }}
      />
    </View>
  );
}

export function LoadingSkeleton({
  lines = 3,
  width,
  lineHeight = 14,
  card = false,
}: LoadingSkeletonProps): JSX.Element {
  if (card) {
    return (
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          padding: 16,
          gap: 10,
        }}
        accessibilityLabel="Loading"
      >
        <SkeletonLine width={120} height={16} />
        <SkeletonLine height={lineHeight} />
        <SkeletonLine width={160} height={lineHeight} />
        <SkeletonLine width={100} height={lineHeight} />
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }} accessibilityLabel="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={width ?? (i === lines - 1 ? 160 : undefined)}
          height={lineHeight}
        />
      ))}
    </View>
  );
}

