import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/expo';
import { useSupabase } from '../supabase/useSupabase';
import type { Merchant } from '@/types';

interface UseMerchantsResult {
  merchants: Merchant[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMerchants(): UseMerchantsResult {
  const db = useSupabase();
  const { user } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['merchants', user?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from('merchants')
        .select('id, merchant_name, normalized_name')
        .eq('user_id', user!.id)
        .order('merchant_name', { ascending: true });

      if (error) throw new Error(error.message);
      return (data as Merchant[]) ?? [];
    },
    enabled: !!user?.id,
  });

  return {
    merchants: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
