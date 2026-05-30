import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/expo';
import { useSupabase } from '../supabase/useSupabase';
import type { Category } from '@/types';

export interface CategoryWithStats extends Category {
  transaction_count: number;
  total_amount: number;
  percentage: number;
}

interface CategoryKPIs {
  totalCategories: number;
  mostUsedCategory: string;
  highestSpendCategory: string;
  uncategorizedCount: number;
}

interface UseCategoryStatsResult {
  categories: CategoryWithStats[];
  kpis: CategoryKPIs;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const defaultKpis: CategoryKPIs = { totalCategories: 0, mostUsedCategory: '—', highestSpendCategory: '—', uncategorizedCount: 0 };

export function useCategoryStats(): UseCategoryStatsResult {
  const db = useSupabase();
  const { user } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categoryStats', user?.id],
    queryFn: async () => {
      const [catsResult, txResult] = await Promise.all([
        db.from('categories')
          .select('id, user_id, name, description, icon, color, is_default, created_at, updated_at')
          .eq('user_id', user!.id)
          .order('name', { ascending: true }),
        db.from('transactions')
          .select('category_id, amount')
          .eq('user_id', user!.id),
      ]);

      if (catsResult.error) throw new Error(catsResult.error.message);
      if (txResult.error) throw new Error(txResult.error.message);

      const cats = (catsResult.data ?? []) as Category[];
      const txs = txResult.data ?? [];

      const statsMap = new Map<number, { count: number; total: number }>();
      let uncategorizedCount = 0;
      for (const tx of txs) {
        if (tx.category_id == null) { uncategorizedCount++; continue; }
        const existing = statsMap.get(tx.category_id) ?? { count: 0, total: 0 };
        existing.count++;
        existing.total += Number(tx.amount);
        statsMap.set(tx.category_id, existing);
      }

      const grandTotal = [...statsMap.values()].reduce((s, v) => s + v.total, 0);

      const enriched: CategoryWithStats[] = cats.map((c) => {
        const s = statsMap.get(c.id) ?? { count: 0, total: 0 };
        return {
          ...c,
          transaction_count: s.count,
          total_amount: s.total,
          percentage: grandTotal > 0 ? Math.round((s.total / grandTotal) * 1000) / 10 : 0,
        };
      }).sort((a, b) => b.total_amount - a.total_amount);

      const mostUsed = [...enriched].sort((a, b) => b.transaction_count - a.transaction_count)[0];
      const kpis: CategoryKPIs = {
        totalCategories: cats.length,
        mostUsedCategory: mostUsed?.name ?? '—',
        highestSpendCategory: enriched[0]?.name ?? '—',
        uncategorizedCount,
      };

      return { categories: enriched, kpis };
    },
    enabled: !!user?.id,
  });

  return {
    categories: data?.categories ?? [],
    kpis: data?.kpis ?? defaultKpis,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
