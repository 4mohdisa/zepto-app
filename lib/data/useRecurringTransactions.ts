import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/expo';
import { useSupabase } from '../supabase/useSupabase';
import type { RecurringTransaction } from '@/types';

interface UseRecurringTransactionsResult {
  recurringTransactions: RecurringTransaction[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecurringTransactions(): UseRecurringTransactionsResult {
  const db = useSupabase();
  const { user } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recurringTransactions', user?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as RecurringTransaction[]) ?? [];
    },
    enabled: !!user?.id,
  });

  return {
    recurringTransactions: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
