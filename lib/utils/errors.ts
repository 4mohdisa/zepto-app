/**
 * Converts raw Supabase/API error messages into user-friendly text.
 */
export function friendlyError(raw: string | null): string {
  if (!raw) return 'Something went wrong. Please try again.';
  const lower = raw.toLowerCase();
  if (lower.includes('jwt') || lower.includes('token')) return 'Your session has expired. Please sign in again.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Network error. Check your connection and try again.';
  if (lower.includes('duplicate') || lower.includes('unique')) return 'This item already exists.';
  if (lower.includes('permission') || lower.includes('policy') || lower.includes('42501')) return "You don't have permission to do this.";
  if (lower.includes('not found') || lower.includes('pgrst')) return 'The requested item was not found.';
  return 'Something went wrong. Please try again.';
}
