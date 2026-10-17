'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Building2, RefreshCw } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { ChartsSkeleton } from '@/components/ui/LoadingSkeleton';

export function AnalyticsView() {
  const { analytics, isLoading, error, refetch } = useAnalytics();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <BarChart3 className="h-4 w-4" />
            <span>Triage Telemetry & Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Emergency Dispatch Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time charts powered by the Express backend API and Recharts engine
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Error Card */}
      {error && (
        <ErrorCard
          title="Analytics Fetch Error"
          message={error}
          onRetry={refetch}
        />
      )}

      {/* Loading Skeletons */}
      {isLoading && <ChartsSkeleton />}

      {/* Live Charts */}
      {!isLoading && !error && analytics && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Peak Triage Hour</span>
              <p className="text-2xl font-extrabold text-slate-900">{analytics.kpis.peakHour}</p>
              <span className="text-[11px] text-slate-400">Highest volume window</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Matching Accuracy</span>
              <p className="text-2xl font-extrabold text-emerald-600">{analytics.kpis.matchingAccuracy}</p>
              <span className="text-[11px] text-slate-400">Zero duplicate allocations</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Avg Response Time</span>
              <p className="text-2xl font-extrabold text-blue-600">{analytics.kpis.avgResponseTime}</p>
              <span className="text-[11px] text-slate-400">From request to dispatch</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Regional Occupancy</span>
              <p className="text-2xl font-extrabold text-slate-900">{analytics.kpis.occupancyRate}</p>
              <span className="text-[11px] text-slate-400">{analytics.kpis.totalCapacity} total beds tracked</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Daily Allocation Trend */}
            <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>24-Hour Dispatch Activity</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Live Allocation Trend</h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyAllocationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="anAllocated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={2.5} fill="url(#anRequests)" name="Requests" />
                    <Area type="monotone" dataKey="allocated" stroke="#10b981" strokeWidth={2.5} fill="url(#anAllocated)" name="Allocated" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Resource Distribution */}
            <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  <PieIcon className="h-4 w-4" />
                  <span>Resource Breakdown</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Stockpile Composition</h3>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.resourceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.resourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} units`, 'Stock']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {analytics.resourceDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate text-[11px]">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3: Hospital Capacity */}
            <div className="lg:col-span-12 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                    <Building2 className="h-4 w-4" />
                    <span>Regional Facility Utilization</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Capacity vs Occupancy by Hospital</h3>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.hospitalCapacity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="occupied" fill="#2563eb" radius={[6, 6, 0, 0]} name="Occupied Beds" />
                    <Bar dataKey="available" fill="#10b981" radius={[6, 6, 0, 0]} name="Available Reserve" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
