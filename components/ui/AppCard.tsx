import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { COLOURS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';

type PaddingSize = 'none' | 'sm' | 'md' | 'lg';
type ShadowSize = 'none' | 'sm' | 'md';

interface AppCardProps {
  children: React.ReactNode;
  padding?: PaddingSize;
  onPress?: () => void;
  style?: ViewStyle;
  shadow?: ShadowSize;
  /** NativeWind className for backward compat */
  className?: string;
}

const PADDING_VALUES: Record<PaddingSize, number> = {
  none: 0,
  sm: SPACING.md,
  md: SPACING.lg,
  lg: SPACING.xl,
};

export function AppCard({
  children,
  padding = 'md',
  onPress,
  style,
  shadow = 'none',
  className = '',
}: AppCardProps) {
  const base: ViewStyle = {
    backgroundColor: COLOURS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLOURS.border,
    padding: PADDING_VALUES[padding],
    ...(shadow !== 'none' ? SHADOWS[shadow] : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { opacity: 0.85 }, style]}
        className={className}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[base, style]}
      className={className}
    >
      {children}
    </View>
  );
}
