import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { COLOURS, SPACING } from '@/constants/theme';

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  closeType?: 'icon' | 'text';
}

export function ModalHeader({ title, onClose, closeType = 'icon' }: ModalHeaderProps) {
  const router = useRouter();
  const handleClose = onClose ?? (() => router.back());

  return (
    <>
      <View style={{ alignItems: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.sm }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: COLOURS.border }} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: COLOURS.border,
        }}
      >
        <AppText variant="h2">{title}</AppText>
        <TouchableOpacity onPress={handleClose} hitSlop={12}>
          {closeType === 'text' ? (
            <AppText variant="label" muted>Cancel</AppText>
          ) : (
            <Ionicons name="close" size={24} color={COLOURS.textPrimary} />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}
