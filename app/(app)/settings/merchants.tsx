import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  AppCard,
  AppText,
  AppEmptyState,
  AppSkeleton,
  ScreenHeader,
  DataRow,
  SearchBar,
} from '@/components/ui';
import { useMerchantStats } from '@/lib/data/useMerchantStats';
import { COLOURS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES } from '@/constants/theme';
import { formatCurrency } from '@/lib/utils/format';

export default function MerchantsScreen() {
  const router = useRouter();
  const { merchants, totalMerchants, totalSpend, mostUsedMerchant, loading, error } = useMerchantStats();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return merchants;
    const q = search.toLowerCase();
    return merchants.filter((m) => m.merchant_name.toLowerCase().includes(q) || m.normalized_name.includes(q));
  }, [merchants, search]);

  return (
    <ScreenContainer scrollable>
      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm }}>

        <ScreenHeader
          title="Merchants"
          rightIcon="add-circle-outline"
          onRightPress={() => router.push('/add-merchant')}
        />

        {/* KPI Row */}
        {!loading && (
          <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl }}>
            <AppCard style={{ flex: 1 }} padding="sm">
              <AppText style={{ fontFamily: TYPOGRAPHY.semibold.fontFamily, fontSize: FONT_SIZES.xs, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Merchants
              </AppText>
              <AppText style={{ fontFamily: TYPOGRAPHY.bold.fontFamily, fontSize: FONT_SIZES.xl, color: COLOURS.textPrimary }}>
                {totalMerchants}
              </AppText>
            </AppCard>
            <AppCard style={{ flex: 1 }} padding="sm">
              <AppText style={{ fontFamily: TYPOGRAPHY.semibold.fontFamily, fontSize: FONT_SIZES.xs, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Spend
              </AppText>
              <AppText style={{ fontFamily: TYPOGRAPHY.bold.fontFamily, fontSize: FONT_SIZES.lg, color: COLOURS.textPrimary }}>
                {formatCurrency(totalSpend)}
              </AppText>
            </AppCard>
            <AppCard style={{ flex: 1 }} padding="sm">
              <AppText style={{ fontFamily: TYPOGRAPHY.semibold.fontFamily, fontSize: FONT_SIZES.xs, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Most Used
              </AppText>
              <AppText style={{ fontFamily: TYPOGRAPHY.bold.fontFamily, fontSize: FONT_SIZES.sm, color: COLOURS.textPrimary }} numberOfLines={1}>
                {mostUsedMerchant}
              </AppText>
            </AppCard>
          </View>
        )}

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search merchants..."
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
            <AppText style={{ fontFamily: TYPOGRAPHY.body.fontFamily, fontSize: FONT_SIZES.md, color: COLOURS.error, textAlign: 'center' }}>
              {error}
            </AppText>
          </View>
        ) : filtered.length === 0 ? (
          <AppEmptyState
            icon={<Ionicons name="storefront-outline" size={28} color={COLOURS.textMuted} />}
            title={search ? 'No results' : 'No merchants yet'}
            subtitle={search ? 'Try a different search term.' : 'Tap + to create one'}
          />
        ) : (
          <View>
            {filtered.map((item, i) => (
              <DataRow
                key={item.id}
                title={item.merchant_name}
                subtitle={`${item.transaction_count} transaction${item.transaction_count !== 1 ? 's' : ''}${item.last_used_at ? ` \u00b7 Last ${new Date(item.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`}
                rightText={item.total_amount > 0 ? formatCurrency(item.total_amount) : '\u2014'}
                leftIcon={<Ionicons name="storefront-outline" size={20} color={COLOURS.accent} />}
                leftIconBackground={COLOURS.accentLight}
                showDivider={i < filtered.length - 1}
                onPress={() => router.push({ pathname: '/edit-merchant', params: { id: item.id } })}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
