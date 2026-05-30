import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import {
  ScreenContainer,
  ScreenHeader,
  AppButton,
  AppInput,
  AppSelect,
  AppText,
  AppSectionHeader,
  AppEmptyState,
  LoadingView,
  DataRow,
} from '@/components/ui';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { invalidateFeedback } from '@/lib/query/invalidation';
import { useMutationHandler } from '@/lib/hooks/useMutationHandler';
import { useFeedback } from '@/lib/data/useFeedback';
import { formatDate } from '@/lib/utils/format';
import { COLOURS, SPACING, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const TYPE_OPTIONS = [
  { label: 'Bug Report', value: 'issue' },
  { label: 'Feature Request', value: 'feature_request' },
];

const SEVERITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useUser();
  const db = useSupabase();
  const { submissions, loading: historyLoading } = useFeedback();

  const [type, setType] = useState('issue');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const { submitting, error: mutationError, execute, clearError } = useMutationHandler();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!user) return;

    const success = await execute(
      async () => {
        const { error } = await db.from('user_submissions').insert({
          user_id: user.id,
          type,
          title: title.trim(),
          description: description.trim(),
          severity: type === 'issue' ? severity : null,
          status: 'open',
        });
        return { error: error?.message ?? null };
      },
      () => invalidateFeedback(),
      { navigateBack: false },
    );

    if (success) {
      setTitle('');
      setDescription('');
      setErrors({});
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
    }
  };

  return (
    <ScreenContainer keyboardAware>
      <View style={{ paddingHorizontal: SPACING.xl }}>
        <ScreenHeader title="Send Feedback" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Submit form */}
          <View style={{ gap: SPACING.lg }}>
            <AppSelect
              label="Type"
              value={type}
              options={TYPE_OPTIONS}
              onChange={(v) => { setType(v); setErrors({}); clearError(); }}
            />

            <AppInput
              label="Title"
              placeholder={type === 'issue' ? 'What went wrong?' : 'What would you like to see?'}
              value={title}
              onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); clearError(); }}
              autoCapitalize="sentences"
              returnKeyType="next"
              blurOnSubmit={false}
              error={errors.title}
            />

            <AppInput
              label="Description"
              placeholder="Provide as much detail as possible..."
              value={description}
              onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); clearError(); }}
              multiline
              numberOfLines={5}
              style={{ height: 120, textAlignVertical: 'top', paddingTop: 14 }}
              autoCapitalize="sentences"
              returnKeyType="done"
              blurOnSubmit
              error={errors.description}
            />

            {type === 'issue' && (
              <AppSelect label="Severity" value={severity} options={SEVERITY_OPTIONS} onChange={setSeverity} />
            )}

            {mutationError ? (
              <AppText variant="caption" danger style={{ textAlign: 'center' }}>{mutationError}</AppText>
            ) : null}

            <AppButton
              title="Submit Feedback"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={{ marginTop: SPACING.sm }}
            />
          </View>

          {/* History */}
          <View style={{ marginTop: SPACING.xxxl }}>
            <AppSectionHeader title="Your Submissions" />

            {historyLoading ? (
              <LoadingView />
            ) : submissions.length === 0 ? (
              <AppEmptyState
                icon={<Ionicons name="chatbubble-outline" size={28} color={COLOURS.textMuted} />}
                title="No submissions yet"
                subtitle="Your feedback history will appear here"
              />
            ) : (
              <View>
                {submissions.map((item, i) => (
                  <DataRow
                    key={item.id}
                    title={item.title}
                    subtitle={`${item.type === 'issue' ? 'Bug Report' : 'Feature Request'} · ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`}
                    rightSubtext={formatDate(item.created_at?.split('T')[0] ?? '')}
                    leftIcon={<Ionicons name={item.type === 'issue' ? 'bug-outline' : 'bulb-outline'} size={20} color={COLOURS.accent} />}
                    leftIconBackground={COLOURS.accentLight}
                    showDivider={i < submissions.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
