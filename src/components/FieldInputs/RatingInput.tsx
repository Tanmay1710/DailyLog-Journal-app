/**
 * RatingInput Component
 *
 * Interactive 1-5 rating bubbles matching Wireframe 4 (Entry Log).
 * Tap a bubble to select; active bubble fills with accent color.
 *
 * Wireframe reference: Screen 4 (Entry Log) — "Mood rating · 1 2 3 4 5"
 */

import { Text, TouchableOpacity, View } from 'react-native';
import { radii } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface RatingInputProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  max?: number;
  error?: string;
}

export function RatingInput({
  label,
  value,
  onChange,
  max = 5,
  error,
}: RatingInputProps): JSX.Element {
  const bubbles = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Label */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: lightColors.muted,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>

      {/* Rating bubbles row */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {bubbles.map((num) => {
          const isActive = value === num;
          return (
            <TouchableOpacity
              key={num}
              onPress={() => onChange(num)}
              accessibilityLabel={`${label}: ${num} out of ${max}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              activeOpacity={0.7}
              style={{
                width: 34,
                height: 34,
                borderRadius: radii.full,
                borderWidth: 1,
                borderColor: isActive ? lightColors.accent : lightColors.line,
                backgroundColor: isActive ? lightColors.accent : lightColors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '400',
                  color: isActive ? lightColors.white : lightColors.text,
                }}
              >
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error message */}
      {error ? (
        <Text
          style={{
            fontSize: 12,
            color: lightColors.danger,
            marginTop: 4,
            marginLeft: 2,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
