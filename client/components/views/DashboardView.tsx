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
  ChevronRight,
  Activity,
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

  // 1. Calculate KPI Metrics
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

  const totalIcuBeds = hospitals.reduce((acc, h) => {
    return acc + (h.icuBeds?.total || 0);
  }, 0);

  const cards = [
    {
      id: 'active_requests',
      title: 'Active Requests',
      value: activeRequestsCount,
      badge: 'Live Queue',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
      description: 'Under active dispatch triage',
      icon: Activity,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'critical_requests',
      title: 'Critical Requests',
      value: criticalRequestsCount,
      badge: criticalRequestsCount > 0 ? 'Urgent Priority' : 'Nominal',
      badgeColor: criticalRequestsCount > 0 ? 'bg-red-50 text-red-700 border-red-200/80' : 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      description: 'Immediate clinical intake required',
      icon: ShieldAlert,
      iconBg: 'bg-red-50 text-red-600',
    },
    {
      id: 'available_blood',
      title: 'Available Blood Units',
      value: totalBloodUnits,
      badge: '8 Groups Verified',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
      description: 'Synchronized across all 5 regional centers',
      icon: Droplet,
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'available_icu',
      title: 'Available ICU Beds',
      value: totalAvailableIcuBeds,
      badge: `${totalAvailableIcuBeds} / ${totalIcuBeds} Open`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      description: 'Critical care capacity currently unassigned',
      icon: BedDouble,
      iconBg: 'bg-emerald-50 text-emerald-600',
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
    <div className="space-y-7">
      {/* 1. Four Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${card.iconBg} shadow-2xs`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Low Stock Alert Banner (Refined, Premium, Uncluttered) */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 rounded-2xl border border-amber-200/80 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">
                  Critical Reserve Warnings
                </span>
                <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] font-mono">
                  {lowStockAlerts.length} items low
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {lowStockAlerts[0]?.hospitalName}: {lowStockAlerts[0]?.resourceName} has only {lowStockAlerts[0]?.remainingStock} {lowStockAlerts[0]?.unit} remaining.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToInventory}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
            >
              <span>Restock Supplies</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Data Section: Recent Requests & Recent Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Requests Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100/90 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Emergency Requests
                </h3>
                <p className="text-[11px] text-slate-400">
                  Live emergency intake queue across regional hospitals
                </p>
              </div>

              <button
                onClick={onNavigateToRequests}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <span>View Queue ({requests.length})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
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
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                            <User className="h-3 w-3" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[120px]">
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
                          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 font-semibold text-[11px] transition"
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

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Showing {filteredRecentRequests.length} recent patient dispatches
            </span>
            <button
              onClick={onNavigateToRequests}
              className="font-semibold text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1 text-[11px]"
            >
              <span>+ Create Intake Request</span>
            </button>
          </div>
        </div>

        {/* Recent Allocations Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100/90 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Allocations
                </h3>
                <p className="text-[11px] text-slate-400">
                  Confirmed patient-to-hospital dispatches
                </p>
              </div>

              <button
                onClick={onNavigateToHistory}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <span>Full Ledger</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {filteredRecentAllocations.map((item) => (
                <div
                  key={item.id}
                  className="p-3 hover:bg-slate-50/80 rounded-xl transition flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {item.patient}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {item.id}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 truncate">
                      <strong>{item.resource}</strong> matched to <strong className="text-blue-700">{item.hospital}</strong>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span>{item.distance} km</span>
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

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-mono">
              Total Logged Dispatches: {allocationHistory.length}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Hospital Overview (Clean, Polished, Uncluttered Cards) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100/90 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Regional Hospital Readiness
            </h3>
            <p className="text-[11px] text-slate-400">
              Live capacity status across 5 coordinated medical facilities
            </p>
          </div>

          <button
            onClick={onNavigateToHospitals}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            <span>Facility Grid</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {hospitals.map((hosp) => {
            const bloodCount = Object.values(hosp.bloodAvailability || {}).reduce((a, b) => a + b, 0);
            const occupiedPercent = Math.round((hosp.icuBeds.occupied / hosp.icuBeds.total) * 100);

            return (
              <div
                key={hosp.id}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-xs transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      {hosp.name}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        hosp.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : hosp.status === 'Busy'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          hosp.status === 'Available'
                            ? 'bg-emerald-500'
                            : hosp.status === 'Busy'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span>{hosp.status}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {hosp.location} • {hosp.distanceKm} km
                  </span>
                </div>

                {/* Capacity breakdown */}
                <div className="space-y-2 text-[11px] pt-2 border-t border-slate-100">
                  {/* ICU Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>ICU Occupancy:</span>
                      <strong className="text-slate-800 font-mono">{occupiedPercent}%</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupiedPercent > 85 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${occupiedPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Droplet className="h-3 w-3 text-rose-500" />
                      <span>Blood Units:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">{bloodCount}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Ambulance className="h-3 w-3 text-blue-600" />
                      <span>Ambulances:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">{hosp.ambulances?.available ?? 3} open</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3 text-indigo-600" />
                      <span>Doctors:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">{hosp.doctorsAvailable ?? 12}</strong>
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
                  <span>View Details</span>
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
