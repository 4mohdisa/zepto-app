import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../supabase/useSupabase';

interface AccountBalance {
  accountType: string;
  balance: number;
}

interface AccountSummary {
  totalBalance: number;
  accounts: AccountBalance[];
  incomeThisMonth: number;
  expensesThisMonth: number;
  netBalance: number;
  savingsRate: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAccountSummary(startDate: string, endDate: string): AccountSummary {
  const db = useSupabase();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accountSummary', startDate, endDate],
    queryFn: async () => {
      const [balancesResult, monthlyResult] = await Promise.all([
        db.from('account_balances').select('account_type, current_balance'),
        db.from('transactions').select('amount, type').gte('date', startDate).lte('date', endDate),
      ]);

      if (balancesResult.error) throw new Error(balancesResult.error.message);
      if (monthlyResult.error) throw new Error(monthlyResult.error.message);

      const balances = balancesResult.data ?? [];
      const accounts = balances.map((row) => ({
        accountType: row.account_type as string,
        balance: Number(row.current_balance),
      }));
      const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

      const monthly = monthlyResult.data ?? [];
      const incomeThisMonth = monthly.filter((r) => r.type === 'Income').reduce((sum, r) => sum + Number(r.amount), 0);
      const expensesThisMonth = monthly.filter((r) => r.type === 'Expense').reduce((sum, r) => sum + Number(r.amount), 0);

      const netBalance = incomeThisMonth - expensesThisMonth;
      const savingsRate = incomeThisMonth > 0 ? Math.round((netBalance / incomeThisMonth) * 1000) / 10 : 0;

      return { totalBalance, accounts, incomeThisMonth, expensesThisMonth, netBalance, savingsRate };
    },
  });

  return {
    totalBalance: data?.totalBalance ?? 0,
    accounts: data?.accounts ?? [],
    incomeThisMonth: data?.incomeThisMonth ?? 0,
    expensesThisMonth: data?.expensesThisMonth ?? 0,
    netBalance: data?.netBalance ?? 0,
    savingsRate: data?.savingsRate ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
