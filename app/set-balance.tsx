import { useEffect, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { useUser } from '@clerk/expo';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { AppButton, AppInput, AppSelect, AppText, LoadingView, ModalHeader, ModalFormWrapper } from '@/components/ui';
import { updateAccountBalance } from '@/lib/data/mutations';
import { invalidateTransactions } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useSupabase } from '@/lib/supabase/useSupabase';

const ACCOUNT_OPTIONS = [
  { label: 'Checking', value: 'Checking' },
  { label: 'Savings', value: 'Savings' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Investment', value: 'Investment' },
  { label: 'Other', value: 'Other' },
];

export default function SetBalanceScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Set Balance" />
      {ready ? <SetBalanceContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function SetBalanceContent() {
  const { user } = useUser();
  const db = useSupabase();
  const { submitting, error: mutationError, execute, clearError } = useMutationHandler();

  const [accountType, setAccountType] = useState('Checking');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSave = () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed)) {
      setValidationError('Enter a valid amount');
      return;
    }
    if (!user) return;
    execute(
      () => updateAccountBalance(db, user.id, accountType, parsed),
      () => invalidateTransactions(),
    );
  };

  const displayError = mutationError || validationError;

  return (
    <ModalFormWrapper>
      <View style={{ gap: 16 }}>
        <AppSelect
          label="Account"
          value={accountType}
          options={ACCOUNT_OPTIONS}
          onChange={(v) => { setAccountType(v); clearError(); }}
        />
        <AppInput
          label="Balance"
          placeholder="0.00"
          value={amount}
          onChangeText={(t) => { setAmount(t); setValidationError(''); clearError(); }}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />

        {displayError ? (
          <AppText variant="caption" danger style={{ textAlign: 'center' }}>{displayError}</AppText>
        ) : null}

        <AppButton
          title="Set Balance"
          onPress={handleSave}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: 8 }}
        />
      </View>
    </ModalFormWrapper>
  );
}
