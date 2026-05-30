import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  View,
  ViewStyle,
} from 'react-native';
import { COLOURS, RADIUS, SPACING, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { AppText } from './AppText';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  contentStyle?: ViewStyle;
}

export function AppBottomSheet({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  contentStyle,
}: AppBottomSheetProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 0,
          duration: 300,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: backdropOpacity,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLOURS.surface,
            borderTopLeftRadius: RADIUS.xl,
            borderTopRightRadius: RADIUS.xl,
            transform: [{ translateY: slideY }],
            maxHeight: SCREEN_HEIGHT * 0.92,
          }}
        >
          {showHandle && (
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: COLOURS.border,
                borderRadius: RADIUS.full,
                alignSelf: 'center',
                marginTop: 12,
                marginBottom: 4,
              }}
            />
          )}

          {title && (
            <View
              style={{
                paddingHorizontal: SPACING.xl,
                paddingVertical: SPACING.lg,
                borderBottomWidth: 1,
                borderBottomColor: COLOURS.surfaceSecondary,
              }}
            >
              <AppText
                style={{
                  fontFamily: TYPOGRAPHY.bold.fontFamily,
                  fontSize: FONT_SIZES.lg,
                  color: COLOURS.textPrimary,
                }}
              >
                {title}
              </AppText>
            </View>
          )}

          <ScrollView
            style={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg }}
            contentContainerStyle={[{ paddingBottom: 40 }, contentStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
