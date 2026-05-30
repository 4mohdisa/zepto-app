import { useCallback, useMemo, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  AppCard,
  AppText,
  AppEmptyState,
  AppSkeleton,
  DataRow,
  SearchBar,
} from '@/components/ui';
import { useCategoryStats } from '@/lib/data/useCategoryStats';
import { formatCurrency } from '@/lib/utils/format';
import { COLOURS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth - 64;
const CARD_GAP = 12;

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, kpis, loading, error, refetch } = useCategoryStats();
  const [kpiPage, setKpiPage] = useState(0);
  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const kpiCards = [
    { label: 'Total Categories', value: String(kpis.totalCategories), icon: 'grid' as const },
    { label: 'Most Used', value: kpis.mostUsedCategory, icon: 'trending-up' as const },
    { label: 'Highest Spend', value: kpis.highestSpendCategory, icon: 'cash' as const },
    { label: 'Uncategorized', value: String(kpis.uncategorizedCount), icon: 'help-circle' as const },
  ];

  const onKpiScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    setKpiPage(page);
  };

  return (
    <ScreenContainer scrollable>
      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
          <AppText variant="h1">Categories</AppText>
          <Pressable
            onPress={() => router.push('/add-category')}
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add-circle-outline" size={32} color={COLOURS.accent} />
          </Pressable>
        </View>

        {/* KPI Carousel */}
        {!loading && categories.length > 0 && (
          <View style={{ marginBottom: SPACING.xl }}>
            <ScrollView
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              onScroll={onKpiScroll}
              scrollEventThrottle={16}
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{ paddingRight: SPACING.xl }}
            >
              {kpiCards.map((card, i) => (
                <View
                  key={card.label}
                  style={{ width: CARD_WIDTH, marginRight: i < kpiCards.length - 1 ? CARD_GAP : 0 }}
                >
                  <AppCard padding="md" style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: RADIUS.full,
                        backgroundColor: COLOURS.accentLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={card.icon} size={20} color={COLOURS.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        style={{
                          fontFamily: TYPOGRAPHY.semibold.fontFamily,
                          fontSize: FONT_SIZES.xs,
                          color: COLOURS.textMuted,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                        }}
                      >
                        {card.label}
                      </AppText>
                      <AppText
                        style={{
                          fontFamily: TYPOGRAPHY.bold.fontFamily,
                          fontSize: FONT_SIZES.lg,
                          color: COLOURS.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {card.value}
                      </AppText>
                    </View>
                  </AppCard>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm, gap: 6 }}>
              {kpiCards.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: RADIUS.full,
                    backgroundColor: i === kpiPage ? COLOURS.accent : COLOURS.border,
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search categories..."
          containerStyle={{ marginBottom: SPACING.xl }}
        />

        {/* List */}
        {loading ? (
          <View>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: COLOURS.border }}>
                <AppSkeleton width={40} height={40} borderRadius={RADIUS.full} style={{ marginRight: SPACING.md }} />
                <View style={{ flex: 1 }}>
                  <AppSkeleton width="55%" height={14} style={{ marginBottom: 6 }} />
                  <AppSkeleton width="35%" height={11} />
                </View>
                <AppSkeleton width={60} height={14} />
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={{ paddingVertical: SPACING.xxl }}>
            <AppText
              style={{ fontFamily: TYPOGRAPHY.body.fontFamily, fontSize: FONT_SIZES.md, color: COLOURS.error, textAlign: 'center' }}
            >
              {error}
            </AppText>
          </View>
        ) : filtered.length === 0 ? (
          <AppEmptyState
            icon={<Ionicons name="grid-outline" size={28} color={COLOURS.textMuted} />}
            title={search ? 'No categories found' : 'No categories yet'}
            subtitle={search ? 'Try a different search term.' : 'Setting up your categories...'}
          />
        ) : (
          <View>
            {filtered.map((cat, i) => (
              <DataRow
                key={cat.id}
                title={cat.name}
                subtitle={`${cat.transaction_count} transaction${cat.transaction_count !== 1 ? 's' : ''}${cat.percentage > 0 ? ` · ${cat.percentage}%` : ''}`}
                rightText={cat.total_amount > 0 ? formatCurrency(cat.total_amount) : '—'}
                leftIcon={<Ionicons name="pricetag-outline" size={16} color={COLOURS.textMuted} />}
                leftIconBackground={COLOURS.surfaceSecondary}
                showDivider={i < filtered.length - 1}
                onPress={() => router.push({ pathname: '/edit-category', params: { id: String(cat.id) } })}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
