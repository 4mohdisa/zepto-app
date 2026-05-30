import { useEffect, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { useUser } from '@clerk/expo';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { AppButton, AppInput, AppSelect, AppText, DatePickerField, LoadingView, ModalHeader, ModalFormWrapper } from '@/components/ui';
import { createRecurringTransaction } from '@/lib/data/mutations';
import type { RecurringTransactionInput } from '@/lib/data/mutations';
import { invalidateRecurring } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useCategories } from '@/lib/data/useCategories';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { isValidDate } from '@/lib/utils/format';
import { SPACING } from '@/constants/theme';
import type { TransactionType, RecurringFrequency } from '@/types';

const TYPE_OPTIONS = [
  { label: 'Expense', value: 'Expense' },
  { label: 'Income', value: 'Income' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Bi-Weekly', value: 'Bi-Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Yearly', value: 'Yearly' },
];

const ACCOUNT_OPTIONS = [
  { label: 'Checking', value: 'Checking' },
  { label: 'Savings', value: 'Savings' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Credit Card', value: 'Credit Card' },
];

interface FormState {
  name: string;
  amount: string;
  type: string;
  frequency: string;
  account_type: string;
  start_date: string;
  end_date: string;
  category_id: string;
  description: string;
}

const emptyForm: FormState = {
  name: '', amount: '', type: 'Expense', frequency: 'Monthly',
  account_type: 'Checking', start_date: '', end_date: '', category_id: '', description: '',
};

export default function AddRecurringScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Add Recurring" />
      {ready ? <AddRecurringContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function AddRecurringContent() {
  const { user } = useUser();
  const db = useSupabase();
  const { submitting, error: mutationError, execute, clearError } = useMutationHandler();
  const { categories } = useCategories();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
    clearError();
  };

  const categoryOptions = [
    { label: 'No category', value: '' },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const handleCreate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    if (!form.start_date || !isValidDate(form.start_date)) errs.start_date = 'Enter a valid date (YYYY-MM-DD)';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!user) return;

    const selectedCat = form.category_id ? categories.find((c) => String(c.id) === form.category_id) : null;

    const input: RecurringTransactionInput = {
      name: form.name.trim(),
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      type: form.type as TransactionType,
      frequency: form.frequency as RecurringFrequency,
      account_type: form.account_type,
      start_date: form.start_date,
      end_date: form.end_date || null,
      category_id: selectedCat?.id ?? null,
      category_name: selectedCat?.name ?? null,
      merchant_id: null,
      description: form.description.trim() || null,
    };

    execute(
      () => createRecurringTransaction(db, user.id, input),
      () => invalidateRecurring(),
    );
  };

  return (
    <ModalFormWrapper>
      <View style={{ gap: SPACING.lg }}>
        <AppInput label="Name" placeholder="e.g. Netflix" value={form.name} onChangeText={set('name')} error={errors.name} returnKeyType="next" blurOnSubmit={false} />
        <AppInput label="Amount" placeholder="0.00" value={form.amount} onChangeText={set('amount')} keyboardType="decimal-pad" error={errors.amount} returnKeyType="done" />
        <AppSelect label="Type" value={form.type} options={TYPE_OPTIONS} onChange={set('type')} />
        <AppSelect label="Frequency" value={form.frequency} options={FREQUENCY_OPTIONS} onChange={set('frequency')} />
        <AppSelect label="Account" value={form.account_type} options={ACCOUNT_OPTIONS} onChange={set('account_type')} />
        <AppSelect label="Category" value={form.category_id} options={categoryOptions} placeholder="No category" onChange={set('category_id')} />
        <DatePickerField label="Start Date" value={form.start_date} onChange={set('start_date')} error={errors.start_date} />
        <DatePickerField label="End Date (optional)" value={form.end_date} onChange={set('end_date')} placeholder="No end date" />
        <AppInput label="Description (optional)" placeholder="Notes" value={form.description} onChangeText={set('description')} returnKeyType="done" />

        {mutationError ? <AppText variant="caption" danger style={{ textAlign: 'center' }}>{mutationError}</AppText> : null}

        <AppButton title="Create Recurring" onPress={handleCreate} loading={submitting} disabled={submitting} style={{ marginTop: SPACING.sm }} />
      </View>
    </ModalFormWrapper>
  );
}
