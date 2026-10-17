'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const mockResourceData = [
  { name: 'ICU Beds', total: 100, allocated: 68, available: 32 },
  { name: 'Ventilators', total: 60, allocated: 45, available: 15 },
  { name: 'Oxygen Cyl.', total: 250, allocated: 190, available: 60 },
  { name: 'ECMO Units', total: 20, allocated: 14, available: 6 },
  { name: 'Staff Teams', total: 40, allocated: 35, available: 5 },
];

export function MetricsOverview() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">Simulated Resource Demands</h3>
          <p className="text-xs text-zinc-400">Preview of medical assets to be optimized by MedAlloc engine</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-cyan-500" />
            <span className="text-zinc-300">Allocated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span className="text-zinc-300">Available</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockResourceData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: '#27272a',
                borderRadius: '8px',
                color: '#fafafa',
              }}
            />
            <Bar dataKey="allocated" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="available" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
