import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseAPI, type CreateExpenseData } from '../api/expenses';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
}

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

export const ExpenseModal = ({ isOpen, onClose, expense }: ExpenseModalProps) => {
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [category, setCategory] = useState(expense?.category || 'food');
  const [description, setDescription] = useState(expense?.description || '');
  const [date, setDate] = useState(expense?.date ? format(new Date(expense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));

  const queryClient = useQueryClient();

  // Sync form state when expense prop changes (for edit mode)
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount?.toString() || '');
      setCategory(expense.category || 'food');
      setDescription(expense.description || '');
      setDate(expense.date ? format(new Date(expense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    } else {
      setAmount('');
      setCategory('food');
      setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [expense]);

  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseData) => expenseAPI.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create expense');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateExpenseData }) => expenseAPI.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update expense');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: CreateExpenseData = {
      amount: parseFloat(amount),
      category,
      description,
      date,
    };

    if (expense) {
      updateMutation.mutate({ id: expense._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="e.g., Lunch at restaurant"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex space-x-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending)
                ? 'Saving...'
                : expense
                ? 'Update'
                : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
