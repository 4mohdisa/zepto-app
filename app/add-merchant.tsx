import { useEffect, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { useUser } from '@clerk/expo';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { AppButton, AppInput, AppText, LoadingView, ModalHeader, ModalFormWrapper } from '@/components/ui';
import { createMerchant } from '@/lib/data/mutations';
import { invalidateMerchants } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useMerchants } from '@/lib/data/useMerchants';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { SPACING } from '@/constants/theme';

export default function AddMerchantScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Add Merchant" />
      {ready ? <AddMerchantContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function AddMerchantContent() {
  const { user } = useUser();
  const db = useSupabase();
  const { submitting, error, execute, clearError } = useMutationHandler();
  const { merchants } = useMerchants();

  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) { setValidationError('Name is required'); return; }
    const isDuplicate = merchants.some(
      (m) => m.merchant_name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (isDuplicate) { setValidationError('A merchant with this name already exists'); return; }
    if (!user) return;
    execute(
      () => createMerchant(db, user.id, { merchant_name: name.trim() }),
      () => invalidateMerchants(),
    );
  };

  const displayError = error || validationError;

  return (
    <ModalFormWrapper>
      <View style={{ gap: SPACING.lg }}>
        <AppInput
          label="Merchant Name"
          placeholder="e.g. Netflix"
          value={name}
          onChangeText={(t) => { setName(t); setValidationError(''); clearError(); }}
          autoCapitalize="words"
          returnKeyType="done"
        />

        {displayError ? <AppText variant="caption" danger style={{ textAlign: 'center' }}>{displayError}</AppText> : null}

        <AppButton
          title="Create Merchant"
          onPress={handleCreate}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: SPACING.sm }}
        />
      </View>
    </ModalFormWrapper>
  );
}
