import React from 'react';
import { View } from 'react-native';
import { COLOURS, RADIUS, SPACING, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

interface AppEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function AppEmptyState({ icon, title, subtitle, action }: AppEmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.section,
        paddingHorizontal: SPACING.xxxl,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: RADIUS.lg,
          backgroundColor: COLOURS.surfaceSecondary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: SPACING.lg,
        }}
      >
        {icon}
      </View>

      <AppText
        style={{
          fontFamily: TYPOGRAPHY.bold.fontFamily,
          fontSize: FONT_SIZES.lg,
          color: COLOURS.textPrimary,
          textAlign: 'center',
          marginBottom: SPACING.sm,
        }}
      >
        {title}
      </AppText>

      {subtitle && (
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.md,
            color: COLOURS.textSecondary,
            textAlign: 'center',
            marginBottom: SPACING.xxl,
          }}
        >
          {subtitle}
        </AppText>
      )}

      {action && (
        <AppButton
          label={action.label}
          onPress={action.onPress}
          size="sm"
          variant="primary"
        />
      )}
    </View>
  );
}
