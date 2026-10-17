'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto rounded-2xl p-4 shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3',
            toast.type === 'error' && 'bg-white border-red-200 text-slate-800 shadow-red-500/10',
            toast.type === 'success' && 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
            toast.type === 'info' && 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10'
          )}
        >
          {toast.type === 'error' && (
            <div className="h-8 w-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200/60">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          {toast.type === 'success' && (
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}

          <div className="flex-1 space-y-0.5">
            {toast.title && <h5 className="font-bold text-xs text-slate-900">{toast.title}</h5>}
            <p className="text-xs text-slate-600 leading-snug">{toast.message}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
