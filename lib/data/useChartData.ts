import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../supabase/useSupabase';

const CHART_COLORS = [
  '#635BFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA', '#D2B4DE',
];

export interface DailyData { date: string; income: number; expense: number; }
export interface CategoryData { name: string; amount: number; color: string; }
export interface DayOfWeekData { day: string; amount: number; }

export function useChartData(startDate: string, endDate: string) {
  const db = useSupabase();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chartData', startDate, endDate],
    queryFn: async () => {
      const { data: rows, error } = await db
        .from('transactions')
        .select('amount, type, date, category_name')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw new Error(error.message);
      const txs = rows ?? [];

      // Line chart
      const dailyMap = new Map<string, { income: number; expense: number }>();
      for (const r of txs) {
        const existing = dailyMap.get(r.date) ?? { income: 0, expense: 0 };
        if (r.type === 'Income') existing.income += Number(r.amount);
        else existing.expense += Number(r.amount);
        dailyMap.set(r.date, existing);
      }
      const lineData: DailyData[] = [...dailyMap.entries()].map(([date, vals]) => ({ date, ...vals }));

      // Pie chart
      const catMap = new Map<string, number>();
      for (const r of txs) {
        if (r.type !== 'Expense') continue;
        const cat = r.category_name ?? 'Uncategorized';
        catMap.set(cat, (catMap.get(cat) ?? 0) + Number(r.amount));
      }
      const sorted = [...catMap.entries()].sort((a, b) => b[1] - a[1]);
      const totalExpenses = sorted.reduce((s, [, v]) => s + v, 0);
      const pieData: CategoryData[] = [];
      let otherTotal = 0;
      for (let i = 0; i < sorted.length; i++) {
        const [name, amount] = sorted[i];
        if (i < 6 && (amount / totalExpenses) >= 0.03) {
          pieData.push({ name, amount, color: CHART_COLORS[i % CHART_COLORS.length] });
        } else {
          otherTotal += amount;
        }
      }
      if (otherTotal > 0) pieData.push({ name: 'Other', amount: otherTotal, color: '#C0C0C0' });

      // Bar chart
      const dowTotals = [0, 0, 0, 0, 0, 0, 0];
      for (const r of txs) {
        if (r.type !== 'Expense') continue;
        const [y, m, d] = r.date.split('-').map(Number);
        dowTotals[new Date(y, m - 1, d).getDay()] += Number(r.amount);
      }
      const barData: DayOfWeekData[] = [
        { day: 'Mon', amount: dowTotals[1] }, { day: 'Tue', amount: dowTotals[2] },
        { day: 'Wed', amount: dowTotals[3] }, { day: 'Thu', amount: dowTotals[4] },
        { day: 'Fri', amount: dowTotals[5] }, { day: 'Sat', amount: dowTotals[6] },
        { day: 'Sun', amount: dowTotals[0] },
      ];

      return { lineData, pieData, barData };
    },
  });

  return {
    lineData: data?.lineData ?? [],
    pieData: data?.pieData ?? [],
    barData: data?.barData ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
