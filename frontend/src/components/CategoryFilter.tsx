import React from 'react';

interface CategoryFilterProps {
  value: string;
  onChange: (category: string) => void;
  categories: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ value, onChange, categories }) => {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-400">Filter by:</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="glass-input py-1.5 px-3 appearance-none min-w-[120px] text-sm"
      >
        <option value="" className="bg-dark-900">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat} className="bg-dark-900">{cat}</option>
        ))}
      </select>
    </div>
  );
};
