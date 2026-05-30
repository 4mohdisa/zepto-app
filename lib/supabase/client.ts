import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Base Supabase client — no auth session.
 * Clerk is the auth provider; Supabase is used purely as the database.
 *
 * For authenticated queries (RLS), use `useSupabase()` from lib/supabase/useSupabase.ts
 * which injects the Clerk session token automatically.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Create a Supabase client with a dynamic access token getter.
 * Used by `useSupabase()` hook to inject the current Clerk token.
 *
 * Setup required (one of):
 *   A) Supabase Third-Party Auth — configure Clerk as a provider in the Supabase
 *      dashboard under Auth > Sign In Methods > Third Party Auth > Add Clerk.
 *      RLS policies reference: `(select auth.jwt() ->> 'sub')` as user_id.
 *
 *   B) Clerk JWT Template (legacy) — create a "supabase" template in Clerk dashboard,
 *      then change `getToken()` to `getToken({ template: 'supabase' })` in useSupabase.ts.
 */
export function createAuthClient(getToken: () => Promise<string | null>) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: getToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
