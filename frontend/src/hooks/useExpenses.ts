import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExpenses, createExpense } from '../api/expenses';
import type { FetchExpensesParams } from '../api/expenses';
import type { ExpensePayload } from '../types';

export const useExpensesQuery = (params: FetchExpensesParams) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => fetchExpenses(params),
    staleTime: 30000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpensePayload) => createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
