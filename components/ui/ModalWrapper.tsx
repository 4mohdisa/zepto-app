import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOURS } from '@/constants/theme';

interface ModalWrapperProps {
  children: React.ReactNode;
}

/**
 * Modal container with safe area insets.
 * Presentation: 'card' fills the full screen — SafeAreaView provides top/bottom insets.
 */
export function ModalWrapper({ children }: ModalWrapperProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOURS.surface }} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}
