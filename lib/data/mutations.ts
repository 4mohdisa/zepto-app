import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionType, AccountType, RecurringFrequency } from '@/types';

// ─── Transaction Types ───────────────────────────────────────────────────────

export interface TransactionInput {
  name: string;
  amount: number;           // always positive
  type: TransactionType;    // 'Income' | 'Expense'
  date: string;             // YYYY-MM-DD
  category_id: number | null;
  category_name: string | null;
  account_type: AccountType | null;
  description: string | null;
  merchant_id: string | null;
}

// ─── Transaction Mutations ───────────────────────────────────────────────────

export async function createTransaction(
  db: SupabaseClient,
  userId: string,
  input: TransactionInput,
): Promise<{ error: string | null }> {
  const { error } = await db.from('transactions').insert({
    user_id: userId,
    name: input.name.trim(),
    amount: input.amount,
    type: input.type,
    date: input.date,
    category_id: input.category_id,
    category_name: input.category_name,
    account_type: input.account_type,
    description: input.description?.trim() || null,
    merchant_id: input.merchant_id,
  });
  return { error: error?.message ?? null };
}

export async function updateTransaction(
  db: SupabaseClient,
  userId: string,
  id: number,
  input: TransactionInput,
): Promise<{ error: string | null }> {
  const { error } = await db
    .from('transactions')
    .update({
      name: input.name.trim(),
      amount: input.amount,
      type: input.type,
      date: input.date,
      category_id: input.category_id,
      category_name: input.category_name,
      account_type: input.account_type,
      description: input.description?.trim() || null,
      merchant_id: input.merchant_id,
    })
    .eq('id', id)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function deleteTransaction(
  db: SupabaseClient,
  userId: string,
  id: number,
): Promise<{ error: string | null }> {
  const { error } = await db.from('transactions').delete().eq('id', id).eq('user_id', userId);
  return { error: error?.message ?? null };
}

// ─── Category Mutations ──────────────────────────────────────────────────────

/**
 * Seeds default categories for a new user by copying the 15 global templates.
 * Idempotent — returns early if user already has categories.
 */
export async function seedDefaultCategories(
  db: SupabaseClient,
  userId: string,
): Promise<{ seeded: boolean; error: string | null }> {
  const { count, error: countErr } = await db
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countErr) return { seeded: false, error: countErr.message };
  if ((count ?? 0) > 0) return { seeded: false, error: null };

  const { data: defaults, error: fetchErr } = await db
    .from('categories')
    .select('name, description, icon, color')
    .is('user_id', null)
    .eq('is_default', true);

  if (fetchErr) return { seeded: false, error: fetchErr.message };
  if (!defaults || defaults.length === 0) return { seeded: false, error: 'No default categories found' };

  const rows = defaults.map((d) => ({
    user_id: userId,
    name: d.name,
    description: d.description,
    icon: d.icon,
    color: d.color,
    is_default: false,
  }));

  const { error: insertErr } = await db.from('categories').insert(rows);
  if (insertErr) return { seeded: false, error: insertErr.message };

  return { seeded: true, error: null };
}

export interface CategoryInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
}

export async function createCategory(
  db: SupabaseClient,
  userId: string,
  input: CategoryInput,
): Promise<{ error: string | null }> {
  const { error } = await db.from('categories').insert({
    user_id: userId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    icon: input.icon || null,
    color: input.color || null,
    is_default: false,
  });
  return { error: error?.message ?? null };
}

export async function updateCategory(
  db: SupabaseClient,
  userId: string,
  categoryId: number,
  input: CategoryInput,
): Promise<{ error: string | null }> {
  const { error } = await db
    .from('categories')
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      icon: input.icon || null,
      color: input.color || null,
    })
    .eq('id', categoryId)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function deleteCategory(
  db: SupabaseClient,
  userId: string,
  categoryId: number,
): Promise<{ error: string | null }> {
  // Clear FK references first — only for this user's transactions
  await db
    .from('transactions')
    .update({ category_id: null, category_name: 'Uncategorized' })
    .eq('category_id', categoryId)
    .eq('user_id', userId);

  const { error } = await db.from('categories').delete().eq('id', categoryId).eq('user_id', userId);
  return { error: error?.message ?? null };
}

// ─── Recurring Transaction Mutations ─────────────────────────────────────────

export interface RecurringTransactionInput {
  name: string;
  amount: number;
  type: TransactionType;
  frequency: RecurringFrequency;
  account_type: string;
  start_date: string;
  end_date: string | null;
  category_id: number | null;
  category_name: string | null;
  merchant_id: string | null;
  description: string | null;
}

export async function createRecurringTransaction(
  db: SupabaseClient,
  userId: string,
  input: RecurringTransactionInput,
): Promise<{ error: string | null }> {
  const { error } = await db.from('recurring_transactions').insert({
    user_id: userId,
    name: input.name.trim(),
    amount: input.amount,
    type: input.type,
    frequency: input.frequency,
    account_type: input.account_type,
    start_date: input.start_date,
    end_date: input.end_date,
    category_id: input.category_id,
    category_name: input.category_name,
    merchant_id: input.merchant_id,
    description: input.description?.trim() || null,
  });
  return { error: error?.message ?? null };
}

export async function updateRecurringTransaction(
  db: SupabaseClient,
  userId: string,
  id: number,
  input: RecurringTransactionInput,
): Promise<{ error: string | null }> {
  const { error } = await db
    .from('recurring_transactions')
    .update({
      name: input.name.trim(),
      amount: input.amount,
      type: input.type,
      frequency: input.frequency,
      account_type: input.account_type,
      start_date: input.start_date,
      end_date: input.end_date,
      category_id: input.category_id,
      category_name: input.category_name,
      merchant_id: input.merchant_id,
      description: input.description?.trim() || null,
    })
    .eq('id', id)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function deleteRecurringTransaction(
  db: SupabaseClient,
  userId: string,
  id: number,
): Promise<{ error: string | null }> {
  const { error } = await db.from('recurring_transactions').delete().eq('id', id).eq('user_id', userId);
  return { error: error?.message ?? null };
}

// ─── Merchant Mutations ──────────────────────────────────────────────────────

export interface MerchantInput {
  merchant_name: string;
}

export async function createMerchant(
  db: SupabaseClient,
  userId: string,
  input: MerchantInput,
): Promise<{ error: string | null }> {
  const name = input.merchant_name.trim();
  const { error } = await db.from('merchants').insert({
    user_id: userId,
    merchant_name: name,
    normalized_name: name.toLowerCase(),
    transaction_count: 0,
  });
  return { error: error?.message ?? null };
}

export async function updateMerchant(
  db: SupabaseClient,
  userId: string,
  merchantId: string,
  input: MerchantInput,
): Promise<{ error: string | null }> {
  const name = input.merchant_name.trim();
  const { error } = await db
    .from('merchants')
    .update({
      merchant_name: name,
      normalized_name: name.toLowerCase(),
    })
    .eq('id', merchantId)
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function deleteMerchant(
  db: SupabaseClient,
  userId: string,
  merchantId: string,
): Promise<{ transactionCount: number; recurringCount: number; error: string | null }> {
  // Count affected transactions
  const { count: txCount } = await db
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .eq('user_id', userId);

  // Count affected recurring transactions
  const { count: recurCount } = await db
    .from('recurring_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .eq('user_id', userId);

  // Null out transaction FKs
  await db
    .from('transactions')
    .update({ merchant_id: null })
    .eq('merchant_id', merchantId)
    .eq('user_id', userId);

  // Null out recurring transaction FKs
  await db
    .from('recurring_transactions')
    .update({ merchant_id: null })
    .eq('merchant_id', merchantId)
    .eq('user_id', userId);

  // Delete the merchant
  const { error } = await db.from('merchants').delete().eq('id', merchantId).eq('user_id', userId);

  return {
    transactionCount: txCount ?? 0,
    recurringCount: recurCount ?? 0,
    error: error?.message ?? null,
  };
}

// ─── Account Balance Mutations ───────────────────────────────────────────────

export async function updateAccountBalance(
  db: SupabaseClient,
  userId: string,
  accountType: string,
  newBalance: number,
): Promise<{ error: string | null }> {
  const { error } = await db
    .from('account_balances')
    .update({ current_balance: newBalance, last_updated: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('account_type', accountType);
  return { error: error?.message ?? null };
}
