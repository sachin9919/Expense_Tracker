import React from 'react';
import { format } from 'date-fns';
import { RefreshCw, Inbox } from 'lucide-react';
import type { Expense } from '../types';
import { SkeletonRow } from './SkeletonRow';

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Food': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'Transport': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'Shopping': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    case 'Health': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'Other':
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, isLoading, isError, onRetry }) => {
  
  if (isError) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-danger mb-4">Failed to load expenses.</p>
        <button onClick={onRetry} className="glass-button glass-button-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-x-auto p-0">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-white/5 border-b border-white/10 text-gray-400">
          <tr>
            <th className="p-4 font-medium rounded-tl-2xl">Date</th>
            <th className="p-4 font-medium">Category</th>
            <th className="p-4 font-medium">Description</th>
            <th className="p-4 font-medium text-right rounded-tr-2xl">Amount</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : expenses.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-12 text-center text-gray-400">
                <div className="flex flex-col items-center justify-center space-y-3 animate-fade-slide">
                  <Inbox className="w-12 h-12 text-white/20" />
                  <p>No expenses yet. Add your first one.</p>
                </div>
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id} className="glass-table-row animate-fade-slide group">
                <td className="p-4 text-gray-300">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs border ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="p-4 text-gray-200">
                  {expense.description}
                </td>
                <td className="p-4 text-right font-medium text-gray-100 group-hover:text-primary transition-colors">
                  ₹{expense.amount.toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
