
import React, { useState, useEffect } from 'react';
import { X, Check, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

// Simple event bus for toasts
type ToastEvent = {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
};

const listeners = new Set<(toast: ToastEvent) => void>();

export const toast = (props: Omit<ToastEvent, 'id'>) => {
  const event = { ...props, id: Math.random().toString(36).substring(2, 9) };
  listeners.forEach(l => l(event));
};

export const useToast = () => {
  return { toast };
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const handler = (event: ToastEvent) => {
      setToasts(prev => [...prev, event]);
      // Auto dismiss
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== event.id));
      }, 3000);
    };

    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 w-80 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300",
            "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            t.type === 'error' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
          )}>
            {t.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t.title}</h4>
            {t.description && (
              <p className="text-xs text-zinc-500 mt-1 break-words">{t.description}</p>
            )}
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
