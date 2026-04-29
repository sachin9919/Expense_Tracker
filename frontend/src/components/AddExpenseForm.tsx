import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useCreateExpenseMutation } from '../hooks/useExpenses';
import { useToast } from '../context/ToastContext';
import type { ExpensePayload } from '../types';

const CATEGORIES = ["Food", "Transport", "Shopping", "Health", "Other"];

export const AddExpenseForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const { mutateAsync, isPending } = useCreateExpenseMutation();

  // Generate idempotency key once on mount
  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid positive amount";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!date) {
      newErrors.date = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: ExpensePayload = {
        amount: Number(amount),
        category,
        description,
        date,
        idempotency_key: idempotencyKey,
      };

      await mutateAsync(payload);
      
      showToast('Expense added successfully!', 'success');
      
      // Reset form on success
      setAmount('');
      setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setCategory(CATEGORIES[0]);
      setErrors({});
      // Regenerate idempotency key ONLY after successful submission
      setIdempotencyKey(uuidv4());
      
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to add expense', 'error');
    }
  };

  return (
    <div className="glass-card mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <PlusCircle className="text-primary" />
        Add New Expense
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`glass-input !pl-10 ${errors.amount ? 'border-danger/50 focus:border-danger focus:ring-danger/50' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="glass-input appearance-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-dark-900 text-white">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`glass-input ${errors.description ? 'border-danger/50 focus:border-danger focus:ring-danger/50' : ''}`}
              placeholder="What did you spend on?"
              maxLength={255}
            />
            {errors.description && <p className="text-danger text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input 
              type="date" 
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className={`glass-input [color-scheme:dark] ${errors.date ? 'border-danger/50 focus:border-danger focus:ring-danger/50' : ''}`}
            />
            {errors.date && <p className="text-danger text-xs mt-1">{errors.date}</p>}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="glass-button glass-button-primary w-full md:w-auto min-w-[150px]"
          >
            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};
