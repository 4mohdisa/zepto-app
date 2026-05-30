import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLOURS, RADIUS, SPACING, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  /** Preferred prop name */
  label?: string;
  /** Backward-compatible alias for label */
  title?: string;
  variant?: Variant;
  size?: Size;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: ViewStyle;
}

const CONTAINER_STYLES: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: COLOURS.accent },
  secondary: { backgroundColor: COLOURS.surface, borderWidth: 1.5, borderColor: COLOURS.border },
  destructive: { backgroundColor: COLOURS.error },
  ghost: { backgroundColor: 'transparent' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLOURS.border },
  danger: { backgroundColor: COLOURS.error },
};

const TEXT_COLOURS: Record<Variant, string> = {
  primary: COLOURS.textOnAccent,
  secondary: COLOURS.textPrimary,
  destructive: COLOURS.textOnAccent,
  ghost: COLOURS.accent,
  outline: COLOURS.textPrimary,
  danger: COLOURS.textOnAccent,
};

const SPINNER_COLOURS: Record<Variant, string> = {
  primary: COLOURS.textOnAccent,
  secondary: COLOURS.textPrimary,
  destructive: COLOURS.textOnAccent,
  ghost: COLOURS.accent,
  outline: COLOURS.textPrimary,
  danger: COLOURS.textOnAccent,
};

const SIZE_CONTAINER: Record<Size, ViewStyle> = {
  sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, minHeight: 36 },
  md: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.md, minHeight: 44 },
  lg: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.lg, minHeight: 52 },
};

const SIZE_FONT: Record<Size, TextStyle> = {
  sm: { fontSize: FONT_SIZES.sm },
  md: { fontSize: FONT_SIZES.md },
  lg: { fontSize: FONT_SIZES.lg },
};

export function AppButton({
  label,
  title,
  variant = 'primary',
  size = 'lg',
  onPress,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  style,
}: AppButtonProps) {
  const text = label ?? title ?? '';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      className={className}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          ...CONTAINER_STYLES[variant],
          ...SIZE_CONTAINER[size],
          ...(isDisabled ? { opacity: 0.5 } : {}),
          ...(fullWidth ? { width: '100%' } : {}),
        } as ViewStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOURS[variant]} size="small" />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: SPACING.sm }}>{leftIcon}</View>}
          <AppText
            style={{
              fontFamily: TYPOGRAPHY.semibold.fontFamily,
              color: TEXT_COLOURS[variant],
              ...SIZE_FONT[size],
            }}
          >
            {text}
          </AppText>
          {rightIcon && <View style={{ marginLeft: SPACING.sm }}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
