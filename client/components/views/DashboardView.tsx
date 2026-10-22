'use client';

import React from 'react';
import {
  AlertTriangle,
  Droplet,
  BedDouble,
  Pill,
  User,
  ArrowRight,
} from 'lucide-react';

export interface DashboardRequestItem {
  id: string;
  patient: string;
  resource: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedHospital: string;
  status: 'Pending' | 'Processing' | 'Allocated' | 'Completed';
  timestamp: string;
}

interface DashboardViewProps {
  onNavigateToRequests: () => void;
  onViewRequestProcess?: (req: DashboardRequestItem) => void;
  requests: DashboardRequestItem[];
}

export function DashboardView({
  onNavigateToRequests,
  onViewRequestProcess,
  requests,
}: DashboardViewProps) {
  // Four Overview Cards:
  // Simple cards, white background, small icon, large number, tiny description, no colorful borders.
  const cards = [
    {
      id: 'active_requests',
      title: 'Active Requests',
      value: '14',
      description: 'Patient emergency dispatches underway',
      icon: AlertTriangle,
    },
    {
      id: 'available_blood',
      title: 'Available Blood Units',
      value: '186',
      description: 'Units available across all regional hubs',
      icon: Droplet,
    },
    {
      id: 'available_icu',
      title: 'Available ICU Beds',
      value: '72',
      description: 'Critical care beds currently unassigned',
      icon: BedDouble,
    },
    {
      id: 'medicine_stock',
      title: 'Medicine Stock',
      value: '2,450',
      description: 'Vials and emergency pharmaceuticals on hand',
      icon: Pill,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Four Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {card.title}
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. Recent Emergency Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Emergency Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live emergency patient queue across regional hospitals
            </p>
          </div>

          <button
            onClick={onNavigateToRequests}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            <span>Create Request</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-medium">
                <th className="py-3 px-6">Patient</th>
                <th className="py-3 px-6">Resource</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Assigned Hospital</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Patient */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-xs">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {req.patient}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {req.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Resource */}
                  <td className="py-3.5 px-6 font-medium text-slate-800">
                    {req.resource}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        req.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : req.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>

                  {/* Assigned Hospital */}
                  <td className="py-3.5 px-6 text-slate-700 font-medium">
                    {req.assignedHospital}
                  </td>

                  {/* Status Chips Only (Pending, Processing, Allocated, Completed) */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        req.status === 'Allocated' || req.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : req.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => onViewRequestProcess && onViewRequestProcess(req)}
                      className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 font-medium transition text-xs"
                    >
                      View Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
