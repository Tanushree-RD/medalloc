'use client';

import React, { useState } from 'react';
import {
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { useMedAlloc } from '@/context/MedAllocContext';
import { AllocationResultData, AllocationHistoryItem, PriorityLevel } from '@/lib/types';

export function AllocationHistoryView() {
  const {
    allocationHistory,
    openProcessModalWithData,
    globalSearchQuery,
  } = useMedAlloc();

  const [searchFilter, setSearchFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');

  const effectiveSearch = searchFilter || globalSearchQuery;

  // Filter history
  const filteredHistory = allocationHistory.filter((item) => {
    const matchesSearch =
      !effectiveSearch ||
      item.patient.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.hospital.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.resource.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleOpenProcess = (item: AllocationHistoryItem) => {
    const processData: AllocationResultData = {
      requestId: item.requestId || `REQ-${item.id.replace('ALC-', '')}`,
      allocationId: item.id,
      patientName: item.patient,
      resource: item.resource,
      quantity: item.quantity,
      priority: item.priority,
      assignedHospital: item.hospital,
      distanceKm: item.distance,
      estimatedArrivalTime: item.estimatedArrivalTime || '10 mins',
      timestamp: item.timestamp,
      availableUnits: 12,
      previousInventoryStock: 12,
      updatedInventoryStock: 12 - item.quantity,
      reasonSelected: item.reasonSelected || 'Lowest transit distance with guaranteed reserve.',
      emergencyReason: 'Emergency clinical triage intake dispatch.',
      status: item.status === 'Completed' ? 'Completed' : 'Allocated',
    };
    openProcessModalWithData(processData);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
            Allocation & Dispatch Ledger
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
            Complete auditable historical record of hospital matching decisions and transit telemetry.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search ledger..."
              className="w-full h-9 pl-9 pr-3 rounded-full bg-white border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-black/[0.04]">
            {(['All', 'Critical', 'High', 'Medium'] as Array<'All' | PriorityLevel>).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-neutral-950 text-white shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-black/[0.04] shadow-editorial overflow-hidden">
        <div className="divide-y divide-black/[0.04]">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              No allocation records found
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors group"
              >
                {/* Left: Patient & Route */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        item.priority === 'Critical'
                          ? 'bg-rose-500'
                          : item.priority === 'High'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="text-sm font-semibold tracking-tight text-neutral-950">
                      {item.patient}
                    </span>
                    <span className="text-xs text-neutral-400">
                      → {item.hospital}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      ({item.id})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="font-medium text-neutral-700">
                      {item.resource} ({item.quantity} units)
                    </span>
                    <span>•</span>
                    <span className="font-mono text-neutral-500">
                      {item.distance} km · {item.estimatedArrivalTime}
                    </span>
                    <span>•</span>
                    <span className="text-neutral-400">{item.timestamp}</span>
                  </div>
                </div>

                {/* Right: Status & Inspect Action */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item.status}
                  </span>

                  <button
                    onClick={() => handleOpenProcess(item)}
                    className="p-2 rounded-full bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white text-neutral-700 transition cursor-pointer"
                    title="Inspect telemetry"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
