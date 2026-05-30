import {
  ActivityIndicator,
  Dimensions,
  InteractionManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView as HScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import {
  ScreenContainer,
  AppCard,
  AppText,
  AppSectionHeader,
  AppSkeleton,
  AppEmptyState,
  LoadingView,
} from '@/components/ui';
import { useAccountSummary } from '@/lib/data/useAccountSummary';
import { useChartData } from '@/lib/data/useChartData';
import { useMonthSelector } from '@/lib/hooks/useMonthSelector';
import { formatCurrency } from '@/lib/utils/format';
import { COLOURS, TYPOGRAPHY, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 48;

const chartConfig = {
  backgroundGradientFrom: COLOURS.surface,
  backgroundGradientTo: COLOURS.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(41, 94, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '2', stroke: COLOURS.accent },
  propsForBackgroundLines: { stroke: COLOURS.border, strokeDasharray: '' },
};

export default function DashboardScreen() {
  const { user } = useUser();
  const router = useRouter();
  const month = useMonthSelector();
  const {
    totalBalance, accounts, incomeThisMonth, expensesThisMonth,
    netBalance, savingsRate, loading: summaryLoading, error: summaryError, refetch: refetchSummary,
  } = useAccountSummary(month.startDate, month.endDate);
  const { lineData, pieData, barData, loading: chartLoading, error: chartError, refetch: refetchCharts } = useChartData(month.startDate, month.endDate);
  const [chartTab, setChartTab] = useState<'income' | 'spending'>('spending');
  const [balancePage, setBalancePage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const CARD_GAP = SPACING.md; // 12px gap between cards
  const CARD_PADDING = SPACING.xl; // 20px padding on left and right
  const CARD_WIDTH = screenWidth - (CARD_PADDING * 2); // card fills the visible area
  const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP; // snap accounts for card + gap
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setChartsReady(true);
    });
    return () => task.cancel();
  }, []);

  useFocusEffect(useCallback(() => { refetchSummary(); refetchCharts(); }, [refetchSummary, refetchCharts]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchCharts()]);
    setRefreshing(false);
  }, [refetchSummary, refetchCharts]);

  const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? 'T';

  const lineChartData = useMemo(() => {
    if (lineData.length === 0) return null;
    const values = lineData.map((d) => chartTab === 'spending' ? d.expense : d.income);
    const labels = lineData.map((d) => {
      const day = parseInt(d.date.split('-')[2], 10);
      return day % 5 === 1 || day === 1 ? String(day) : '';
    });
    return {
      labels,
      datasets: [{
        data: values.length > 0 ? values : [0],
        color: () => chartTab === 'spending' ? COLOURS.error : COLOURS.success,
        strokeWidth: 2,
      }],
    };
  }, [lineData, chartTab]);

  const barChartData = useMemo(() => ({
    labels: barData.map((d) => d.day),
    datasets: [{ data: barData.map((d) => d.amount).some((v) => v > 0) ? barData.map((d) => d.amount) : [0, 0, 0, 0, 0, 0, 0] }],
  }), [barData]);

  return (
    <ScreenContainer scrollable refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOURS.accent} />}>
      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: RADIUS.full,
              backgroundColor: COLOURS.accentLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.bold.fontFamily,
                fontSize: FONT_SIZES.lg,
                color: COLOURS.accent,
              }}
            >
              {initials}
            </AppText>
          </View>

          <AppText variant="heading" size="lg">
            Dashboard
          </AppText>

          <View style={{ width: 44 }} />
        </View>

        {/* ── Month Selector ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs, gap: SPACING.xl }}>
          <TouchableOpacity onPress={month.goToPreviousMonth} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={COLOURS.textPrimary} />
          </TouchableOpacity>
          <AppText
            style={{
              fontFamily: TYPOGRAPHY.semibold.fontFamily,
              fontSize: FONT_SIZES.lg,
              color: COLOURS.textPrimary,
              minWidth: 160,
              textAlign: 'center',
            }}
          >
            {month.monthLabel}
          </AppText>
          <TouchableOpacity onPress={month.goToNextMonth} disabled={!month.canGoNext} hitSlop={12}>
            <Ionicons name="chevron-forward" size={22} color={month.canGoNext ? COLOURS.textPrimary : COLOURS.border} />
          </TouchableOpacity>
        </View>
        <AppText
          style={{
            fontFamily: TYPOGRAPHY.body.fontFamily,
            fontSize: FONT_SIZES.sm,
            color: COLOURS.textMuted,
            textAlign: 'center',
            marginBottom: SPACING.xl,
          }}
        >
          {month.dateRangeLabel}
        </AppText>

        {/* ── Error Banner ── */}
        {(summaryError || chartError) && !summaryLoading && !chartLoading && (
          <AppCard padding="md" style={{ marginBottom: SPACING.lg }}>
            <AppText
              style={{
                fontFamily: TYPOGRAPHY.body.fontFamily,
                fontSize: FONT_SIZES.md,
                color: COLOURS.error,
                textAlign: 'center',
              }}
            >
              {summaryError || chartError}
            </AppText>
          </AppCard>
        )}

        {/* ── Balance Carousel ── */}
        <View style={{ marginBottom: SPACING.lg }}>
          <HScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: CARD_PADDING }}
            style={{ marginHorizontal: -CARD_PADDING }}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              setBalancePage(Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL));
            }}
            scrollEventThrottle={16}
          >
            {/* Total Balance card */}
            <View style={{ width: CARD_WIDTH, marginRight: !summaryLoading && accounts.length > 0 ? CARD_GAP : 0 }}>
              <View
                style={{
                  backgroundColor: COLOURS.accent,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.xxl,
                  height: 180,
                }}
              >
                <AppText
                  style={{
                    fontFamily: TYPOGRAPHY.medium.fontFamily,
                    fontSize: FONT_SIZES.sm,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: SPACING.xs,
                  }}
                >
                  Total Balance
                </AppText>
                {summaryLoading ? (
                  <ActivityIndicator color="#FFF" size="small" style={{ alignSelf: 'flex-start', marginVertical: 8 }} />
                ) : (
                  <AppText
                    style={{
                      fontFamily: TYPOGRAPHY.bold.fontFamily,
                      fontSize: FONT_SIZES.xxxl,
                      lineHeight: FONT_SIZES.xxxl * 1.3,
                      color: COLOURS.textOnAccent,
                      marginBottom: SPACING.md,
                    }}
                  >
                    {formatCurrency(totalBalance)}
                  </AppText>
                )}

                {/* Account breakdown + Set Balance */}
                {!summaryLoading && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm }}>
                    {accounts.map((a) => (
                      <View
                        key={a.accountType}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          borderRadius: RADIUS.full,
                          paddingHorizontal: SPACING.md,
                          paddingVertical: SPACING.xs,
                        }}
                      >
                        <AppText
                          style={{
                            fontFamily: TYPOGRAPHY.medium.fontFamily,
                            fontSize: FONT_SIZES.xs,
                            color: 'rgba(255,255,255,0.9)',
                          }}
                        >
                          {a.accountType}: {formatCurrency(a.balance)}
                        </AppText>
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={() => router.push('/set-balance')}
                      hitSlop={8}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        borderRadius: RADIUS.full,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.xs,
                      }}
                    >
                      <AppText
                        style={{
                          fontFamily: TYPOGRAPHY.medium.fontFamily,
                          fontSize: FONT_SIZES.xs,
                          color: COLOURS.textOnAccent,
                        }}
                      >
                        Set Balance
                      </AppText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Per-account cards */}
            {!summaryLoading && accounts.map((a, i) => (
              <View key={a.accountType} style={{ width: CARD_WIDTH, marginRight: i < accounts.length - 1 ? CARD_GAP : 0 }}>
                <View
                  style={{
                    backgroundColor: COLOURS.accent,
                    borderRadius: RADIUS.lg,
                    padding: SPACING.xxl,
                    height: 180,
                    justifyContent: 'center',
                  }}
                >
                  <AppText
                    style={{
                      fontFamily: TYPOGRAPHY.medium.fontFamily,
                      fontSize: FONT_SIZES.sm,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: SPACING.xs,
                    }}
                  >
                    {a.accountType}
                  </AppText>
                  <AppText
                    style={{
                      fontFamily: TYPOGRAPHY.bold.fontFamily,
                      fontSize: FONT_SIZES.xxxl,
                      lineHeight: FONT_SIZES.xxxl * 1.3,
                      color: COLOURS.textOnAccent,
                    }}
                  >
                    {formatCurrency(a.balance)}
                  </AppText>
                </View>
              </View>
            ))}
          </HScrollView>

          {/* Dot indicators */}
          {!summaryLoading && accounts.length > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.md, gap: 6 }}>
              {[0, ...accounts.map((_, i) => i + 1)].map((i) => (
                <View
                  key={i}
                  style={{
                    width: i === balancePage ? 8 : 6,
                    height: i === balancePage ? 8 : 6,
                    borderRadius: 4,
                    backgroundColor: i === balancePage ? COLOURS.accent : COLOURS.border,
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Stats Grid ── */}
        <View style={{ gap: SPACING.md, marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            {/* Income */}
            <AppCard style={{ flex: 1 }} padding="md">
              <AppText
                style={{
                  fontFamily: TYPOGRAPHY.semibold.fontFamily,
                  fontSize: FONT_SIZES.xs,
                  color: COLOURS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: SPACING.xs,
                }}
              >
                Income
              </AppText>
              {summaryLoading ? (
                <AppSkeleton width="70%" height={24} borderRadius={6} />
              ) : (
                <AppText
                  style={{
                    fontFamily: TYPOGRAPHY.bold.fontFamily,
                    fontSize: FONT_SIZES.xl,
                    color: COLOURS.income,
                  }}
                >
                  {formatCurrency(incomeThisMonth)}
                </AppText>
              )}
            </AppCard>

            {/* Expenses */}
            <AppCard style={{ flex: 1 }} padding="md">
              <AppText
                style={{
                  fontFamily: TYPOGRAPHY.semibold.fontFamily,
                  fontSize: FONT_SIZES.xs,
                  color: COLOURS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: SPACING.xs,
                }}
              >
                Expenses
              </AppText>
              {summaryLoading ? (
                <AppSkeleton width="70%" height={24} borderRadius={6} />
              ) : (
                <AppText
                  style={{
                    fontFamily: TYPOGRAPHY.bold.fontFamily,
                    fontSize: FONT_SIZES.xl,
                    color: COLOURS.expense,
                  }}
                >
                  {formatCurrency(expensesThisMonth)}
                </AppText>
              )}
            </AppCard>
          </View>

          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            {/* Net Balance */}
            <AppCard style={{ flex: 1 }} padding="md">
              <AppText
                style={{
                  fontFamily: TYPOGRAPHY.semibold.fontFamily,
                  fontSize: FONT_SIZES.xs,
                  color: COLOURS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: SPACING.xs,
                }}
              >
                Net Balance
              </AppText>
              {summaryLoading ? (
                <AppSkeleton width="60%" height={24} borderRadius={6} />
              ) : (
                <AppText
                  style={{
                    fontFamily: TYPOGRAPHY.bold.fontFamily,
                    fontSize: FONT_SIZES.xl,
                    color: netBalance >= 0 ? COLOURS.income : COLOURS.expense,
                  }}
                >
                  {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
                </AppText>
              )}
            </AppCard>

            {/* Savings Rate */}
            <AppCard style={{ flex: 1 }} padding="md">
              <AppText
                style={{
                  fontFamily: TYPOGRAPHY.semibold.fontFamily,
                  fontSize: FONT_SIZES.xs,
                  color: COLOURS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: SPACING.xs,
                }}
              >
                Savings Rate
              </AppText>
              {summaryLoading ? (
                <AppSkeleton width="50%" height={24} borderRadius={6} />
              ) : (
                <AppText
                  style={{
                    fontFamily: TYPOGRAPHY.bold.fontFamily,
                    fontSize: FONT_SIZES.xl,
                    color: savingsRate >= 0 ? COLOURS.income : COLOURS.expense,
                  }}
                >
                  {savingsRate}%
                </AppText>
              )}
            </AppCard>
          </View>
        </View>

        {/* ── Charts (deferred for performance) ── */}
        {chartsReady ? (
          <>
            {/* ── Transaction Analysis Chart ── */}
            <AppSectionHeader title="Transaction Analysis" style={{ paddingHorizontal: 0, marginTop: SPACING.sm }} />
            <AppCard padding="md" style={{ marginBottom: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: SPACING.md }}>
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  <TouchableOpacity
                    onPress={() => setChartTab('income')}
                    style={{
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.xs,
                      borderRadius: RADIUS.full,
                      backgroundColor: chartTab === 'income' ? COLOURS.success : 'transparent',
                    }}
                  >
                    <AppText
                      style={{
                        fontFamily: TYPOGRAPHY.semibold.fontFamily,
                        fontSize: FONT_SIZES.xs,
                        color: chartTab === 'income' ? COLOURS.textOnAccent : COLOURS.textMuted,
                      }}
                    >
                      Income
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setChartTab('spending')}
                    style={{
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.xs,
                      borderRadius: RADIUS.full,
                      backgroundColor: chartTab === 'spending' ? COLOURS.error : 'transparent',
                    }}
                  >
                    <AppText
                      style={{
                        fontFamily: TYPOGRAPHY.semibold.fontFamily,
                        fontSize: FONT_SIZES.xs,
                        color: chartTab === 'spending' ? COLOURS.textOnAccent : COLOURS.textMuted,
                      }}
                    >
                      Spending
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
              {chartLoading || !lineChartData ? (
                <View style={{ alignItems: 'center', paddingVertical: SPACING.section }}>
                  <ActivityIndicator color={COLOURS.accent} />
                </View>
              ) : lineData.length < 2 ? (
                <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                  <AppText style={{ fontFamily: TYPOGRAPHY.body.fontFamily, fontSize: FONT_SIZES.sm, color: COLOURS.textMuted }}>
                    Not enough data for this period
                  </AppText>
                </View>
              ) : (
                <LineChart
                  data={lineChartData}
                  width={chartWidth}
                  height={200}
                  chartConfig={{ ...chartConfig, color: () => chartTab === 'spending' ? COLOURS.error : COLOURS.success }}
                  bezier
                  withInnerLines={false}
                  withOuterLines={false}
                  withDots={lineData.length <= 15}
                  style={{ borderRadius: RADIUS.md, marginLeft: -16 }}
                />
              )}
            </AppCard>

            {/* ── Category Distribution ── */}
            <AppSectionHeader title="Category Distribution" style={{ paddingHorizontal: 0, marginTop: SPACING.sm }} />
            <AppCard padding="md" style={{ marginBottom: SPACING.lg }}>
              {chartLoading || pieData.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: SPACING.xxl }}>
                  {chartLoading ? (
                    <ActivityIndicator color={COLOURS.accent} />
                  ) : (
                    <AppText
                      style={{
                        fontFamily: TYPOGRAPHY.body.fontFamily,
                        fontSize: FONT_SIZES.md,
                        color: COLOURS.textMuted,
                      }}
                    >
                      No expense data for this month
                    </AppText>
                  )}
                </View>
              ) : (
                <View style={{ gap: SPACING.sm }}>
                  {pieData.map((cat) => {
                    const total = pieData.reduce((s, c) => s + c.amount, 0);
                    const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
                    return (
                      <View key={cat.name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 }}>
                          <View style={{ width: 12, height: 12, borderRadius: RADIUS.full, backgroundColor: cat.color }} />
                          <AppText
                            style={{
                              fontFamily: TYPOGRAPHY.body.fontFamily,
                              fontSize: FONT_SIZES.md,
                              color: COLOURS.textPrimary,
                              flex: 1,
                            }}
                            numberOfLines={1}
                          >
                            {cat.name}
                          </AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                          <AppText
                            style={{
                              fontFamily: TYPOGRAPHY.body.fontFamily,
                              fontSize: FONT_SIZES.sm,
                              color: COLOURS.textMuted,
                            }}
                          >
                            {pct}%
                          </AppText>
                          <AppText
                            style={{
                              fontFamily: TYPOGRAPHY.semibold.fontFamily,
                              fontSize: FONT_SIZES.md,
                              color: COLOURS.textPrimary,
                              minWidth: 80,
                              textAlign: 'right',
                            }}
                          >
                            {formatCurrency(cat.amount)}
                          </AppText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </AppCard>

            {/* ── Spending by Day ── */}
            <AppSectionHeader title="Spending by Day" style={{ paddingHorizontal: 0, marginTop: SPACING.sm }} />
            <AppCard padding="md" style={{ marginBottom: SPACING.xxxl }}>
              {chartLoading ? (
                <View style={{ alignItems: 'center', paddingVertical: SPACING.section }}>
                  <ActivityIndicator color={COLOURS.accent} />
                </View>
              ) : !barData.some((d) => d.amount > 0) ? (
                <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                  <AppText style={{ fontFamily: TYPOGRAPHY.body.fontFamily, fontSize: FONT_SIZES.sm, color: COLOURS.textMuted }}>
                    Not enough data for this period
                  </AppText>
                </View>
              ) : (
                <BarChart
                  data={barChartData}
                  width={chartWidth}
                  height={200}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: 0.6,
                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  }}
                  withInnerLines={false}
                  showBarTops={false}
                  fromZero
                  style={{ borderRadius: RADIUS.md, marginLeft: -16 }}
                />
              )}
            </AppCard>
          </>
        ) : (
          <LoadingView message="Loading charts..." />
        )}
      </View>
    </ScreenContainer>
  );
}
