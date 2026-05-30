import { useEffect, useState } from 'react';
import { Alert, InteractionManager, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/expo';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { AppButton, AppInput, AppText, LoadingView, ModalHeader, ModalFormWrapper } from '@/components/ui';
import { updateCategory, deleteCategory } from '@/lib/data/mutations';
import { invalidateCategories, invalidateTransactions } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useCategories } from '@/lib/data/useCategories';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { SPACING } from '@/constants/theme';
import type { Category } from '@/types';

export default function EditCategoryScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  return (
    <ModalWrapper>
      <ModalHeader title="Edit Category" />
      {ready ? <EditCategoryContent /> : <LoadingView fullScreen />}
    </ModalWrapper>
  );
}

function EditCategoryContent() {
  const { user } = useUser();
  const db = useSupabase();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { submitting, error: mutationError, execute } = useMutationHandler();
  const { categories: allCategories } = useCategories();

  const [category, setCategory] = useState<Category | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!id || !user?.id) return;
    let cancelled = false;

    async function load() {
      setFetchLoading(true);
      setFetchError(null);
      const { data, error: err } = await db
        .from('categories')
        .select('*')
        .eq('id', Number(id))
        .eq('user_id', user!.id)
        .maybeSingle();

      if (cancelled) return;
      if (err || !data) { setFetchError('Category not found.'); }
      else {
        const cat = data as Category;
        setCategory(cat);
        setName(cat.name);
        setDescription(cat.description ?? '');
      }
      setFetchLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id, user?.id]);

  const handleSave = () => {
    if (!name.trim()) { setValidationError('Name is required'); return; }
    if (!category || !user) return;
    const isDuplicate = allCategories.some(
      (c) => c.id !== category.id && c.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (isDuplicate) { setValidationError('A category with this name already exists'); return; }
    execute(
      () => updateCategory(db, user.id, category.id, { name: name.trim(), description: description.trim() || null }),
      () => invalidateCategories(),
    );
  };

  const handleDelete = () => {
    if (!category || !user) return;
    Alert.alert(
      `Delete "${category.name}"?`,
      'Transactions using this category will become Uncategorized.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => execute(
            () => deleteCategory(db, user.id, category.id),
            () => { invalidateCategories(); invalidateTransactions(); },
          ),
        },
      ],
    );
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
          label="Name"
          placeholder="e.g. Groceries"
          value={name}
          onChangeText={(t) => { setName(t); setValidationError(''); }}
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

        <AppButton title="Save Changes" onPress={handleSave} loading={submitting} disabled={submitting} style={{ marginTop: SPACING.sm }} />
        <AppButton title="Delete Category" variant="danger" onPress={handleDelete} disabled={submitting} />
      </View>
    </ModalFormWrapper>
  );
}
