import React from 'react';

interface SummaryCardProps {
  totalAmount: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ totalAmount }) => {
  return (
    <div className="glass-card mt-8 flex flex-col items-center justify-center py-8">
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Expenses</h3>
      <div className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-emerald-400">
        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {/* Category breakdown will be added in Phase 5 */}
    </div>
  );
};
