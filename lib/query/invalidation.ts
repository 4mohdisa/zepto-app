import { queryClient } from './queryClient';

export function invalidateTransactions() {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
  queryClient.invalidateQueries({ queryKey: ['chartData'] });
  queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
  queryClient.invalidateQueries({ queryKey: ['merchantStats'] });
}

export function invalidateCategories() {
  queryClient.invalidateQueries({ queryKey: ['categories'] });
  queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
}

export function invalidateMerchants() {
  queryClient.invalidateQueries({ queryKey: ['merchants'] });
  queryClient.invalidateQueries({ queryKey: ['merchantStats'] });
}

export function invalidateRecurring() {
  queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
}

export function invalidateFeedback() {
  queryClient.invalidateQueries({ queryKey: ['feedback'] });
}

export function invalidateAll() {
  queryClient.invalidateQueries();
}
