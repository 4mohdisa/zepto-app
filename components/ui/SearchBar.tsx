import React from 'react';
import { Pressable, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLOURS, FONT_SIZES, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

export const SearchBar = React.memo(function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  containerStyle,
}: SearchBarProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: COLOURS.border,
          borderRadius: RADIUS.md,
          backgroundColor: COLOURS.surface,
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.lg,
        },
        containerStyle,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={COLOURS.textMuted}
        style={{ marginRight: SPACING.sm }}
      />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        placeholderTextColor={COLOURS.textMuted}
        style={{
          flex: 1,
          height: 44,
          fontFamily: TYPOGRAPHY.body.fontFamily,
          fontSize: FONT_SIZES.md,
          color: COLOURS.textPrimary,
        }}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={COLOURS.textMuted} />
        </Pressable>
      )}
    </View>
  );
});
