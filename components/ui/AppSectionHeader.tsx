import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { COLOURS, SPACING, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { AppText } from './AppText';

interface AppSectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
}

export function AppSectionHeader({ title, action, style }: AppSectionHeaderProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.sm,
          marginBottom: SPACING.sm,
        },
        style,
      ]}
    >
      <AppText
        style={{
          fontFamily: TYPOGRAPHY.bold.fontFamily,
          fontSize: FONT_SIZES.sm,
          color: COLOURS.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        {title}
      </AppText>

      {action && (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <AppText
            style={{
              fontFamily: TYPOGRAPHY.semibold.fontFamily,
              fontSize: FONT_SIZES.sm,
              color: COLOURS.accent,
            }}
          >
            {action.label}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
