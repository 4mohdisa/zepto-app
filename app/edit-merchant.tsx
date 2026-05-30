import { useEffect, useState } from 'react';
import { Alert, InteractionManager, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/expo';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { AppButton, AppInput, AppText, LoadingView, ModalHeader, ModalFormWrapper } from '@/components/ui';
import { updateMerchant, deleteMerchant } from '@/lib/data/mutations';
import { invalidateMerchants, invalidateTransactions } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useMerchants } from '@/lib/data/useMerchants';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { SPACING } from '@/constants/theme';
import type { Merchant } from '@/types';

export default function EditMerchantScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Edit Merchant" />
      {ready ? <EditMerchantContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function EditMerchantContent() {
  const { user } = useUser();
  const db = useSupabase();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { submitting, error: mutationError, execute } = useMutationHandler();
  const { merchants } = useMerchants();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!id || !user?.id) return;
    let cancelled = false;

    async function load() {
      setFetchLoading(true);
      setFetchError(null);
      const { data, error: err } = await db
        .from('merchants')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (cancelled) return;
      if (err || !data) { setFetchError('Merchant not found.'); }
      else {
        const m = data as Merchant;
        setMerchant(m);
        setName(m.merchant_name);
      }
      setFetchLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id, user?.id]);

  const handleSave = () => {
    if (!name.trim()) { setValidationError('Name is required'); return; }
    if (!merchant || !user) return;
    const isDuplicate = merchants.some(
      (m) => m.id !== merchant.id && m.merchant_name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (isDuplicate) { setValidationError('A merchant with this name already exists'); return; }
    execute(
      () => updateMerchant(db, user.id, merchant.id, { merchant_name: name.trim() }),
      () => invalidateMerchants(),
    );
  };

  const handleDelete = () => {
    if (!merchant || !user) return;
    const txCount = merchant.transaction_count ?? 0;
    const msg = txCount > 0
      ? `"${merchant.merchant_name}" has ${txCount} transaction${txCount > 1 ? 's' : ''}. Deleting will remove the merchant from those records.`
      : `Delete "${merchant.merchant_name}"?`;

    Alert.alert('Delete Merchant', msg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => execute(
          () => deleteMerchant(db, user.id, merchant.id),
          () => { invalidateMerchants(); invalidateTransactions(); },
        ),
      },
    ]);
  };

  const displayError = mutationError || validationError;

  if (fetchLoading) return <LoadingView fullScreen />;

  if (fetchError) {
    return (
      <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: SPACING.xl }}>
        <AppText variant="body" muted style={{ textAlign: 'center' }}>{fetchError}</AppText>
      </View>
    );
  }

  return (
    <ModalFormWrapper>
      <View style={{ gap: SPACING.lg }}>
        <AppInput
          label="Merchant Name"
          placeholder="e.g. Netflix"
          value={name}
          onChangeText={(t) => { setName(t); setValidationError(''); }}
          autoCapitalize="words"
          returnKeyType="done"
        />

        {displayError ? <AppText variant="caption" danger style={{ textAlign: 'center' }}>{displayError}</AppText> : null}

        <AppButton title="Save Changes" onPress={handleSave} loading={submitting} disabled={submitting} style={{ marginTop: SPACING.sm }} />
        <AppButton title="Delete Merchant" variant="danger" onPress={handleDelete} disabled={submitting} />
      </View>
    </ModalFormWrapper>
  );
}
