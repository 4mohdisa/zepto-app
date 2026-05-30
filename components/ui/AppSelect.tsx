import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText } from './AppText';
import { COLOURS, FONT_SIZES, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function AppSelect({
  label,
  value,
  options,
  placeholder = 'Select\u2026',
  onChange,
  error,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const selectedLabel = options.find((o) => o.value === value)?.label;
  const hasValue = Boolean(value);

  const borderColor = error ? COLOURS.error : COLOURS.border;

  useEffect(() => {
    if (open) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [open]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
    });
  };

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
    });
  };

  return (
    <View style={{ gap: 6, marginBottom: SPACING.lg }}>
      {label && (
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.semibold.fontFamily,
            fontSize: FONT_SIZES.sm,
            color: COLOURS.textSecondary,
            marginBottom: 2,
          }}
        >
          {label}
        </AppText>
      )}

      <TouchableOpacity
        onPress={() => { slideAnim.setValue(400); setOpen(true); }}
        activeOpacity={0.8}
        style={{
          height: 48,
          paddingHorizontal: SPACING.lg,
          borderRadius: RADIUS.md,
          borderWidth: 1.5,
          borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLOURS.surface,
        }}
      >
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.md,
            color: hasValue ? COLOURS.textPrimary : COLOURS.textMuted,
          }}
        >
          {selectedLabel ?? placeholder}
        </AppText>
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.sm,
            color: COLOURS.textMuted,
          }}
        >
          ▾
        </AppText>
      </TouchableOpacity>

      {error ? (
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.xs,
            color: COLOURS.error,
            marginTop: 4,
          }}
        >
          {error}
        </AppText>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={handleClose}
        >
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Pressable
              style={{
                backgroundColor: COLOURS.surface,
                borderTopLeftRadius: RADIUS.xl,
                borderTopRightRadius: RADIUS.xl,
              }}
              onPress={() => {}}
            >
              {/* Handle + header */}
              <View style={{ alignItems: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.xs }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: COLOURS.border }} />
              </View>
              <View
                style={{
                  paddingHorizontal: SPACING.xxl,
                  paddingVertical: SPACING.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: COLOURS.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <AppText
                  style={{
                    fontFamily: TYPOGRAPHY.semibold.fontFamily,
                    fontSize: FONT_SIZES.lg,
                    color: COLOURS.textPrimary,
                  }}
                >
                  {label ?? 'Select'}
                </AppText>
                <TouchableOpacity onPress={handleClose}>
                  <AppText
                    style={{
                      fontFamily: TYPOGRAPHY.medium.fontFamily,
                      fontSize: FONT_SIZES.sm,
                      color: COLOURS.textMuted,
                    }}
                  >
                    Done
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Options list */}
              <ScrollView
                style={{ maxHeight: 340 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => handleSelect(opt.value)}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: SPACING.xxl,
                        paddingVertical: SPACING.lg,
                        borderBottomWidth: 1,
                        borderBottomColor: COLOURS.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? COLOURS.accentLight : 'transparent',
                      }}
                    >
                      <AppText
                        style={{
                          fontFamily: isSelected ? TYPOGRAPHY.semibold.fontFamily : TYPOGRAPHY.body.fontFamily,
                          fontSize: FONT_SIZES.md,
                          color: isSelected ? COLOURS.accent : COLOURS.textPrimary,
                        }}
                      >
                        {opt.label}
                      </AppText>
                      {isSelected && (
                        <AppText
                          style={{
                            fontFamily: TYPOGRAPHY.semibold.fontFamily,
                            fontSize: FONT_SIZES.sm,
                            color: COLOURS.accent,
                          }}
                        >
                          ✓
                        </AppText>
                      )}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: SPACING.xxxl }} />
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
