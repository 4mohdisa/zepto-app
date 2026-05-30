import React from 'react';
import { DataRow } from './DataRow';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { COLOURS } from '@/constants/theme';
import type { Transaction } from '@/types';

interface TransactionRowProps {
  transaction: Transaction;
  isLast?: boolean;
  onPress?: () => void;
}

export const TransactionRow = React.memo(function TransactionRow({
  transaction,
  isLast = false,
  onPress,
}: TransactionRowProps) {
  const isIncome = transaction.type === 'Income';
  const sign = isIncome ? '+' : '-';

  return (
    <DataRow
      title={transaction.name}
      subtitle={transaction.category_name ?? transaction.account_type ?? '—'}
      rightText={`${sign}${formatCurrency(transaction.amount)}`}
      rightTextColor={isIncome ? COLOURS.income : COLOURS.expense}
      rightSubtext={formatDate(transaction.date)}
      showDivider={!isLast}
      onPress={onPress}
    />
  );
});
