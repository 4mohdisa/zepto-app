import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { friendlyError } from '@/lib/utils/errors';

interface MutationHandlerResult {
  submitting: boolean;
  error: string | null;
  execute: (
    mutationFn: () => Promise<{ error: string | null }>,
    invalidationFn: () => void,
    options?: { navigateBack?: boolean },
  ) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Shared mutation execution pattern.
 * Handles submitting state, error mapping, invalidation, and navigation.
 */
export function useMutationHandler(): MutationHandlerResult {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const execute = useCallback(
    async (
      mutationFn: () => Promise<{ error: string | null }>,
      invalidationFn: () => void,
      options?: { navigateBack?: boolean },
    ) => {
      setSubmitting(true);
      setError(null);
      const { error: err } = await mutationFn();
      setSubmitting(false);
      if (err) {
        setError(friendlyError(err));
        return false;
      }
      invalidationFn();
      if (options?.navigateBack !== false) router.back();
      return true;
    },
    [router],
  );

  return { submitting, error, execute, clearError: () => setError(null) };
}
