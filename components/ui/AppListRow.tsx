import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLOURS, RADIUS, SPACING, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { AppText } from './AppText';

interface AppListRowProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightSubLabel?: string;
  rightLabelColour?: string;
  leftIcon?: React.ReactNode;
  leftIconBackground?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showDivider?: boolean;
  style?: ViewStyle;
}

export function AppListRow({
  title,
  subtitle,
  rightLabel,
  rightSubLabel,
  rightLabelColour = COLOURS.textPrimary,
  leftIcon,
  leftIconBackground = COLOURS.surfaceSecondary,
  onPress,
  showChevron = false,
  showDivider = false,
  style,
}: AppListRowProps) {
  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          backgroundColor: COLOURS.surface,
        },
        style,
      ]}
    >
      {leftIcon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.md,
            backgroundColor: leftIconBackground,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: SPACING.md,
          }}
        >
          {leftIcon}
        </View>
      )}

      <View style={{ flex: 1 }}>
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
        {subtitle && (
          <AppText
            style={{
              fontFamily: TYPOGRAPHY.body.fontFamily,
              fontSize: FONT_SIZES.sm,
              color: COLOURS.textSecondary,
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </AppText>
        )}
      </View>

      {(rightLabel || rightSubLabel) && (
        <View style={{ alignItems: 'flex-end', marginLeft: SPACING.sm }}>
          {rightLabel && (
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.semibold.fontFamily,
                fontSize: FONT_SIZES.md,
                color: rightLabelColour,
                textAlign: 'right',
              }}
            >
              {rightLabel}
            </AppText>
          )}
          {rightSubLabel && (
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.body.fontFamily,
                fontSize: FONT_SIZES.xs,
                color: COLOURS.textMuted,
                textAlign: 'right',
                marginTop: 1,
              }}
            >
              {rightSubLabel}
            </AppText>
          )}
        </View>
      )}

      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={COLOURS.textMuted}
          style={{ marginLeft: SPACING.xs }}
        />
      )}
    </View>
  );

  return (
    <>
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => pressed ? { opacity: 0.7 } : {}}
        >
          {content}
        </Pressable>
      ) : content}
      {showDivider && (
        <View
          style={{
            height: 1,
            backgroundColor: COLOURS.surfaceSecondary,
            marginLeft: leftIcon ? 68 : SPACING.lg,
          }}
        />
      )}
    </>
  );
}
