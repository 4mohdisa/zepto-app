import { Alert, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  AppText,
  AppEmptyState,
  AppSkeleton,
  TransactionRow,
  SearchBar,
  FilterChips,
} from '@/components/ui';
import { TransactionFilters, DEFAULT_FILTERS, isFiltersActive, activeFilterCount } from '@/components/TransactionFilters';
import type { FilterState } from '@/components/TransactionFilters';
import { useTransactions } from '@/lib/data/useTransactions';
import { useCategories } from '@/lib/data/useCategories';
import { COLOURS, TYPOGRAPHY, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import type { Transaction, TransactionType } from '@/types';

type FilterTab = 'All' | TransactionType;
const TABS: FilterTab[] = ['All', 'Income', 'Expense'];

export default function TransactionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [search, setSearch] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'date' | 'amount_high' | 'amount_low' | 'expense_first' | 'income_first'>('date');

  const filter = activeTab === 'All' ? undefined : activeTab;
  const { transactions, loading, error, refetch } = useTransactions(filter);
  const { categories } = useCategories();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { refetch(); }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = useMemo(() => {
    let result = transactions;

    if (activeFilters.dateFrom) result = result.filter((t) => t.date >= activeFilters.dateFrom);
    if (activeFilters.dateTo) result = result.filter((t) => t.date <= activeFilters.dateTo);
    if (activeFilters.category) result = result.filter((t) => t.category_name === activeFilters.category);
    if (activeFilters.accountType) result = result.filter((t) => t.account_type === activeFilters.accountType);
    if (activeFilters.amountMin) result = result.filter((t) => Number(t.amount) >= Number(activeFilters.amountMin));
    if (activeFilters.amountMax) result = result.filter((t) => Number(t.amount) <= Number(activeFilters.amountMax));

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.name.toLowerCase().includes(q) ||
          (tx.category_name?.toLowerCase().includes(q) ?? false) ||
          (tx.description?.toLowerCase().includes(q) ?? false),
      );
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'amount_high': return Number(b.amount) - Number(a.amount);
        case 'amount_low': return Number(a.amount) - Number(b.amount);
        case 'expense_first': return a.type === 'Expense' && b.type !== 'Expense' ? -1 : b.type === 'Expense' && a.type !== 'Expense' ? 1 : 0;
        case 'income_first': return a.type === 'Income' && b.type !== 'Income' ? -1 : b.type === 'Income' && a.type !== 'Income' ? 1 : 0;
        default: return 0;
      }
    });
  }, [transactions, search, activeFilters, sortBy]);

  const hasActiveFilters = isFiltersActive(activeFilters);
  const filterCount = activeFilterCount(activeFilters);

  const renderItem = useCallback(({ item, index }: { item: Transaction; index: number }) => (
    <TransactionRow
      transaction={item}
      isLast={index === filtered.length - 1}
      onPress={() => router.push({ pathname: '/edit-transaction', params: { id: String(item.id) } })}
    />
  ), [filtered.length, router]);

  const keyExtractor = useCallback((item: Transaction) => String(item.id), []);

  const listHeader = useMemo(() => (
    <View style={{ paddingTop: SPACING.sm }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl }}>
        <AppText variant="h1">Transactions</AppText>
        <Pressable
          onPress={() => router.push('/add-transaction')}
          hitSlop={8}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="add-circle-outline" size={32} color={COLOURS.accent} />
        </Pressable>
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search transactions..."
      />

      {/* Filter tabs + options */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl }}>
        <FilterChips
          options={TABS}
          selected={activeTab}
          onSelect={(tab) => setActiveTab(tab as FilterTab)}
        />

        <View style={{ flexDirection: 'row' }}>
          <Pressable
            onPress={() => {
              Alert.alert('Sort by', undefined, [
                { text: 'Date (newest)', onPress: () => setSortBy('date') },
                { text: 'Amount (high \u2192 low)', onPress: () => setSortBy('amount_high') },
                { text: 'Amount (low \u2192 high)', onPress: () => setSortBy('amount_low') },
                { text: 'Expenses first', onPress: () => setSortBy('expense_first') },
                { text: 'Income first', onPress: () => setSortBy('income_first') },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            hitSlop={8}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.xs }}
          >
            <Ionicons name="swap-vertical-outline" size={22} color={sortBy !== 'date' ? COLOURS.accent : COLOURS.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => setFiltersVisible(true)}
            hitSlop={8}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="options-outline" size={22} color={hasActiveFilters ? COLOURS.accent : COLOURS.textMuted} />
            {hasActiveFilters && (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: RADIUS.full,
                  backgroundColor: COLOURS.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText style={{ fontFamily: TYPOGRAPHY.bold.fontFamily, fontSize: 9, color: COLOURS.textOnAccent }}>
                  {filterCount}
                </AppText>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  ), [search, activeTab, sortBy, hasActiveFilters, filterCount, router]);

  const emptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderBottomWidth: i < 5 ? 1 : 0, borderBottomColor: COLOURS.border }}>
              <AppSkeleton width={40} height={40} borderRadius={RADIUS.md} style={{ marginRight: SPACING.md }} />
              <View style={{ flex: 1 }}>
                <AppSkeleton width="60%" height={14} style={{ marginBottom: 6 }} />
                <AppSkeleton width="40%" height={11} />
              </View>
              <AppSkeleton width={70} height={14} />
            </View>
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ paddingVertical: SPACING.xxl }}>
          <AppText
            style={{ fontFamily: TYPOGRAPHY.body.fontFamily, fontSize: FONT_SIZES.md, color: COLOURS.error, textAlign: 'center' }}
          >
            Could not load transactions. Please try again.
          </AppText>
        </View>
      );
    }

    return (
      <AppEmptyState
        icon={<Ionicons name="swap-horizontal-outline" size={28} color={COLOURS.textMuted} />}
        title={
          search || hasActiveFilters
            ? 'No results found'
            : activeTab === 'All'
            ? 'No transactions yet'
            : `No ${activeTab.toLowerCase()} yet`
        }
        subtitle={
          search || hasActiveFilters
            ? 'Try adjusting your search or filters.'
            : activeTab === 'All'
            ? 'Start tracking your finances by recording your first transaction.'
            : `You have no ${activeTab.toLowerCase()} transactions this period.`
        }
        action={
          !search && !hasActiveFilters && activeTab === 'All'
            ? { label: 'Add First Transaction', onPress: () => router.push('/add-transaction') }
            : undefined
        }
      />
    );
  }, [loading, error, search, hasActiveFilters, activeTab, router]);

  return (
    <ScreenContainer>
      <FlatList
        data={loading || error ? [] : filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOURS.accent} />}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 40 }}
      />

      <TransactionFilters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={(f) => { setActiveFilters(f); setFiltersVisible(false); }}
        onReset={() => { setActiveFilters(DEFAULT_FILTERS); setFiltersVisible(false); }}
        categories={categories.map((c) => ({ label: c.name, value: c.name }))}
        currentFilters={activeFilters}
      />
    </ScreenContainer>
  );
}
