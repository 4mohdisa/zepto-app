import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/expo';
import { useSupabase } from '../supabase/useSupabase';

export interface FeedbackSubmission {
  id: number;
  type: 'issue' | 'feature_request';
  title: string;
  description: string;
  severity: string | null;
  status: string;
  created_at: string;
}

interface UseFeedbackResult {
  submissions: FeedbackSubmission[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFeedback(): UseFeedbackResult {
  const db = useSupabase();
  const { user } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feedback', user?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from('user_submissions')
        .select('id, type, title, description, severity, status, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as FeedbackSubmission[]) ?? [];
    },
    enabled: !!user?.id,
  });

  return {
    submissions: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
