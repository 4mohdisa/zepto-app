import { useEffect, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { useUser } from '@clerk/expo';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { AppButton, AppInput, AppText, LoadingView, ModalHeader, ModalFormWrapper } from '@/components/ui';
import { createCategory } from '@/lib/data/mutations';
import { invalidateCategories } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useCategories } from '@/lib/data/useCategories';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { SPACING } from '@/constants/theme';

export default function AddCategoryScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Add Category" />
      {ready ? <AddCategoryContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function AddCategoryContent() {
  const { user } = useUser();
  const db = useSupabase();
  const { submitting, error, execute, clearError } = useMutationHandler();
  const { categories: existingCategories } = useCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) { setValidationError('Name is required'); return; }
    const isDuplicate = existingCategories.some(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (isDuplicate) { setValidationError('A category with this name already exists'); return; }
    if (!user) return;
    execute(
      () => createCategory(db, user.id, { name: name.trim(), description: description.trim() || null }),
      () => invalidateCategories(),
    );
  };

  const displayError = error || validationError;

  return (
    <ModalFormWrapper>
      <View style={{ gap: SPACING.lg }}>
        <AppInput
          label="Name"
          placeholder="e.g. Groceries"
          value={name}
          onChangeText={(t) => { setName(t); setValidationError(''); clearError(); }}
          autoCapitalize="words"
          returnKeyType="next"
          blurOnSubmit={false}
        />
        <AppInput
          label="Description (optional)"
          placeholder="What is this category for?"
          value={description}
          onChangeText={setDescription}
          autoCapitalize="sentences"
          returnKeyType="done"
        />

        {displayError ? <AppText variant="caption" danger style={{ textAlign: 'center' }}>{displayError}</AppText> : null}

        <AppButton
          title="Create Category"
          onPress={handleCreate}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: SPACING.sm }}
        />
      </View>
    </ModalFormWrapper>
  );
}
