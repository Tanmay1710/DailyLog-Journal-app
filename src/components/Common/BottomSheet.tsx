/**
 * BottomSheet Component
 *
 * Modal overlay sheet for field type selection (New Journal).
 * Provides presets with descriptions, validation copy, and example input.
 *
 * Wireframe reference: Screen 2 (New Journal — field type selection)
 */

import { type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(31, 28, 24, 0.35)',
          justifyContent: 'flex-end',
        }}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        {/* Sheet */}
        <Pressable
          onPress={() => {
            /* prevent close when tapping sheet content */
          }}
          style={{
            backgroundColor: lightColors.surface,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            borderWidth: 1,
            borderColor: lightColors.line,
            borderBottomWidth: 0,
            maxHeight: '70%',
            ...shadows.elevated,
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: radii.full,
                backgroundColor: lightColors.line,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: lightColors.line,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: lightColors.text,
              }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close" accessibilityRole="button">
              <Text style={{ fontSize: 18, color: lightColors.muted }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
