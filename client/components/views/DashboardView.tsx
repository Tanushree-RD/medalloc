'use client';

import React from 'react';
import {
  AlertTriangle,
  Droplet,
  BedDouble,
  ArrowRight,
  ShieldAlert,
  User,
  Ambulance,
  Stethoscope,
  ExternalLink,
} from 'lucide-react';
import { useMedAlloc } from '@/context/MedAllocContext';
import { EmergencyRequest, AllocationResultData } from '@/lib/types';

interface DashboardViewProps {
  onNavigateToRequests: () => void;
  onNavigateToHospitals: () => void;
  onNavigateToInventory: () => void;
  onNavigateToHistory: () => void;
  onSelectHospitalDetails?: (hospitalId: number) => void;
}

export function DashboardView({
  onNavigateToRequests,
  onNavigateToHospitals,
  onNavigateToInventory,
  onNavigateToHistory,
  onSelectHospitalDetails,
}: DashboardViewProps) {
  const {
    requests,
    hospitals,
    allocationHistory,
    lowStockAlerts,
    openProcessModalWithData,
    globalSearchQuery,
  } = useMedAlloc();

  // 1. Calculate the 4 Meaningful KPI Cards
  const activeRequestsCount = requests.filter(
    (r) => r.status === 'Pending' || r.status === 'Processing' || r.status === 'Allocated'
  ).length;

  const criticalRequestsCount = requests.filter(
    (r) => r.priority === 'Critical' && r.status !== 'Completed' && r.status !== 'Cancelled'
  ).length;

  const totalBloodUnits = hospitals.reduce((acc, h) => {
    const sum = Object.values(h.bloodAvailability || {}).reduce((a, b) => a + b, 0);
    return acc + sum;
  }, 0);

  const totalAvailableIcuBeds = hospitals.reduce((acc, h) => {
    return acc + (h.icuBeds?.available || 0);
  }, 0);

  const cards = [
    {
      id: 'active_requests',
      title: 'Active Requests',
      value: activeRequestsCount,
      description: 'Pending, processing, or actively allocated',
      icon: AlertTriangle,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'critical_requests',
      title: 'Critical Requests',
      value: criticalRequestsCount,
      description: 'Emergency cases requiring highest triage acuity',
      icon: ShieldAlert,
      color: 'text-red-600 bg-red-50',
    },
    {
      id: 'available_blood',
      title: 'Available Blood Units',
      value: totalBloodUnits,
      description: 'Total verified units across 5 regional hubs',
      icon: Droplet,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'available_icu',
      title: 'Available ICU Beds',
      value: totalAvailableIcuBeds,
      description: 'Critical care beds currently open for intake',
      icon: BedDouble,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  // Filter requests if global search query exists
  const filteredRecentRequests = requests.filter((r) => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(q) ||
      r.resource.toLowerCase().includes(q) ||
      (r.assignedHospital && r.assignedHospital.toLowerCase().includes(q)) ||
      r.priority.toLowerCase().includes(q)
    );
  }).slice(0, 5);

  const filteredRecentAllocations = allocationHistory.filter((a) => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      a.patient.toLowerCase().includes(q) ||
      a.hospital.toLowerCase().includes(q) ||
      a.resource.toLowerCase().includes(q)
    );
  }).slice(0, 5);

  const handleOpenProcessFromRequest = (req: EmergencyRequest) => {
    const processData: AllocationResultData = {
      requestId: req.id,
      allocationId: req.allocationId || `ALC-${req.id.replace('REQ-', '')}`,
      patientName: req.patientName,
      resource: req.resource,
      quantity: req.quantity,
      priority: req.priority,
      assignedHospital: req.assignedHospital || req.originHospital,
      distanceKm: req.distanceKm ?? 4,
      estimatedArrivalTime: req.estimatedArrivalTime || '10 mins',
      timestamp: req.timestamp,
      availableUnits: 14,
      previousInventoryStock: 14,
      updatedInventoryStock: 14 - req.quantity,
      reasonSelected: 'Nearest regional facility holding verified reserve.',
      emergencyReason: req.emergencyNotes || 'Emergency clinical triage intake dispatch.',
      status: req.status,
    };
    openProcessModalWithData(processData);
  };

  return (
    <div className="space-y-8">
      {/* 1. Four Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. Low Stock Alerts (Prompt Requirement: Display this on Dashboard) */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Low Stock Alerts ({lowStockAlerts.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Medical supplies that have dropped to or below safe reserve thresholds
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToInventory}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 transition"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockAlerts.slice(0, 6).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      {alert.resourceName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.severity === 'Critical'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {alert.hospitalName}
                  </div>
                  <div className="text-[11px] text-red-600 font-semibold font-mono">
                    Only {alert.remainingStock} {alert.unit} remaining
                  </div>
                </div>

                <button
                  onClick={onNavigateToInventory}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Two-Column Layout: Recent Requests & Recent Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Requests Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Emergency Requests
                </h3>
                <p className="text-[11px] text-slate-500">
                  Live emergency queue across regional hospitals
                </p>
              </div>

              <button
                onClick={onNavigateToRequests}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <span>View All ({requests.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-medium">
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Resource</th>
                    <th className="py-2.5 px-4">Priority</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Patient */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-semibold">
                            <User className="h-3 w-3" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block truncate max-w-[120px]">
                              {req.patientName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {req.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="py-3 px-4 font-medium text-slate-700 truncate max-w-[130px]">
                        {req.resource}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            req.status === 'Allocated' || req.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : req.status === 'Processing'
                              ? 'bg-blue-50 text-blue-700'
                              : req.status === 'Cancelled'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenProcessFromRequest(req)}
                          className="px-2 py-1 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100 font-semibold text-[11px] transition"
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

          <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-right">
            <button
              onClick={onNavigateToRequests}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1"
            >
              <span>+ Create New Emergency Request</span>
            </button>
          </div>
        </div>

        {/* Recent Allocations Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Allocations
                </h3>
                <p className="text-[11px] text-slate-500">
                  Confirmed patient-to-hospital dispatches
                </p>
              </div>

              <button
                onClick={onNavigateToHistory}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <span>Full History</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {filteredRecentAllocations.map((item) => (
                <div
                  key={item.id}
                  className="p-3 hover:bg-slate-50 rounded-xl transition flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {item.patient}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.id}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <strong>{item.resource}</strong> assigned to <strong className="text-blue-700">{item.hospital}</strong>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span>Dist: {item.distance} km</span>
                      <span>ETA: {item.estimatedArrivalTime}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Total Recorded Allocations: {allocationHistory.length}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Hospital Overview (Prompt Requirement: Hospital Overview) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Hospital Overview
            </h3>
            <p className="text-[11px] text-slate-500">
              Current network status and resource readiness across all 5 facilities
            </p>
          </div>

          <button
            onClick={onNavigateToHospitals}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All Facilities</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {hospitals.map((hosp) => {
            const bloodCount = Object.values(hosp.bloodAvailability || {}).reduce((a, b) => a + b, 0);

            return (
              <div
                key={hosp.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      {hosp.name}
                    </h4>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        hosp.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : hosp.status === 'Busy'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {hosp.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {hosp.location} • {hosp.distanceKm} km
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Droplet className="h-3 w-3 text-red-500" />
                      <span>Blood Units:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">{bloodCount}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3 w-3 text-blue-500" />
                      <span>ICU Beds:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">
                      {hosp.icuBeds.available} / {hosp.icuBeds.total}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Ambulance className="h-3 w-3 text-emerald-600" />
                      <span>Ambulances:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">
                      {hosp.ambulances?.available ?? 3} open
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3 text-indigo-600" />
                      <span>Doctors:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">
                      {hosp.doctorsAvailable ?? 12}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSelectHospitalDetails) {
                      onSelectHospitalDetails(hosp.id);
                    } else {
                      onNavigateToHospitals();
                    }
                  }}
                  className="w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition inline-flex items-center justify-center gap-1"
                >
                  <span>View Facility</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
