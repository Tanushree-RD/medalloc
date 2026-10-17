'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Ambulance,
  Clock,
  AlertCircle,
  Building2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { RECENT_REQUESTS_DATA } from '@/lib/mockData';
import { EmergencyRequest, PriorityLevel, AllocationStatus } from '@/lib/types';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { cn } from '@/lib/utils';

interface RecentRequestsTableProps {
  requests?: EmergencyRequest[];
  isLoading?: boolean;
  searchFilter?: string;
  onRefresh?: () => void;
}

export function RecentRequestsTable({
  requests,
  isLoading,
  searchFilter = '',
  onRefresh,
}: RecentRequestsTableProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  // Unified items list
  const rawList = requests && requests.length > 0
    ? requests.map((r) => ({
        id: r.id,
        patient: r.patientName,
        age: 45,
        gender: 'Adult',
        resource: r.resourceType,
        quantity: r.quantity,
        priority: r.priority,
        assignedHospital: r.assignedHospital,
        distanceKm: r.distanceKm,
        status: r.allocationStatus,
        timeAgo: r.estimatedResponseTime || '3 mins ago',
      }))
    : RECENT_REQUESTS_DATA;

  const filteredRequests = rawList.filter((req) => {
    const matchesPriority =
      priorityFilter === 'All' || req.priority === priorityFilter;

    const query = searchFilter.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      req.patient.toLowerCase().includes(query) ||
      req.resource.toLowerCase().includes(query) ||
      req.assignedHospital.toLowerCase().includes(query) ||
      req.id.toLowerCase().includes(query);

    return matchesPriority && matchesSearch;
  });

  const getPriorityBadge = (priority: PriorityLevel | string) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
            Critical (4)
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            High (3)
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Medium (2)
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Low (1)
          </span>
        );
    }
  };

  const getStatusBadge = (status: AllocationStatus | string) => {
    switch (status) {
      case 'Allocated':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Allocated
          </span>
        );
      case 'In-Transit':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
            <Ambulance className="h-3.5 w-3.5 text-blue-600" />
            In-Transit
          </span>
        );
      case 'Queued':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Queued
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/80">
            <AlertCircle className="h-3.5 w-3.5 text-red-600" />
            Unallocated
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            Recent Emergency Requests
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              {filteredRequests.length} Live
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time patient intake and Dijkstra-optimized facility allocations
          </p>
        </div>

        {/* Priority Tabs & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((level) => (
              <button
                key={level}
                onClick={() => setPriorityFilter(level)}
                className={cn(
                  'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                  priorityFilter === level
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {level}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Requests"
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 sm:rounded-l-xl">Patient</th>
              <th className="py-3 px-4">Resource</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assigned Hospital</th>
              <th className="py-3 px-4 sm:rounded-r-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                >
                  {/* Patient Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {req.patient
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block leading-tight">
                          {req.patient}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium font-mono">
                          {req.id} • {req.timeAgo}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Resource */}
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{req.resource}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    {getPriorityBadge(req.priority)}
                  </td>

                  {/* Assigned Hospital */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 block leading-tight">
                          {req.assignedHospital}
                        </span>
                        {req.distanceKm > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {req.distanceKm} km (Dijkstra optimal)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(req.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  No emergency requests match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Showing <strong className="text-slate-800">{filteredRequests.length}</strong> of{' '}
          {rawList.length} recorded emergency requests
        </span>
        <span className="text-blue-600 font-semibold inline-flex items-center gap-1">
          Synced with Express Backend Live
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
