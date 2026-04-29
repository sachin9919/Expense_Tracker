import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="glass-button glass-button-secondary !p-2 disabled:opacity-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-sm text-gray-400 px-4">
        Page <span className="text-white font-medium">{page}</span> of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="glass-button glass-button-secondary !p-2 disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
