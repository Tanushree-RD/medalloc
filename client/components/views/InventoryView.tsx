'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  RefreshCw,
  Clock,
  Droplet,
  BedDouble,
  Pill,
  Wind,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { cn } from '@/lib/utils';

export function InventoryView() {
  const { inventory, metadata, isLoading, error, lastRefreshed, refetch } = useInventory(30000);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(30);

  // 30-second live countdown timer
  useEffect(() => {
    setSecondsUntilRefresh(30);
    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefreshed]);

  const categories = ['All', 'Blood Products', 'Critical Care Beds', 'Respiratory Care', 'Pharmaceuticals', 'Emergency Equipment'];

  const filteredItems = inventory.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Blood Products':
        return Droplet;
      case 'Critical Care Beds':
        return BedDouble;
      case 'Respiratory Care':
      case 'Emergency Equipment':
        return Wind;
      case 'Pharmaceuticals':
      default:
        return Pill;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
            <Package className="h-4 w-4" />
            <span>Regional Stockpile Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Live Regional Inventory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Synchronized with Hash Map Separate Chaining data store • Auto-refreshes every 30 seconds
          </p>
        </div>

        {/* Live Auto-Refresh Pill & Manual Refresh */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <Clock className="h-3.5 w-3.5 text-blue-600 animate-spin" />
            <span>
              Auto-refresh in: <strong className="text-blue-700 font-mono">{secondsUntilRefresh}s</strong>
            </span>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorCard
          title="Inventory Sync Error"
          message={error}
          onRetry={refetch}
        />
      )}

      {/* Quick Summary Cards */}
      {metadata && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Cataloged Assets</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metadata.totalUnits.toLocaleString()} units</span>
            <span className="text-[11px] text-slate-400 block mt-1">Across 5 regional hubs</span>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Low Stock Alerts</span>
            <span className={`text-2xl sm:text-3xl font-extrabold ${metadata.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {metadata.lowStockCount} items
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Near or below safe buffer threshold</span>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Last Verified Sync</span>
            <span className="text-sm sm:text-base font-bold text-slate-800 font-mono">
              {lastRefreshed.toLocaleTimeString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">✓ Live telemetry stream active</span>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white border border-slate-200/80 p-4 shadow-xs animate-pulse" />
          ))}
        </div>
      )}

      {/* Live Inventory Table */}
      {!isLoading && !error && (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Resource Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Hospital Facility</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => {
                  const Icon = getCategoryIcon(item.category);
                  const isLow = item.status === 'Low' || item.stock <= item.minThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{item.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{item.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {item.category}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.hospitalName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-sm font-extrabold text-slate-900 font-mono">
                          {item.stock} {item.unit}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-normal">
                          Min safety buffer: {item.minThreshold} {item.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            isLow
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isLow ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
