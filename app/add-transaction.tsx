import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { TransactionForm } from '@/components/TransactionForm';
import { AppText, LoadingView, ModalHeader } from '@/components/ui';
import { createTransaction } from '@/lib/data/mutations';
import { invalidateTransactions } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useCategories } from '@/lib/data/useCategories';
import { useMerchants } from '@/lib/data/useMerchants';
import { useSupabase } from '@/lib/supabase/useSupabase';
import type { TransactionInput } from '@/lib/data/mutations';
import { COLOURS, SPACING, RADIUS } from '@/constants/theme';

export default function AddTransactionScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Add Transaction" closeType="text" />
      {ready ? <AddTransactionContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function AddTransactionContent() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const db = useSupabase();
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { merchants, loading: merchantsLoading } = useMerchants();
  const { submitting, error: submitError, execute } = useMutationHandler();

  useEffect(() => {
    if (!isSignedIn || !user) router.replace('/(auth)/sign-in');
  }, [isSignedIn, user]);

  if (!isSignedIn || !user) return null;

  const handleSubmit = (input: TransactionInput) => {
    if (!user) return;
    execute(
      () => createTransaction(db, user.id, input),
      () => invalidateTransactions(),
    );
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl }}>
      {submitError && (
        <View style={{ marginBottom: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLOURS.errorLight }}>
          <AppText variant="caption" danger>{submitError}</AppText>
        </View>
      )}
      <TransactionForm
        categories={categories}
        categoriesLoading={categoriesLoading}
        merchants={merchants}
        merchantsLoading={merchantsLoading}
        submitLabel="Save Transaction"
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
