import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseAPI } from '../api/expenses';
import { format } from 'date-fns';
import { ExpenseModal } from '../components/ExpenseModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  food: '#EF4444',
  transport: '#3B82F6',
  utilities: '#8B5CF6',
  entertainment: '#EC4899',
  healthcare: '#10B981',
  shopping: '#F59E0B',
  other: '#6B7280',
};

const CATEGORY_LABELS = {
  food: 'Food',
  transport: 'Transport',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  healthcare: 'Healthcare',
  shopping: 'Shopping',
  other: 'Other',
};

const CATEGORY_ICONS = {
  food: '🍔',
  transport: '🚗',
  utilities: '💡',
  entertainment: '🎬',
  healthcare: '⚕️',
  shopping: '🛍️',
  other: '📌',
};

export const ExpensesPage = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', page, category],
    queryFn: async () => {
      const response = await expenseAPI.getExpenses({
        page,
        limit: 10,
        ...(category && { category }),
      });
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseAPI.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete expense');
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-gray-300 font-medium">Loading expenses...</p>
        </div>
      </div>
    );
  }

  const expenses = data?.expenses || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };
  
  const filteredExpenses = expenses.filter((expense: any) =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalAmount = filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Modern Header */}
      <div className="bg-gray-800/70 backdrop-blur-xl shadow-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4 animate-fade-in min-w-0">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 hover:scale-110 shadow-md flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gradient truncate">All Expenses</h1>
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2 truncate">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                    <span className="truncate">{user?.email}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedExpense(null);
                  setIsModalOpen(true);
                }}
                className="btn-primary text-xs sm:text-sm flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Expense</span>
              </button>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 animate-slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Total Expenses</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-100 truncate">₹{totalAmount.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Total Count</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-100">{filteredExpenses.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="stat-card sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Average</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-100 truncate">
                  ₹{filteredExpenses.length > 0 ? (totalAmount / filteredExpenses.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="card mb-4 sm:mb-6 animate-slide-up border border-gray-700" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Expenses
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by description..."
                className="input-field"
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {CATEGORY_ICONS[value as keyof typeof CATEGORY_ICONS]} {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active Filter Tags */}
          {(category || searchQuery) && (
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-400">Active filters:</span>
              {category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                  {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  <button onClick={() => setCategory('')} className="ml-1 hover:text-blue-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium border border-purple-500/30">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-purple-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button 
                onClick={() => { setCategory(''); setSearchQuery(''); }}
                className="text-sm text-gray-400 hover:text-gray-200 font-medium underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Expense List */}
        <div className="card overflow-hidden animate-slide-up border border-gray-700" style={{ animationDelay: '0.2s' }}>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">No expenses found</h3>
              <p className="text-sm text-gray-400 mb-6">
                {searchQuery || category ? 'Try adjusting your filters' : 'Get started by adding a new expense'}
              </p>
              {!searchQuery && !category && (
                <button
                  onClick={() => {
                    setSelectedExpense(null);
                    setIsModalOpen(true);
                  }}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Expense
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600 bg-gray-800/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense: any, index: number) => (
                    <tr 
                      key={expense._id} 
                      className="border-b border-gray-700 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-md">
                            {CATEGORY_ICONS[expense.category as keyof typeof CATEGORY_ICONS]}
                          </div>
                          <div className="text-sm font-semibold text-gray-200">{expense.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className="px-3 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                          style={{
                            backgroundColor: COLORS[expense.category as keyof typeof COLORS] + '20',
                            color: COLORS[expense.category as keyof typeof COLORS],
                            border: `1.5px solid ${COLORS[expense.category as keyof typeof COLORS]}40`,
                          }}
                        >
                          {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS]}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-300 font-medium flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{expense.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right relative z-10">
                        {deleteConfirm === expense._id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDelete(expense._id)}
                              disabled={deleteMutation.isPending}
                              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 relative z-20"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 bg-gray-700 text-gray-200 text-xs font-bold rounded-lg hover:bg-gray-600 transition-colors relative z-20"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-400 border border-blue-500/40 hover:bg-blue-500/20 rounded-lg transition-all duration-200 hover:scale-110 relative z-20"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(expense._id)}
                              className="p-2 text-red-400 border border-red-500/40 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110 relative z-20"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-700">
                {filteredExpenses.map((expense: any) => (
                  <div key={expense._id} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-md flex-shrink-0">
                          {CATEGORY_ICONS[expense.category as keyof typeof CATEGORY_ICONS]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-200 truncate">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className="px-2 py-0.5 text-xs font-bold rounded-lg inline-flex items-center gap-1"
                              style={{
                                backgroundColor: COLORS[expense.category as keyof typeof COLORS] + '20',
                                color: COLORS[expense.category as keyof typeof COLORS],
                                border: `1px solid ${COLORS[expense.category as keyof typeof COLORS]}40`,
                              }}
                            >
                              {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS]}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(expense.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{expense.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      {deleteConfirm === expense._id ? (
                        <>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 bg-gray-700 text-gray-200 text-xs font-bold rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-400 border border-blue-500/40 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(expense._id)}
                            className="p-2 text-red-400 border border-red-500/40 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-3 sm:px-6 py-3 sm:py-5 flex flex-col sm:flex-row items-center justify-between border-t border-gray-700 bg-gray-800/30 gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm font-medium text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Page <span className="font-bold text-blue-400">{pagination.page}</span> of <span className="font-bold">{pagination.pages}</span>
                <span className="text-gray-400">•</span>
                <span className="font-semibold">{pagination.total}</span> total
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  title="First Page"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 text-xs sm:text-sm font-medium hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 sm:gap-2"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 text-xs sm:text-sm font-medium hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 sm:gap-2"
                >
                  Next
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(pagination.pages)}
                  disabled={page === pagination.pages}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  title="Last Page"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExpenseModal
        key={selectedExpense?._id || 'new'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={selectedExpense}
      />
    </div>
  );
};
