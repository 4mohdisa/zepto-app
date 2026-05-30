import { useState } from 'react';
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppInput, AppSelect, AppText, DatePickerField } from '@/components/ui';
import { COLOURS } from '@/constants/theme';

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  category: string;
  accountType: string;
  amountMin: string;
  amountMax: string;
}

export const DEFAULT_FILTERS: FilterState = {
  dateFrom: '',
  dateTo: '',
  category: '',
  accountType: '',
  amountMin: '',
  amountMax: '',
};

export function isFiltersActive(filters: FilterState): boolean {
  return Object.values(filters).some((v) => v !== '');
}

export function activeFilterCount(filters: FilterState): number {
  return Object.values(filters).filter((v) => v !== '').length;
}

interface TransactionFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  categories: { label: string; value: string }[];
  currentFilters: FilterState;
}

const ACCOUNT_OPTIONS = [
  { label: 'All Accounts', value: '' },
  { label: 'Checking', value: 'Checking' },
  { label: 'Savings', value: 'Savings' },
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Investment', value: 'Investment' },
];

export function TransactionFilters({
  visible,
  onClose,
  onApply,
  onReset,
  categories,
  currentFilters,
}: TransactionFiltersProps) {
  const [local, setLocal] = useState<FilterState>(currentFilters);

  const set = (field: keyof FilterState) => (value: string) => {
    setLocal((f) => ({ ...f, [field]: value }));
  };

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setLocal(currentFilters)}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        onPress={onClose}
      >
        <Pressable className="bg-background rounded-t-3xl" style={{ maxHeight: '85%' }} onPress={() => {}}>
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
            <AppText variant="h2" className="text-2xl">Filters</AppText>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={COLOURS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
            <View className="gap-4 pb-8">
              {/* Date Range */}
              <AppText variant="label" className="mb-1">Date Range</AppText>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <DatePickerField
                    label="From"
                    value={local.dateFrom}
                    onChange={set('dateFrom')}
                    placeholder="Start date"
                  />
                </View>
                <View className="flex-1">
                  <DatePickerField
                    label="To"
                    value={local.dateTo}
                    onChange={set('dateTo')}
                    placeholder="End date"
                  />
                </View>
              </View>

              {/* Category */}
              <AppSelect
                label="Category"
                value={local.category}
                options={categoryOptions}
                placeholder="All Categories"
                onChange={set('category')}
              />

              {/* Account Type */}
              <AppSelect
                label="Account Type"
                value={local.accountType}
                options={ACCOUNT_OPTIONS}
                placeholder="All Accounts"
                onChange={set('accountType')}
              />

              {/* Amount Range */}
              <AppText variant="label" className="mb-1">Amount Range</AppText>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <AppInput
                    label="Min"
                    placeholder="0"
                    value={local.amountMin}
                    onChangeText={set('amountMin')}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <AppInput
                    label="Max"
                    placeholder="Any"
                    value={local.amountMax}
                    onChangeText={set('amountMax')}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Buttons */}
              <AppButton
                title="Apply Filters"
                onPress={() => onApply(local)}
                size="md"
                className="mt-2"
              />
              <AppButton
                title="Reset All"
                variant="ghost"
                onPress={() => {
                  setLocal(DEFAULT_FILTERS);
                  onReset();
                }}
                size="md"
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
