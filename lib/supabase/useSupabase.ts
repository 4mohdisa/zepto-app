import { useAuth } from '@clerk/expo';
import { useMemo, useRef, useEffect } from 'react';
import { createAuthClient } from './client';

/**
 * Returns a Supabase client authenticated with the current Clerk session token.
 * The `accessToken` function is called automatically before each request,
 * so the token is always fresh.
 *
 * getToken is stabilized via useRef to prevent the Supabase client from being
 * recreated on every render (getToken from useAuth is referentially unstable
 * in @clerk/react@5.54.0+).
 */
export function useSupabase() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  });

  return useMemo(() => createAuthClient(() => getTokenRef.current()), []);
}
