import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs',
        className
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="font-bold text-slate-800 text-base">{title}</h4>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
