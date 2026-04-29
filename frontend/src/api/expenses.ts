import axios from 'axios';
import type { Expense, ExpensePayload, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FetchExpensesParams {
  category?: string;
  sort?: 'date_desc' | 'date_asc';
  page?: number;
  limit?: number;
}

export const fetchExpenses = async (params: FetchExpensesParams): Promise<PaginatedResponse<Expense>> => {
  const { data } = await api.get('/expenses', { params });
  return data;
};

export const createExpense = async (payload: ExpensePayload): Promise<Expense> => {
  const { data } = await api.post('/expenses', payload);
  return data;
};
