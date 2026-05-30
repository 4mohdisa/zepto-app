import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { COLOURS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';

interface DataRowProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  rightSubtext?: string;
  rightTextColor?: string;
  leftIcon?: React.ReactNode;
  leftIconBackground?: string;
  showDivider?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const DataRow = React.memo(function DataRow({
  title,
  subtitle,
  rightText,
  rightSubtext,
  rightTextColor = COLOURS.textPrimary,
  leftIcon,
  leftIconBackground = COLOURS.surfaceSecondary,
  showDivider = false,
  onPress,
  onLongPress,
}: DataRowProps) {
  const row = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: COLOURS.border,
      }}
    >
      {leftIcon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.full,
            backgroundColor: leftIconBackground,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: SPACING.md,
          }}
        >
          {leftIcon}
        </View>
      )}

      <View style={{ flex: 1, marginRight: SPACING.sm }}>
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.semibold.fontFamily,
            fontSize: FONT_SIZES.md,
            color: COLOURS.textPrimary,
          }}
          numberOfLines={1}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            style={{
              fontFamily: TYPOGRAPHY.body.fontFamily,
              fontSize: FONT_SIZES.sm,
              color: COLOURS.textMuted,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {(rightText || rightSubtext) && (
        <View style={{ alignItems: 'flex-end' }}>
          {rightText ? (
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.semibold.fontFamily,
                fontSize: FONT_SIZES.md,
                color: rightTextColor,
                textAlign: 'right',
              }}
            >
              {rightText}
            </AppText>
          ) : null}
          {rightSubtext ? (
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.body.fontFamily,
                fontSize: FONT_SIZES.sm,
                color: COLOURS.textMuted,
                textAlign: 'right',
                marginTop: 2,
              }}
            >
              {rightSubtext}
            </AppText>
          ) : null}
        </View>
      )}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => (pressed ? { opacity: 0.7 } : {})}
      >
        {row}
      </Pressable>
    );
  }

  return row;
});
