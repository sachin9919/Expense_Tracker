import React from 'react';

interface SummaryCardProps {
  totalAmount: number;
  categoryTotals: { category: string; amount: number }[];
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

export const SummaryCard: React.FC<SummaryCardProps> = ({ totalAmount, categoryTotals }) => {
  return (
    <div className="glass-card mt-8 flex flex-col items-center justify-center py-10 relative">
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Expenses</h3>
      <div className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-emerald-400 mb-8">
        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {categoryTotals.length > 0 && (
        <div className="w-full">
          <div className="flex flex-wrap justify-center gap-3">
            {categoryTotals.map((item) => (
              <div 
                key={item.category}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border animate-fade-slide ${getCategoryColor(item.category)}`}
              >
                <span className="text-xs font-medium uppercase opacity-70">{item.category}</span>
                <span className="text-sm font-bold">₹{item.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Decorative background glow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-primary/20 blur-[80px] pointer-events-none" />
    </div>
  );
};
