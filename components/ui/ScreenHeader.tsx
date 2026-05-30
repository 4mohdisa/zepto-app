import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { COLOURS, SPACING } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightIconColor?: string;
  rightIconSize?: number;
}

export function ScreenHeader({
  title,
  onBack,
  rightIcon,
  onRightPress,
  rightIconColor,
  rightIconSize = 32,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xxl,
        paddingTop: SPACING.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={onBack ?? (() => router.back())}
          hitSlop={12}
          style={{ marginRight: SPACING.md }}
        >
          <Ionicons name="arrow-back" size={24} color={COLOURS.textPrimary} />
        </Pressable>
        <AppText variant="h2">{title}</AppText>
      </View>
      {rightIcon && onRightPress && (
        <Pressable onPress={onRightPress} hitSlop={8}>
          <Ionicons
            name={rightIcon}
            size={rightIconSize}
            color={rightIconColor ?? COLOURS.accent}
          />
        </Pressable>
      )}
    </View>
  );
}
