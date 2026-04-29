export interface Expense {
  id: string;
  amount: number; // Stored as paise in DB, returned as float
  category: string;
  description: string;
  date: string;
  created_at: string;
  idempotency_key: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  meta: {
    totalAmount: number;
  };
}

export type ExpensePayload = Omit<Expense, 'id' | 'created_at'>;
