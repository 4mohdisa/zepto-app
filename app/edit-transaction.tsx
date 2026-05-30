import { useAuth, useUser } from '@clerk/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { TransactionForm } from '@/components/TransactionForm';
import { AppText, LoadingView, ModalHeader } from '@/components/ui';
import { deleteTransaction, updateTransaction } from '@/lib/data/mutations';
import { invalidateTransactions } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useCategories } from '@/lib/data/useCategories';
import { useMerchants } from '@/lib/data/useMerchants';
import { useSupabase } from '@/lib/supabase/useSupabase';
import type { TransactionInput } from '@/lib/data/mutations';
import type { Transaction } from '@/types';
import { COLOURS, SPACING, RADIUS } from '@/constants/theme';

export default function EditTransactionScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Edit Transaction" closeType="text" />
      {ready ? <EditTransactionContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function EditTransactionContent() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSupabase();
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { merchants, loading: merchantsLoading } = useMerchants();
  const { submitting, error: submitError, execute } = useMutationHandler();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) router.replace('/(auth)/sign-in');
  }, [isSignedIn]);

  useEffect(() => {
    if (!id || !isSignedIn) return;
    let cancelled = false;

    async function load() {
      setFetchLoading(true);
      setFetchError(null);
      const { data, error } = await db
        .from('transactions')
        .select('*')
        .eq('id', Number(id))
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) setFetchError('Transaction not found.');
      else setTx(data as Transaction);
      setFetchLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id, isSignedIn]);

  const handleSubmit = (input: TransactionInput) => {
    if (!tx || !user) return;
    execute(
      () => updateTransaction(db, user.id, tx.id, input),
      () => invalidateTransactions(),
    );
  };

  const handleDelete = () => {
    if (!tx || !user) return;
    execute(
      () => deleteTransaction(db, user.id, tx.id),
      () => invalidateTransactions(),
    );
  };

  if (fetchLoading) return <LoadingView fullScreen />;

  if (fetchError) {
    return (
      <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: SPACING.xl }}>
        <AppText variant="body" muted style={{ textAlign: 'center' }}>{fetchError}</AppText>
      </View>
    );
  }

  if (!tx) return null;

  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl }}>
      {submitError && (
        <View style={{ marginBottom: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLOURS.errorLight }}>
          <AppText variant="caption" danger>{submitError}</AppText>
        </View>
      )}
      <TransactionForm
        initialValues={{
          name: tx.name,
          amount: String(tx.amount),
          type: tx.type,
          date: tx.date,
          category_id: tx.category_id ? String(tx.category_id) : '',
          account_type: tx.account_type ?? '',
          description: tx.description ?? '',
          merchant_id: tx.merchant_id ?? '',
        }}
        categories={categories}
        categoriesLoading={categoriesLoading}
        merchants={merchants}
        merchantsLoading={merchantsLoading}
        submitLabel="Save Changes"
        submitting={submitting}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </View>
  );
}
