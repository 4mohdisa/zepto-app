import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText } from './AppText';
import { COLOURS, SPACING } from '@/constants/theme';

interface LoadingViewProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingView({ message, fullScreen = false }: LoadingViewProps) {
  return (
    <View
      style={{
        flex: fullScreen ? 1 : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl,
      }}
    >
      <ActivityIndicator color={COLOURS.accent} size="large" />
      {message && (
        <AppText variant="caption" muted style={{ marginTop: SPACING.md }}>
          {message}
        </AppText>
      )}
    </View>
  );
}
