import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({
  title = 'Connection Error',
  message,
  onRetry,
  className,
}: ErrorCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-red-200/90 bg-red-50/60 p-5 sm:p-6 text-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-red-700 font-semibold text-xs border border-red-200 shadow-2xs hover:shadow-xs transition-all self-end sm:self-center shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
