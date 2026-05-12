/**
 * MultiChoiceInput Component
 *
 * Segmented button group for single-select multi-choice fields.
 * Matches Wireframe 4 (Entry Log — Theme: Calm | Family | Work).
 *
 * Wireframe reference: Screen 4 (Entry Log) — "Theme · Calm · Family · Work"
 */

import { Text, TouchableOpacity, View } from 'react-native';
import { radii } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface MultiChoiceInputProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
}

export function MultiChoiceInput({
  label,
  options,
  value,
  onChange,
  error,
}: MultiChoiceInputProps): JSX.Element {
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

      {/* Options row */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => {
          const isActive = value === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              accessibilityLabel={`${label}: ${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              activeOpacity={0.7}
              style={{
                flex: 1,
                minWidth: 80,
                borderRadius: radii.sm,
                borderWidth: 1,
                borderColor: isActive ? lightColors.accent : lightColors.line,
                backgroundColor: isActive ? lightColors.accent : lightColors.surface,
                paddingVertical: 13,
                paddingHorizontal: 14,
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
                {option}
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
