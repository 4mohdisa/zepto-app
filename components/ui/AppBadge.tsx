import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLOURS, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { AppText } from './AppText';

type BadgeVariant = 'income' | 'expense' | 'neutral' | 'primary' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md';

interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  income: { bg: COLOURS.successLight, text: '#059669' },
  expense: { bg: COLOURS.errorLight, text: '#DC2626' },
  neutral: { bg: COLOURS.surfaceSecondary, text: COLOURS.textSecondary },
  primary: { bg: COLOURS.accentLight, text: COLOURS.accent },
  warning: { bg: COLOURS.warningLight, text: '#D97706' },
  error: { bg: COLOURS.errorLight, text: '#DC2626' },
};

const SIZE_STYLES: Record<BadgeSize, { px: number; py: number; fontSize: number }> = {
  sm: { px: 8, py: 2, fontSize: FONT_SIZES.xs },
  md: { px: 12, py: 4, fontSize: FONT_SIZES.sm },
};

export function AppBadge({ label, variant = 'neutral', size = 'md', style }: AppBadgeProps) {
  const { bg, text } = VARIANT_STYLES[variant];
  const { px, py, fontSize } = SIZE_STYLES[size];

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: RADIUS.full,
          paddingHorizontal: px,
          paddingVertical: py,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <AppText
        style={{
          fontFamily: TYPOGRAPHY.semibold.fontFamily,
          fontSize,
          color: text,
        }}
      >
        {label}
      </AppText>
    </View>
  );
}
