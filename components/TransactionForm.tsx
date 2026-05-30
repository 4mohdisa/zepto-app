import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { AppButton, AppInput, AppSelect, AppText, DatePickerField } from '@/components/ui';
import { getTodayISO, isValidDate } from '@/lib/utils/format';
import { SPACING } from '@/constants/theme';
import type { TransactionInput } from '@/lib/data/mutations';
import type { AccountType, Category, Merchant, TransactionType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: 'Expense', value: 'Expense' },
  { label: 'Income', value: 'Income' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Savings', value: 'Savings' },
  { label: 'Checking', value: 'Checking' },
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Investment', value: 'Investment' },
  { label: 'Other', value: 'Other' },
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  amount: string;
  type: string;
  date: string; // stored in ISO format YYYY-MM-DD
  category_id: string;
  account_type: string;
  description: string;
  merchant_id: string;
}

interface FormErrors {
  name?: string;
  amount?: string;
  type?: string;
  date?: string;
}

function defaultValues(initial?: Partial<FormState>): FormState {
  return {
    name: initial?.name ?? '',
    amount: initial?.amount ?? '',
    type: initial?.type ?? 'Expense',
    date: initial?.date ?? getTodayISO(),
    category_id: initial?.category_id ?? '',
    account_type: initial?.account_type ?? '',
    description: initial?.description ?? '',
    merchant_id: initial?.merchant_id ?? '',
  };
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  const amt = parseFloat(form.amount);
  if (!form.amount || isNaN(amt) || amt <= 0)
    errors.amount = 'Enter a valid positive amount';
  if (!form.type) errors.type = 'Select a type';
  if (!form.date || !isValidDate(form.date))
    errors.date = 'Select a valid date';
  return errors;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TransactionFormProps {
  initialValues?: Partial<FormState>;
  categories: Category[];
  categoriesLoading?: boolean;
  merchants?: Merchant[];
  merchantsLoading?: boolean;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (input: TransactionInput) => void;
  onDelete?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionForm({
  initialValues,
  categories,
  categoriesLoading,
  merchants = [],
  merchantsLoading = false,
  submitLabel = 'Save Transaction',
  submitting = false,
  onSubmit,
  onDelete,
}: TransactionFormProps) {
  const [form, setForm] = useState<FormState>(() => defaultValues(initialValues));
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (field: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const categoryOptions = [
    { label: 'No category', value: '' },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const merchantOptions = [
    { label: 'No merchant', value: '' },
    ...merchants.map((m) => ({ label: m.merchant_name, value: m.id })),
  ];

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const selectedCategory = form.category_id
      ? categories.find((c) => String(c.id) === form.category_id)
      : null;

    const input: TransactionInput = {
      name: form.name.trim(),
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      type: form.type as TransactionType,
      date: form.date.trim(),
      category_id: selectedCategory?.id ?? null,
      category_name: selectedCategory?.name ?? null,
      account_type: (form.account_type as AccountType) || null,
      description: form.description.trim() || null,
      merchant_id: form.merchant_id || null,
    };

    onSubmit(input);
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Transaction',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 200 }}
    >
      <View style={{ gap: SPACING.lg }}>
        <AppInput
          label="Name"
          placeholder="e.g. Grocery run"
          value={form.name}
          onChangeText={set('name')}
          error={errors.name}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <AppInput
          label="Amount"
          placeholder="0.00"
          value={form.amount}
          onChangeText={set('amount')}
          error={errors.amount}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />

        <AppSelect
          label="Type"
          value={form.type}
          options={TYPE_OPTIONS}
          onChange={set('type')}
          error={errors.type}
        />

        <DatePickerField
          label="Date"
          value={form.date}
          onChange={set('date')}
          error={errors.date}
        />

        <AppSelect
          label="Category"
          value={form.category_id}
          options={categoriesLoading ? [] : categoryOptions}
          placeholder={categoriesLoading ? 'Loading...' : 'No category'}
          onChange={set('category_id')}
        />

        <AppSelect
          label="Account"
          value={form.account_type}
          options={ACCOUNT_TYPE_OPTIONS}
          placeholder="No account"
          onChange={set('account_type')}
        />

        <AppSelect
          label="Merchant (optional)"
          value={form.merchant_id}
          options={merchantsLoading ? [] : merchantOptions}
          placeholder={merchantsLoading ? 'Loading...' : 'No merchant'}
          onChange={set('merchant_id')}
        />

        <AppInput
          label="Description (optional)"
          placeholder="Add a note"
          value={form.description}
          onChangeText={set('description')}
          multiline
          numberOfLines={3}
          autoCapitalize="sentences"
          returnKeyType="done"
          blurOnSubmit
        />

        <AppButton
          title={submitLabel}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: SPACING.sm }}
        />

        {onDelete && (
          <AppButton
            title="Delete Transaction"
            variant="danger"
            onPress={handleDeletePress}
            disabled={submitting}
          />
        )}
      </View>
    </ScrollView>
  );
}
