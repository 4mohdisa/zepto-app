// ─── Enums / union types (match DB check constraints exactly) ─────────────────

export type TransactionType = 'Income' | 'Expense';

export type AccountType =
  | 'Cash'
  | 'Savings'
  | 'Checking'
  | 'Credit Card'
  | 'Investment'
  | 'Other';

export type RecurringFrequency =
  | 'Daily'
  | 'Weekly'
  | 'Bi-Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Yearly';

// ─── DB row shapes ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string; // Clerk user ID (text PK)
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number; // serial PK
  user_id: string; // Clerk user ID
  category_id: number | null;
  name: string; // transaction title / merchant name
  description: string | null;
  amount: number; // always positive; `type` indicates direction
  type: TransactionType;
  account_type: AccountType | null;
  category_name: string | null; // denormalized copy
  date: string; // ISO date string YYYY-MM-DD
  recurring_frequency: string | null;
  transaction_hash: string | null;
  recurring_transaction_id: number | null;
  merchant_id: string | null; // uuid
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: string | null; // null = system default
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountBalance {
  id: number;
  user_id: string;
  account_type: AccountType;
  current_balance: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface Merchant {
  id: string;
  merchant_name: string;
  normalized_name: string;
  transaction_count: number | null;
  last_used_at: string | null;
}

export interface RecurringTransaction {
  id: number;
  user_id: string;
  category_id: number | null;
  name: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  account_type: string;
  category_name: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  merchant_id: string | null;
  created_at: string;
  updated_at: string;
}
