/**
 * TextInput Component
 *
 * Styled text input wrapper with label, multiline support, and error state.
 *
 * Wireframe reference: Screens 2 (New Journal), 4 (Entry Log)
 */

import { useState } from 'react';
import { TextInput as RNTextInput, type TextInputProps as RNTextInputProps, Text, View } from 'react-native';
import { radii, shadows } from '@constants/layout';
import { lightColors } from '@constants/colors';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label: string;
  error?: string;
}

export function FieldTextInput({
  label,
  error,
  value,
  placeholder,
  multiline = false,
  ...rest
}: TextInputProps): JSX.Element {
  const [isFocused, setIsFocused] = useState(false);

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

      {/* Input */}
      <RNTextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={lightColors.muted}
        multiline={multiline}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: error
            ? lightColors.danger
            : isFocused
              ? lightColors.accent
              : lightColors.line,
          backgroundColor: lightColors.surface,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 14 : 12,
          fontSize: 16,
          color: lightColors.text,
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          ...shadows.card,
        }}
        accessibilityLabel={label}
        accessibilityHint={error ?? `Enter ${label.toLowerCase()}`}
        {...rest}
      />

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
