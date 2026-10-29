'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  Building2,
  User,
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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Allocated' | 'Completed' | 'In-Transit'>('All');

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
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
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

  const totalAllocations = allocationHistory.length;
  const criticalCount = allocationHistory.filter((a) => a.priority === 'Critical').length;
  const completedCount = allocationHistory.filter((a) => a.status === 'Completed').length;
  const avgDistance =
    totalAllocations > 0
      ? (allocationHistory.reduce((acc, a) => acc + (a.distance || 0), 0) / totalAllocations).toFixed(1)
      : '0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Allocation History Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Auditable telemetry record of all historical patient-to-hospital resource assignments.
        </p>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Dispatches</span>
          <div className="text-2xl font-extrabold text-slate-900">{totalAllocations}</div>
          <span className="text-[11px] text-slate-400">All recorded matches</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Cases</span>
          <div className="text-2xl font-extrabold text-red-600">{criticalCount}</div>
          <span className="text-[11px] text-slate-400">Highest triage priority</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Distance</span>
          <div className="text-2xl font-extrabold text-blue-600">{avgDistance} km</div>
          <span className="text-[11px] text-slate-400">Dijkstra transit radius</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-600">{completedCount}</div>
          <span className="text-[11px] text-slate-400">Successfully finalized</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search patient, hospital, or ID..."
            className="w-full h-8.5 pl-9 pr-3 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Priority:</span>
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                  priorityFilter === p
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Status:</span>
            {(['All', 'Allocated', 'Completed', 'In-Transit'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-5">ID & Patient</th>
                <th className="py-3 px-5">Matched Facility</th>
                <th className="py-3 px-5">Resource Assigned</th>
                <th className="py-3 px-5">Priority</th>
                <th className="py-3 px-5">Transit & ETA</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Patient */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {item.patient}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Matched Facility */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{item.hospital}</span>
                      </div>
                    </td>

                    {/* Resource Assigned */}
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {item.resource}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.priority === 'Critical'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : item.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* Distance & ETA */}
                    <td className="py-3.5 px-5 font-mono text-slate-600">
                      <div>{item.distance} km</div>
                      <div className="text-[10px] text-blue-600">{item.estimatedArrivalTime}</div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px]">
                      {item.timestamp}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {item.status}
                      </span>
                    </td>

                    {/* Telemetry Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenProcess(item)}
                        className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 font-semibold text-xs transition inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Process</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No allocation records match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
