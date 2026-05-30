import React, { useState } from 'react';
import { TextInput, View, TextInputProps, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { COLOURS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export function AppInput({
  label,
  error,
  disabled = false,
  containerStyle,
  multiline,
  style,
  ...textInputProps
}: AppInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? COLOURS.error
    : focused
    ? COLOURS.accent
    : COLOURS.border;

  return (
    <View style={[{ marginBottom: SPACING.lg }, containerStyle]}>
      {label ? (
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.semibold.fontFamily,
            fontSize: FONT_SIZES.sm,
            color: COLOURS.textSecondary,
            marginBottom: 6,
          }}
        >
          {label}
        </AppText>
      ) : null}

      <TextInput
        {...textInputProps}
        editable={!disabled}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          textInputProps.onBlur?.(e);
        }}
        placeholderTextColor={COLOURS.textMuted}
        style={[
          {
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.md,
            color: COLOURS.textPrimary,
            backgroundColor: disabled ? '#F9FAFB' : COLOURS.surface,
            borderWidth: 1.5,
            borderColor,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.lg,
            opacity: disabled ? 0.6 : 1,
          },
          multiline
            ? { minHeight: 100, paddingVertical: SPACING.md, textAlignVertical: 'top' as const }
            : { height: 48 },
          style,
        ]}
      />

      {error ? (
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.xs,
            color: COLOURS.error,
            marginTop: 4,
          }}
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
