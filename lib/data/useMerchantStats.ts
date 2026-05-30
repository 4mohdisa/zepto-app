import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/expo';
import { useSupabase } from '../supabase/useSupabase';

export interface MerchantWithStats {
  id: string;
  merchant_name: string;
  normalized_name: string;
  transaction_count: number;
  total_amount: number;
  last_used_at: string | null;
}

interface UseMerchantStatsResult {
  merchants: MerchantWithStats[];
  totalMerchants: number;
  totalTransactions: number;
  totalSpend: number;
  mostUsedMerchant: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMerchantStats(): UseMerchantStatsResult {
  const db = useSupabase();
  const { user } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['merchantStats', user?.id],
    queryFn: async () => {
      const [merchantsResult, txResult] = await Promise.all([
        db.from('merchants')
          .select('id, merchant_name, normalized_name, transaction_count, last_used_at')
          .eq('user_id', user!.id)
          .order('transaction_count', { ascending: false, nullsFirst: false })
          .order('merchant_name', { ascending: true }),
        db.from('transactions')
          .select('merchant_id, amount')
          .eq('user_id', user!.id)
          .not('merchant_id', 'is', null),
      ]);

      if (merchantsResult.error) throw new Error(merchantsResult.error.message);
      if (txResult.error) throw new Error(txResult.error.message);

      const amountMap = new Map<string, number>();
      for (const tx of txResult.data ?? []) {
        if (!tx.merchant_id) continue;
        amountMap.set(tx.merchant_id, (amountMap.get(tx.merchant_id) ?? 0) + Number(tx.amount));
      }

      const merchants: MerchantWithStats[] = (merchantsResult.data ?? []).map((r) => ({
        id: r.id as string,
        merchant_name: r.merchant_name as string,
        normalized_name: r.normalized_name as string,
        transaction_count: Number(r.transaction_count ?? 0),
        total_amount: amountMap.get(r.id as string) ?? 0,
        last_used_at: r.last_used_at as string | null,
      }));

      const totalMerchants = merchants.length;
      const totalTransactions = merchants.reduce((s, m) => s + m.transaction_count, 0);
      const totalSpend = merchants.reduce((s, m) => s + m.total_amount, 0);
      const mostUsedMerchant = merchants.length > 0 ? merchants[0].merchant_name : '—';

      return { merchants, totalMerchants, totalTransactions, totalSpend, mostUsedMerchant };
    },
    enabled: !!user?.id,
  });

  return {
    merchants: data?.merchants ?? [],
    totalMerchants: data?.totalMerchants ?? 0,
    totalTransactions: data?.totalTransactions ?? 0,
    totalSpend: data?.totalSpend ?? 0,
    mostUsedMerchant: data?.mostUsedMerchant ?? '—',
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
