import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/expo';
import { useSupabase } from '../supabase/useSupabase';
import { seedDefaultCategories } from './mutations';
import type { Category } from '@/types';

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCategories(): UseCategoriesResult {
  const db = useSupabase();
  const { user } = useUser();
  const seedAttempted = useRef(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from('categories')
        .select('id, user_id, name, description, icon, color, is_default, created_at, updated_at')
        .eq('user_id', user!.id)
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      let rows = (data as Category[]) ?? [];

      // Auto-seed for new users
      if (rows.length === 0 && !seedAttempted.current) {
        seedAttempted.current = true;
        const { error: seedErr } = await seedDefaultCategories(db, user!.id);
        if (seedErr) throw new Error(seedErr);

        const { data: seeded, error: refetchErr } = await db
          .from('categories')
          .select('id, user_id, name, description, icon, color, is_default, created_at, updated_at')
          .eq('user_id', user!.id)
          .order('name', { ascending: true });

        if (refetchErr) throw new Error(refetchErr.message);
        rows = (seeded as Category[]) ?? [];
      }

      return rows;
    },
    enabled: !!user?.id,
  });

  return {
    categories: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
