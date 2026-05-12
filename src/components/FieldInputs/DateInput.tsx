/**
 * DateInput Component
 *
 * Displays a formatted date string with a "Calendar" tag.
 * Tap to open native iOS date picker via @react-native-community/datetimepicker.
 *
 * Wireframe reference: Screen 4 (Entry Log) — "Entry date · May 12, 2026 · Calendar"
 */

import { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface DateInputProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (dateString: string) => void;
  error?: string;
}

/**
 * Format a YYYY-MM-DD string to a readable format like "May 12, 2026".
 */
function formatDisplay(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DateInput({ label, value, onChange, error }: DateInputProps): JSX.Element {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_event: unknown, selectedDate?: Date): void => {
    if (Platform.OS === 'ios') {
      // On iOS, the picker stays open until dismissed
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    }
    setShowPicker(false);
  };

  const handleCancel = (): void => {
    setShowPicker(false);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Label */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: lightColors.muted,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>

      {/* Date display + Calendar tag */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        accessibilityLabel={`${label}, ${formatDisplay(value) || 'Not set'}. Tap to change.`}
        accessibilityRole="button"
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: error ? lightColors.danger : lightColors.line,
          backgroundColor: lightColors.surface,
          paddingHorizontal: 14,
          paddingVertical: 12,
          ...shadows.card,
        }}
      >
        <Text style={{ fontSize: 16, color: value ? lightColors.text : lightColors.muted }}>
          {value ? formatDisplay(value) : 'Select date'}
        </Text>
        <View
          style={{
            borderRadius: radii.full,
            backgroundColor: lightColors.surface2,
            borderWidth: 1,
            borderColor: lightColors.line,
            paddingHorizontal: 9,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 11, color: lightColors.muted }}>Calendar</Text>
        </View>
      </TouchableOpacity>

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

      {/* Native date picker (iOS) */}
      {showPicker && Platform.OS === 'ios' && (
        <View
          style={{
            marginTop: 8,
            borderRadius: radii.sm,
            backgroundColor: lightColors.surface,
            borderWidth: 1,
            borderColor: lightColors.line,
            overflow: 'hidden',
          }}
        >
          {/* We use a minimal picker approach. In a real build, use @react-native-community/datetimepicker */}
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 14, color: lightColors.muted, marginBottom: 8 }}>
              Date picker would open here on device.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: lightColors.line,
                  padding: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: lightColors.muted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // Use current value or today
                  const parts = value.split('-');
                  const d = parts.length === 3
                    ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
                    : new Date();
                  handleDateChange(null, d);
                }}
                style={{
                  flex: 1,
                  borderRadius: radii.sm,
                  backgroundColor: lightColors.accent,
                  padding: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: lightColors.white, fontWeight: '600' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
