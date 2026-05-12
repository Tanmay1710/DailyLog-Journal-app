/**
 * PillBar Component
 *
 * Horizontal scrollable pill tabs with active state.
 * Used for Active/Archived (Screen 1) and All/This Week/Streak (Screen 5) filters.
 *
 * Wireframe reference: Screens 1 (My Journals — Active / Archived),
 *                      Screen 5 (Entry History — All / This Week / Streak)
 */

import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { radii } from '@constants/layout';
import { lightColors } from '@constants/colors';

export interface Pill {
  label: string;
  key: string;
}

interface PillBarProps {
  pills: Pill[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function PillBar({ pills, activeKey, onChange }: PillBarProps): JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 12 }}
      contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingHorizontal: 1 }}
    >
      {pills.map((pill) => {
        const isActive = pill.key === activeKey;
        return (
          <TouchableOpacity
            key={pill.key}
            onPress={() => onChange(pill.key)}
            accessibilityLabel={pill.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.7}
            style={{
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: isActive ? lightColors.accent : lightColors.line,
              backgroundColor: isActive ? lightColors.accent : lightColors.surface,
              paddingHorizontal: 16,
              paddingVertical: 9,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: isActive ? lightColors.white : lightColors.text,
              }}
            >
              {pill.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
