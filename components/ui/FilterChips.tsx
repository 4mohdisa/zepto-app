import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { COLOURS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export const FilterChips = React.memo(function FilterChips({
  options,
  selected,
  onSelect,
}: FilterChipsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={{
              height: 36,
              paddingHorizontal: SPACING.lg,
              borderRadius: RADIUS.full,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: isActive ? COLOURS.accent : COLOURS.border,
              backgroundColor: isActive ? COLOURS.accent : 'transparent',
            }}
          >
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.semibold.fontFamily,
                fontSize: FONT_SIZES.sm,
                color: isActive ? COLOURS.textOnAccent : COLOURS.textPrimary,
              }}
            >
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
});
