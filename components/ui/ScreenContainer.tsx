import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControlProps, ScrollView, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /** Wraps content in KeyboardAvoidingView — use for screens with form inputs */
  keyboardAware?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = false,
  className = '',
  refreshControl,
  keyboardAware = false,
  ...props
}: ScreenContainerProps) {
  const content = scrollable ? (
    <ScrollView
      className={`flex-1 ${className}`}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      {...props}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${className}`} {...props}>
      {children}
    </View>
  );

  const wrapped = keyboardAware ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      {content}
    </KeyboardAvoidingView>
  ) : content;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {wrapped}
    </SafeAreaView>
  );
}
