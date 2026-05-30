import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../supabase/useSupabase';
import type { Transaction, TransactionType } from '@/types';

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactions(filter?: TransactionType, limit?: number): UseTransactionsResult {
  const db = useSupabase();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', filter ?? 'all', limit ?? 'none'],
    queryFn: async () => {
      let query = db
        .from('transactions')
        .select('id, name, amount, type, category_name, date, account_type, description')
        .order('date', { ascending: false })
        .order('id', { ascending: false });

      if (filter) query = query.eq('type', filter);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as Transaction[]) ?? [];
    },
  });

  return {
    transactions: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
