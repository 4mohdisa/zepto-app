import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { COLOURS, FONT_SIZES, LINE_HEIGHTS, TYPOGRAPHY } from '@/constants/theme';

type TextVariant = 'display' | 'heading' | 'subheading' | 'body' | 'bodyLarge' | 'label' | 'caption' |
  // legacy variants kept for backward compatibility
  'h1' | 'h2' | 'h3';
type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextAlign = 'left' | 'center' | 'right';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  size?: TextSize;
  colour?: string;
  weight?: TextWeight;
  align?: TextAlign;
  // Convenience colour flags (kept for backward compat)
  muted?: boolean;
  accent?: boolean;
  success?: boolean;
  danger?: boolean;
  // Pass-through className for NativeWind
  className?: string;
}

const VARIANT_STYLES: Record<string, TextStyle> = {
  display: {
    fontFamily: TYPOGRAPHY.heading.fontFamily,
    fontSize: FONT_SIZES.display,
    lineHeight: LINE_HEIGHTS.display,
    color: COLOURS.textPrimary,
  },
  heading: {
    fontFamily: TYPOGRAPHY.heading.fontFamily,
    fontSize: FONT_SIZES.xxl,
    lineHeight: LINE_HEIGHTS.xxl,
    color: COLOURS.textPrimary,
  },
  subheading: {
    fontFamily: TYPOGRAPHY.semibold.fontFamily,
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.lg,
    color: COLOURS.textPrimary,
  },
  bodyLarge: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.lg,
    color: COLOURS.textPrimary,
  },
  body: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.md,
    color: COLOURS.textPrimary,
  },
  label: {
    fontFamily: TYPOGRAPHY.semibold.fontFamily,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.md,
    color: COLOURS.textPrimary,
  },
  caption: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.sm,
    color: COLOURS.textSecondary,
  },
  // Legacy variants
  h1: {
    fontFamily: TYPOGRAPHY.heading.fontFamily,
    fontSize: FONT_SIZES.xxxl,
    lineHeight: LINE_HEIGHTS.xxxl,
    color: COLOURS.textPrimary,
  },
  h2: {
    fontFamily: TYPOGRAPHY.heading.fontFamily,
    fontSize: FONT_SIZES.xxl,
    lineHeight: LINE_HEIGHTS.xxl,
    color: COLOURS.textPrimary,
  },
  h3: {
    fontFamily: TYPOGRAPHY.semibold.fontFamily,
    fontSize: FONT_SIZES.xl,
    lineHeight: LINE_HEIGHTS.xl,
    color: COLOURS.textPrimary,
  },
};

const SIZE_OVERRIDE: Record<TextSize, Pick<TextStyle, 'fontSize' | 'lineHeight'>> = {
  xs: { fontSize: FONT_SIZES.xs, lineHeight: LINE_HEIGHTS.xs },
  sm: { fontSize: FONT_SIZES.sm, lineHeight: LINE_HEIGHTS.sm },
  md: { fontSize: FONT_SIZES.md, lineHeight: LINE_HEIGHTS.md },
  lg: { fontSize: FONT_SIZES.lg, lineHeight: LINE_HEIGHTS.lg },
  xl: { fontSize: FONT_SIZES.xl, lineHeight: LINE_HEIGHTS.xl },
  xxl: { fontSize: FONT_SIZES.xxl, lineHeight: LINE_HEIGHTS.xxl },
};

const WEIGHT_FAMILY: Record<TextWeight, string> = {
  regular: TYPOGRAPHY.body.fontFamily,
  medium: TYPOGRAPHY.medium.fontFamily,
  semibold: TYPOGRAPHY.semibold.fontFamily,
  bold: TYPOGRAPHY.bold.fontFamily,
};

export function AppText({
  variant = 'body',
  size,
  colour,
  weight,
  align,
  muted,
  accent,
  success,
  danger,
  className = '',
  style,
  children,
  ...props
}: AppTextProps) {
  const base = VARIANT_STYLES[variant] ?? VARIANT_STYLES.body;

  const derivedColour = colour
    ?? (accent ? COLOURS.accent
      : success ? COLOURS.success
      : danger ? COLOURS.error
      : muted ? COLOURS.textMuted
      : undefined);

  const computed: TextStyle = {
    ...base,
    ...(size ? SIZE_OVERRIDE[size] : {}),
    ...(weight ? { fontFamily: WEIGHT_FAMILY[weight] } : {}),
    ...(align ? { textAlign: align } : {}),
    ...(derivedColour ? { color: derivedColour } : {}),
  };

  return (
    <Text
      className={className}
      style={[computed, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
