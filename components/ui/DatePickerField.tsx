import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { AppText } from './AppText';
import { COLOURS, FONT_SIZES, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function parseISO(iso: string): { day: number; month: number; year: number } {
  const [y, m, d] = iso.split('-').map(Number);
  if (y && m && d) return { day: d, month: m, year: y };
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
}

function toISO(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toDisplay(iso: string): string {
  const { day, month, year } = parseISO(iso);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  label?: string;
  value: string; // ISO format YYYY-MM-DD
  onChange: (isoDate: string) => void;
  error?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const MIN_YEAR = 2020;
const MAX_YEAR = 2030;

export function DatePickerField({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select date',
  containerStyle,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  const parsed = parseISO(value);
  const [selDay, setSelDay] = useState(parsed.day);
  const [selMonth, setSelMonth] = useState(parsed.month);
  const [selYear, setSelYear] = useState(parsed.year);

  const borderColor = error ? COLOURS.error : COLOURS.border;
  const hasValue = Boolean(value);

  useEffect(() => {
    if (open) {
      const p = parseISO(value);
      setSelDay(p.day);
      setSelMonth(p.month);
      setSelYear(p.year);
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
    }).start(() => setOpen(false));
  };

  const handleDone = () => {
    // Clamp day to valid range for the selected month/year
    const maxDay = daysInMonth(selMonth, selYear);
    const clampedDay = Math.min(selDay, maxDay);
    onChange(toISO(clampedDay, selMonth, selYear));
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  // ─── Day / Month / Year data ─────────────────────────────────────────────

  const maxDay = daysInMonth(selMonth, selYear);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const months = MONTHS.map((name, i) => ({ label: name, value: i + 1 }));
  const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

  return (
    <View style={[{ marginBottom: SPACING.lg }, containerStyle]}>
      {label ? (
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.semibold.fontFamily,
            fontSize: FONT_SIZES.sm,
            color: COLOURS.textSecondary,
            marginBottom: 6,
          }}
        >
          {label}
        </AppText>
      ) : null}

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
          {hasValue ? toDisplay(value) : placeholder}
        </AppText>
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.sm,
            color: COLOURS.textMuted,
          }}
        >
          📅
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

      {/* ─── Picker Modal ─── */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={handleClose}>
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
              {/* Handle */}
              <View style={{ alignItems: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.xs }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: COLOURS.border }} />
              </View>

              {/* Header */}
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
                  {label ?? 'Select Date'}
                </AppText>
                <TouchableOpacity onPress={handleDone}>
                  <AppText
                    style={{
                      fontFamily: TYPOGRAPHY.semibold.fontFamily,
                      fontSize: FONT_SIZES.md,
                      color: COLOURS.accent,
                    }}
                  >
                    Done
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Picker columns */}
              <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
                {/* Day */}
                <PickerColumn
                  data={days}
                  selected={selDay}
                  onSelect={setSelDay}
                  renderLabel={(d) => String(d)}
                  flex={1}
                />

                {/* Month */}
                <PickerColumn
                  data={months.map((m) => m.value)}
                  selected={selMonth}
                  onSelect={setSelMonth}
                  renderLabel={(v) => MONTHS[v - 1]}
                  flex={2}
                />

                {/* Year */}
                <PickerColumn
                  data={years}
                  selected={selYear}
                  onSelect={setSelYear}
                  renderLabel={(y) => String(y)}
                  flex={1}
                />
              </View>

              <View style={{ height: SPACING.xxxl }} />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Picker Column ───────────────────────────────────────────────────────────

interface PickerColumnProps<T extends number> {
  data: T[];
  selected: T;
  onSelect: (val: T) => void;
  renderLabel: (val: T) => string;
  flex: number;
}

function PickerColumn<T extends number>({
  data,
  selected,
  onSelect,
  renderLabel,
  flex,
}: PickerColumnProps<T>) {
  const flatListRef = useRef<FlatList<T>>(null);
  const initialIndex = data.indexOf(selected);

  useEffect(() => {
    const idx = data.indexOf(selected);
    if (idx >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: idx,
          animated: false,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, [data, selected]);

  return (
    <View style={{ flex, height: PICKER_HEIGHT }}>
      {/* Selection highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          backgroundColor: COLOURS.accentLight,
          borderRadius: RADIUS.sm,
        }}
      />
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => String(item)}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
        }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(idx, data.length - 1));
          if (data[clamped] !== undefined) {
            onSelect(data[clamped]);
          }
        }}
        renderItem={({ item }) => {
          const isSelected = item === selected;
          return (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                const idx = data.indexOf(item);
                if (idx >= 0 && flatListRef.current) {
                  flatListRef.current.scrollToIndex({
                    index: idx,
                    animated: true,
                    viewPosition: 0.5,
                  });
                }
              }}
              activeOpacity={0.7}
              style={{
                height: ITEM_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AppText
                style={{
                  fontFamily: isSelected
                    ? TYPOGRAPHY.semibold.fontFamily
                    : TYPOGRAPHY.body.fontFamily,
                  fontSize: isSelected ? FONT_SIZES.md : FONT_SIZES.sm,
                  color: isSelected ? COLOURS.accent : COLOURS.textMuted,
                }}
              >
                {renderLabel(item)}
              </AppText>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
