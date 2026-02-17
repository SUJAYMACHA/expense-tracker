import api from './client';

export interface Expense {
  _id: string;
  user: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface CreateExpenseData {
  amount: number;
  category: string;
  description: string;
  date?: string;
}

export interface ExpenseListResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const expenseAPI = {
  getExpenses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<ExpenseListResponse>('/expenses', { params }),
  
  getExpense: (id: string) =>
    api.get(`/expenses/${id}`),
  
  createExpense: (data: CreateExpenseData) =>
    api.post('/expenses', data),
  
  updateExpense: (id: string, data: CreateExpenseData) =>
    api.put(`/expenses/${id}`, data),
  
  deleteExpense: (id: string) =>
    api.delete(`/expenses/${id}`),
};
