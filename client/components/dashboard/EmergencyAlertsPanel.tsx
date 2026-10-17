'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { EMERGENCY_ALERTS_DATA, EmergencyAlertItem } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export function EmergencyAlertsPanel() {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Warning' | 'Info'>('All');
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const toggleAcknowledge = (id: string) => {
    if (acknowledged.includes(id)) {
      setAcknowledged(acknowledged.filter((item) => item !== id));
    } else {
      setAcknowledged([...acknowledged, id]);
    }
  };

  const filteredAlerts = EMERGENCY_ALERTS_DATA.filter((alert) => {
    if (filter === 'All') return true;
    return alert.level === filter;
  });

  const getAlertIcon = (level: EmergencyAlertItem['level']) => {
    switch (level) {
      case 'Critical':
        return ShieldAlert;
      case 'Warning':
        return AlertTriangle;
      case 'Info':
      default:
        return Info;
    }
  };

  const getAlertStyles = (level: EmergencyAlertItem['level']) => {
    switch (level) {
      case 'Critical':
        return {
          cardBg: 'bg-red-50/40 border-red-200/80 hover:border-red-300',
          badge: 'bg-red-100 text-red-700 border-red-200',
          iconColor: 'text-red-600',
          accent: 'border-l-4 border-l-red-500',
        };
      case 'Warning':
        return {
          cardBg: 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          iconColor: 'text-amber-600',
          accent: 'border-l-4 border-l-amber-500',
        };
      case 'Info':
      default:
        return {
          cardBg: 'bg-blue-50/40 border-blue-200/80 hover:border-blue-300',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          iconColor: 'text-blue-600',
          accent: 'border-l-4 border-l-blue-500',
        };
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-200/70 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Emergency Alerts & Dispatch Warnings
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                {EMERGENCY_ALERTS_DATA.filter((a) => a.level === 'Critical').length} Critical
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Live hospital shortages, mass trauma casualty notifications, and roadway adjustments
            </p>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 p-1 rounded-xl border border-slate-200/80">
          {(['All', 'Critical', 'Warning', 'Info'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                filter === lvl
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.level);
          const styles = getAlertStyles(alert.level);
          const isAck = acknowledged.includes(alert.id);

          return (
            <div
              key={alert.id}
              className={cn(
                'rounded-xl border p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group',
                styles.cardBg,
                styles.accent,
                isAck && 'opacity-60 bg-slate-50 border-slate-200'
              )}
            >
              {/* Left Details */}
              <div className="flex items-start gap-3 flex-1">
                <div className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', styles.badge)}>
                  <Icon className={cn('h-4 w-4', styles.iconColor)} />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {alert.title}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                        styles.badge
                      )}
                    >
                      {alert.level}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      • {alert.facility}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>Reported {alert.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => toggleAcknowledge(alert.id)}
                  className={cn(
                    'text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5',
                    isAck
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs'
                  )}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {isAck ? 'Acknowledged' : 'Acknowledge'}
                </button>

                {alert.actionLabel && (
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1">
                    <span>{alert.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
