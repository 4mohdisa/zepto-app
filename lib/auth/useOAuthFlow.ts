import { useSSO } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';

type OAuthProvider = 'oauth_google' | 'oauth_apple';

export function useOAuthFlow() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState('');

  const startOAuth = useCallback(
    async (strategy: OAuthProvider) => {
      try {
        setLoading(strategy);
        setError('');
        const { createdSessionId, setActive } = await startSSOFlow({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri(),
        });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace('/(app)');
        }
      } catch (err: any) {
        const msg =
          err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          'Authentication failed.';
        setError(msg);
      } finally {
        setLoading(null);
      }
    },
    [startSSOFlow, router],
  );

  return {
    startOAuth,
    loading,
    error,
    clearError: () => setError(''),
  };
}
