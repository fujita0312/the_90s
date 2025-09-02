import React, { createContext, useContext, useState, ReactNode } from 'react';
import { use90sFeatures } from '../hooks/use90sFeatures';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info', duration: number = 4000) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value: ToastContextType = {
    showToast,
    toasts,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Global Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="animate-slide-in"
          >
            <div className={`max-w-sm shadow-lg border-2 border-ridge rounded-lg p-4 ${
              toast.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
                  </span>
                  <p className="font-medium whitespace-pre-line text-sm">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/80 hover:text-white text-xl font-bold leading-none ml-4"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
