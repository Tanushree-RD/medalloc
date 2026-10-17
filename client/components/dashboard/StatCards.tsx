'use client';

import React from 'react';
import {
  AlertTriangle,
  Droplet,
  BedDouble,
  Pill,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { STAT_CARDS_DATA } from '@/lib/mockData';
import { StatCardItem } from '@/lib/types';
import { StatCardsSkeleton } from '@/components/ui/LoadingSkeleton';
import { cn } from '@/lib/utils';

interface StatCardsProps {
  cards?: StatCardItem[];
  isLoading?: boolean;
}

export function StatCards({ cards, isLoading }: StatCardsProps) {
  if (isLoading) {
    return <StatCardsSkeleton />;
  }

  const items = cards && cards.length > 0 ? cards : STAT_CARDS_DATA;

  const getCardIcon = (category: StatCardItem['category']) => {
    switch (category) {
      case 'requests':
        return AlertTriangle;
      case 'blood':
        return Droplet;
      case 'icu':
        return BedDouble;
      case 'medicine':
        return Pill;
      case 'allocations':
        return CheckCircle2;
      case 'critical':
        return ShieldAlert;
      default:
        return TrendingUp;
    }
  };

  const getStyleTokens = (category: StatCardItem['category']) => {
    switch (category) {
      case 'critical':
        return {
          iconBg: 'bg-red-50 text-red-600 border border-red-200/60',
          badgeBg: 'bg-red-50 text-red-700 border-red-200',
          accent: 'border-l-4 border-l-red-500',
        };
      case 'blood':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          accent: 'border-l-4 border-l-rose-500',
        };
      case 'icu':
        return {
          iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-200/60',
          badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          accent: 'border-l-4 border-l-cyan-500',
        };
      case 'medicine':
        return {
          iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          accent: 'border-l-4 border-l-purple-500',
        };
      case 'allocations':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accent: 'border-l-4 border-l-emerald-500',
        };
      case 'requests':
      default:
        return {
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          accent: 'border-l-4 border-l-blue-500',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
      {items.map((card) => {
        const Icon = getCardIcon(card.category);
        const styles = getStyleTokens(card.category);

        return (
          <div
            key={card.id}
            className={cn(
              'group relative rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden',
              styles.accent
            )}
          >
            {/* Top Row: Icon + Change Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
                  styles.iconBg
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border truncate',
                  styles.badgeBg
                )}
              >
                <ArrowUpRight className="h-3 w-3 shrink-0" />
                <span className="truncate">{card.change}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 line-clamp-1">
                {card.title}
              </span>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {card.value}
              </div>
            </div>

            {/* Subtitle / Context */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
