'use client';

import React, { useState, useEffect } from 'react';
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
import {
  RESOURCE_DISTRIBUTION_DATA,
  DAILY_ALLOCATION_TREND_DATA,
  HOSPITAL_CAPACITY_DATA,
} from '@/lib/mockData';
import { PieChart as PieIcon, TrendingUp, Building2 } from 'lucide-react';

export function ChartsSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-80 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs animate-pulse flex items-center justify-center text-slate-400 text-xs"
          >
            Loading analytics visualization...
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Chart 1: Daily Allocation Trend (AreaChart) - Spans 7 columns on desktop */}
      <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span>Real-Time Triage Trend</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Daily Allocation Trend
            </h3>
            <p className="text-xs text-slate-500">
              Emergency requests received vs successful hospital dispatches (Today)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Requests
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Allocated
            </span>
          </div>
        </div>

        {/* Chart Body */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={DAILY_ALLOCATION_TREND_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRequests)"
                name="Requests Received"
              />
              <Area
                type="monotone"
                dataKey="allocated"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAllocated)"
                name="Successfully Allocated"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Footer Stats */}
        <div className="pt-4 mt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Peak Triage Hour</span>
            <span className="font-bold text-slate-800">22:00 (189)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Matching Accuracy</span>
            <span className="font-bold text-emerald-600">98.4%</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Avg Response Time</span>
            <span className="font-bold text-blue-600">4.2 mins</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Resource Distribution (Donut Chart) - Spans 5 columns */}
      <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        {/* Header */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <PieIcon className="h-4 w-4" />
            <span>Inventory Composition</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Resource Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Available medical assets indexed across the 5 regional facilities
          </p>
        </div>

        {/* Donut Chart */}
        <div className="h-56 sm:h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={RESOURCE_DISTRIBUTION_DATA}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {RESOURCE_DISTRIBUTION_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} units`, 'Available Stock']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900">974</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Units
            </span>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RESOURCE_DISTRIBUTION_DATA.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="truncate">
                <span className="text-slate-600 truncate block text-[11px]">{item.name}</span>
                <span className="font-bold text-slate-900 text-xs">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3: Hospital Capacity (BarChart) - Spans full 12 columns */}
      <div className="lg:col-span-12 rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <Building2 className="h-4 w-4" />
              <span>Facility Utilization</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Hospital Capacity & Regional Occupancy
            </h3>
            <p className="text-xs text-slate-500">
              Real-time bed occupancy vs available reserve across the 5 network nodes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Occupied Beds
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Available Reserve
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={HOSPITAL_CAPACITY_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="occupied"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                name="Occupied Beds"
                maxBarSize={44}
              />
              <Bar
                dataKey="available"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Available Beds"
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
