import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  ScreenHeader,
  LoadingView,
  AppText,
  AppEmptyState,
  AppSectionHeader,
  DataRow,
} from '@/components/ui';
import { useRecurringTransactions } from '@/lib/data/useRecurringTransactions';
import { COLOURS, SPACING } from '@/constants/theme';
import { formatCurrency } from '@/lib/utils/format';

function getNextOccurrence(startDate: string, frequency: string): Date | null {
  const [y, m, d] = startDate.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(start);

  while (next <= today) {
    switch (frequency) {
      case 'Daily': next.setDate(next.getDate() + 1); break;
      case 'Weekly': next.setDate(next.getDate() + 7); break;
      case 'Bi-Weekly': next.setDate(next.getDate() + 14); break;
      case 'Monthly': next.setMonth(next.getMonth() + 1); break;
      case 'Quarterly': next.setMonth(next.getMonth() + 3); break;
      case 'Yearly': next.setFullYear(next.getFullYear() + 1); break;
      default: return null;
    }
  }
  return next;
}

export default function RecurringScreen() {
  const router = useRouter();
  const { recurringTransactions, loading, error, refetch } = useRecurringTransactions();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const upcoming = useMemo(() => {
    const predictions: Array<{
      id: string;
      name: string;
      amount: number;
      type: string;
      category_name: string | null;
      date: Date;
    }> = [];

    for (const item of recurringTransactions) {
      if (item.end_date && new Date(item.end_date) < new Date()) continue;
      const nextDate = getNextOccurrence(item.start_date, item.frequency);
      if (!nextDate) continue;
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      if (nextDate > thirtyDaysFromNow) continue;

      predictions.push({
        id: `${item.id}-${nextDate.toISOString()}`,
        name: item.name,
        amount: item.amount,
        type: item.type,
        category_name: item.category_name,
        date: nextDate,
      });
    }

    return predictions.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 10);
  }, [recurringTransactions]);

  return (
    <ScreenContainer scrollable>
      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm }}>
        <ScreenHeader
          title="Recurring"
          rightIcon="add-circle-outline"
          onRightPress={() => router.push('/add-recurring')}
        />

        {/* Active List */}
        {loading ? (
          <LoadingView />
        ) : error ? (
          <View className="items-center" style={{ paddingVertical: SPACING.section }}>
            <AppText variant="body" danger style={{ textAlign: 'center' }}>{error}</AppText>
          </View>
        ) : recurringTransactions.length === 0 ? (
          <AppEmptyState
            icon={<Ionicons name="repeat-outline" size={28} color={COLOURS.textMuted} />}
            title="No recurring transactions"
            subtitle="Tap + to create one"
          />
        ) : (
          <View>
            {recurringTransactions.map((item, i) => {
              const isIncome = item.type === 'Income';
              return (
                <DataRow
                  key={item.id}
                  title={item.name}
                  subtitle={`${item.frequency} · ${item.category_name ?? item.account_type}`}
                  rightText={`${isIncome ? '+' : '-'}${formatCurrency(item.amount)}`}
                  rightTextColor={isIncome ? COLOURS.income : COLOURS.expense}
                  rightSubtext={item.type}
                  leftIcon={<Ionicons name="repeat" size={20} color={COLOURS.accent} />}
                  leftIconBackground={COLOURS.accentLight}
                  showDivider={i < recurringTransactions.length - 1}
                  onPress={() => router.push({ pathname: '/edit-recurring', params: { id: String(item.id) } })}
                />
              );
            })}
          </View>
        )}

        {/* Upcoming Predictions */}
        {!loading && !error && upcoming.length > 0 && (
          <View style={{ marginTop: SPACING.xxxl }}>
            <AppSectionHeader title="Upcoming (next 30 days)" />
            <View>
              {upcoming.map((item, i) => {
                const isIncome = item.type === 'Income';
                return (
                  <DataRow
                    key={item.id}
                    title={item.name}
                    subtitle={item.category_name ?? item.type}
                    rightText={`${isIncome ? '+' : '-'}${formatCurrency(item.amount)}`}
                    rightTextColor={isIncome ? COLOURS.income : COLOURS.expense}
                    rightSubtext={item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    leftIcon={<Ionicons name="calendar-outline" size={20} color={COLOURS.accent} />}
                    leftIconBackground={COLOURS.accentLight}
                    showDivider={i < upcoming.length - 1}
                  />
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
