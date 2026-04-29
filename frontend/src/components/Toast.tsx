import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-success/20 border-success/30' : 'bg-danger/20 border-danger/30';
  const textColor = type === 'success' ? 'text-success' : 'text-danger';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl animate-fade-slide min-w-[300px] ${bgColor}`}>
      <Icon className={`w-5 h-5 ${textColor}`} />
      <p className="text-sm font-medium text-white flex-1">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X className="w-4 h-4 text-white/50" />
      </button>
    </div>
  );
};
