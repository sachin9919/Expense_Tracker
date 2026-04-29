import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownAZ, ArrowUpZA, LogOut } from 'lucide-react';
import { AddExpenseForm } from '../components/AddExpenseForm';
import { ExpenseTable } from '../components/ExpenseTable';
import { CategoryFilter } from '../components/CategoryFilter';
import { Pagination } from '../components/Pagination';
import { SummaryCard } from '../components/SummaryCard';
import { useExpensesQuery } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ["Food", "Transport", "Shopping", "Health", "Other"];

export const Dashboard: React.FC = () => {
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [page, setPage] = useState<number>(1);
  const { user, logout } = useAuth();

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('category')) setCategory(params.get('category')!);
    if (params.has('sort')) setSort(params.get('sort') as 'date_desc' | 'date_asc');
    if (params.has('page')) setPage(Number(params.get('page')));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('sort', sort);
    params.set('page', page.toString());
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [category, sort, page]);

  // Reset page to 1 when category or sort changes
  useEffect(() => {
    setPage(1);
  }, [category, sort]);

  const { data, isLoading, isError, refetch } = useExpensesQuery({ category, sort, page, limit: 10 });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              ExpenseTracker
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Logged in as</p>
              <p className="text-sm font-bold text-white">{user?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="glass-button glass-button-secondary !py-2 px-4 flex items-center gap-2 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-danger transition-colors" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main>
          <AddExpenseForm />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold">Recent Expenses</h2>
            <div className="flex items-center gap-4">
              <CategoryFilter 
                value={category} 
                onChange={setCategory} 
                categories={CATEGORIES} 
              />
              <button
                onClick={() => setSort(s => s === 'date_desc' ? 'date_asc' : 'date_desc')}
                className="glass-button glass-button-secondary !p-2 rounded-full"
                title="Toggle Sort Order"
              >
                {sort === 'date_desc' ? <ArrowDownAZ className="w-5 h-5" /> : <ArrowUpZA className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <ExpenseTable 
            expenses={data?.data || []} 
            isLoading={isLoading} 
            isError={isError} 
            onRetry={() => refetch()} 
          />

          {data?.pagination && (
            <Pagination 
              pagination={data.pagination} 
              onPageChange={setPage} 
            />
          )}

          <SummaryCard 
            totalAmount={data?.meta?.totalAmount || 0} 
            categoryTotals={data?.meta?.categoryTotals || []}
          />
        </main>
      </div>
    </div>
  );
};
