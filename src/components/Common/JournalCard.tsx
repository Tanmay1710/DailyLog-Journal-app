/**
 * JournalCard Component
 *
 * Reusable journal card with emoji icon, title, description, and meta tags.
 * Matches Wireframe 1 (My Journals — 🌿 Gratitude · 5 fields · Daily · 7:30 PM).
 *
 * Wireframe reference: Screen 1 (My Journals)
 */

import { Text, TouchableOpacity, View } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface JournalCardProps {
  emoji?: string;
  title: string;
  description?: string;
  tags?: string[];
  onPress: () => void;
  /** Whether this journal is pinned */
  pinned?: boolean;
}

export function JournalCard({
  emoji,
  title,
  description,
  tags = [],
  onPress,
  pinned = false,
}: JournalCardProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={`${title}${description ? `, ${description}` : ''}${pinned ? ', Pinned' : ''}`}
      accessibilityRole="button"
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        gap: 12,
        borderRadius: radii.lg,
        backgroundColor: lightColors.surface,
        borderWidth: 1,
        borderColor: lightColors.line,
        padding: 14,
        ...shadows.card,
      }}
    >
      {/* Emoji icon */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.sm,
          backgroundColor: lightColors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>{emoji ?? '📓'}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* Title row with optional pinned indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: lightColors.text,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {pinned ? (
            <Text style={{ fontSize: 12, color: lightColors.accent }}>📌</Text>
          ) : null}
        </View>

        {/* Description */}
        {description ? (
          <Text
            style={{
              fontSize: 13,
              color: lightColors.muted,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {description}
          </Text>
        ) : null}

        {/* Meta tags */}
        {tags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {tags.map((tag) => (
              <View
                key={tag}
                style={{
                  borderRadius: radii.full,
                  backgroundColor: lightColors.surface2,
                  borderWidth: 1,
                  borderColor: lightColors.line,
                  paddingHorizontal: 9,
                  paddingVertical: 5,
                }}
              >
                <Text style={{ fontSize: 11, color: lightColors.muted }}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
