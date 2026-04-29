import React from 'react';

export const SkeletonRow: React.FC = () => {
  return (
    <tr className="glass-table-row animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-white/10 rounded w-24"></div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-white/10 rounded-full w-20"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-white/10 rounded w-full max-w-[200px]"></div>
      </td>
      <td className="p-4 text-right">
        <div className="h-4 bg-white/10 rounded w-16 ml-auto"></div>
      </td>
    </tr>
  );
};
