import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SPACING } from '@/constants/theme';

interface ModalFormWrapperProps {
  children: React.ReactNode;
}

export function ModalFormWrapper({ children }: ModalFormWrapperProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: SPACING.xl,
          paddingTop: SPACING.xl,
          paddingBottom: 200,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
