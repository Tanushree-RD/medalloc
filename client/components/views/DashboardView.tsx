'use client';

import React from 'react';
import {
  Plus,
  ChevronRight,
  ArrowUpRight,
  Droplet,
  BedDouble,
  Activity,
  AlertCircle,
  Building2,
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
    updateInventoryItemStock,
    globalSearchQuery,
  } = useMedAlloc();

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
  }).slice(0, 4);

  const filteredRecentAllocations = allocationHistory.filter((a) => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      a.patient.toLowerCase().includes(q) ||
      a.hospital.toLowerCase().includes(q) ||
      a.resource.toLowerCase().includes(q)
    );
  }).slice(0, 4);

  const handleOpenProcessFromRequest = (req: EmergencyRequest) => {
    const processData: AllocationResultData = {
      requestId: req.id,
      allocationId: req.allocationId || `ALC-${req.id.replace('REQ-', '')}`,
      patientName: req.patientName,
      resource: req.resource,
      quantity: req.quantity,
      priority: req.priority,
      assignedHospital: req.assignedHospital || req.originHospital,
      distanceKm: req.distanceKm ?? 4.2,
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

  const handleOpenProcessFromHistory = (item: (typeof allocationHistory)[0]) => {
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
      reasonSelected: item.reasonSelected || 'Lowest transit route with guaranteed reserve.',
      emergencyReason: 'Clinical triage dispatch authorization.',
      status: item.status === 'Completed' ? 'Completed' : 'Allocated',
    };
    openProcessModalWithData(processData);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. EDITORIAL HERO (Linear / Notion / Stripe look) */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-breathing-dot" />
            <span>Emergency network operating normally</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-neutral-950">
              {getGreeting()}, Dispatch Officer
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 font-normal mt-1 leading-relaxed max-w-xl">
              Coordinating triage prioritization, shortest-path transit, and real-time hospital stockpiles across 5 hubs.
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onNavigateToRequests}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm shadow-editorial transition-all duration-150 active:scale-[0.98] self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2]" />
          <span>New Emergency Request</span>
        </button>
      </section>

      {/* 2. STATISTIC METRIC CARDS (Quiet, Spacious, Large Numbers) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Blood Units */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.04] shadow-editorial hover:shadow-editorial-hover transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Available Blood Units
            </span>
            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Droplet className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950">
              {totalBloodUnits}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-medium text-emerald-600">
                +18 units
              </span>
              <span className="text-xs text-neutral-400">
                across regional hubs
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: ICU Beds */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.04] shadow-editorial hover:shadow-editorial-hover transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Available ICU Beds
            </span>
            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
              <BedDouble className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950">
              {totalAvailableIcuBeds}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-medium text-neutral-700">
                {totalAvailableIcuBeds} of {totalIcuBeds} open
              </span>
              <span className="text-xs text-neutral-400">
                ({Math.round((totalAvailableIcuBeds / (totalIcuBeds || 1)) * 100)}% capacity)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Requests */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.04] shadow-editorial hover:shadow-editorial-hover transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Active Queue
            </span>
            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Activity className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950">
              {activeRequestsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-medium text-neutral-700">
                Live intake
              </span>
              <span className="text-xs text-neutral-400">
                in active routing
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Critical Acuity */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.04] shadow-editorial hover:shadow-editorial-hover transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Critical Acuity
            </span>
            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
              <AlertCircle className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950">
              {criticalRequestsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-medium text-rose-600">
                Immediate response
              </span>
              <span className="text-xs text-neutral-400">
                priority tier 1
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TWO-COLUMN LAYOUT: Recent Requests (Left) & Recent Allocations (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* LEFT: Recent Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-neutral-950">
                Emergency Requests
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Active triage queue pending resource confirmation
              </p>
            </div>
            <button
              onClick={onNavigateToRequests}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-950 flex items-center gap-1 transition"
            >
              <span>View all</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {filteredRecentRequests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-black/[0.04] text-center text-xs text-neutral-400">
                No active requests in queue
              </div>
            ) : (
              filteredRecentRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.04] shadow-editorial-sm hover:shadow-editorial hover:border-black/[0.08] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* Priority Dot */}
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          req.priority === 'Critical'
                            ? 'bg-rose-500'
                            : req.priority === 'High'
                            ? 'bg-amber-500'
                            : 'bg-neutral-400'
                        }`}
                      />
                      <span className="text-sm font-medium text-neutral-900 truncate">
                        {req.patientName}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {req.patientAge}y · {req.patientLocation}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="font-medium text-neutral-700">
                        {req.resource} ({req.quantity})
                      </span>
                      <span>•</span>
                      <span className="text-neutral-400">
                        {req.assignedHospital || req.originHospital}
                      </span>
                      <span>•</span>
                      <span className="text-neutral-400">
                        {req.timestamp}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenProcessFromRequest(req)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 group-hover:text-neutral-950 px-3 py-1.5 rounded-full bg-neutral-50 group-hover:bg-neutral-100 transition self-start sm:self-auto cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="h-3 w-3 stroke-[2]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Live Allocation Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-neutral-950">
                Live Dispatch Stream
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Completed hospital route matches & telemetry
              </p>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-950 flex items-center gap-1 transition"
            >
              <span>View ledger</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {filteredRecentAllocations.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-black/[0.04] text-center text-xs text-neutral-400">
                No allocations logged yet
              </div>
            ) : (
              filteredRecentAllocations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.04] shadow-editorial-sm hover:shadow-editorial hover:border-black/[0.08] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 truncate">
                        {item.patient}
                      </span>
                      <span className="text-xs text-neutral-400">
                        → {item.hospital}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="font-medium text-neutral-700">
                        {item.resource}
                      </span>
                      <span>•</span>
                      <span className="text-neutral-400">
                        {item.distance} km ({item.estimatedArrivalTime})
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">
                        Allocated
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenProcessFromHistory(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 group-hover:text-neutral-950 px-3 py-1.5 rounded-full bg-neutral-50 group-hover:bg-neutral-100 transition self-start sm:self-auto cursor-pointer"
                  >
                    <span>Details</span>
                    <ArrowUpRight className="h-3 w-3 stroke-[2]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. LOW STOCK ALERTS (Clean, Calm, Urgent Without Clutter) */}
      {lowStockAlerts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-neutral-950">
                Stockpile Alerts
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Resources depleted below safe clinical reserve thresholds
              </p>
            </div>
            <button
              onClick={onNavigateToInventory}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-950 flex items-center gap-1 transition"
            >
              <span>Manage inventory</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-editorial-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Droplet className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-900 truncate">
                      {alert.resourceName} Running Low
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {alert.hospitalName} · Only <span className="font-medium text-rose-600">{alert.remainingStock} {alert.unit}</span> remaining.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const inventoryId = alert.id.replace('ALERT-', '');
                    updateInventoryItemStock(inventoryId, alert.remainingStock + 10);
                  }}
                  className="px-4 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer shrink-0"
                >
                  Restock (+10)
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. HOSPITAL NETWORK AVAILABILITY CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-950">
              Coordinated Hospital Network
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live capacity and medical reserves across all participating facilities
            </p>
          </div>
          <button
            onClick={onNavigateToHospitals}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-950 flex items-center gap-1 transition"
          >
            <span>View all 5 hubs</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hospitals.map((hosp) => {
            const totalBlood = Object.values(hosp.bloodAvailability || {}).reduce((a, b) => a + b, 0);
            const icuPercent = Math.round(
              ((hosp.icuBeds.total - hosp.icuBeds.available) / (hosp.icuBeds.total || 1)) * 100
            );

            return (
              <div
                key={hosp.id}
                onClick={() => onSelectHospitalDetails && onSelectHospitalDetails(hosp.id)}
                className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-editorial hover:shadow-editorial-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-950 group-hover:text-blue-600 transition-colors">
                      {hosp.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {hosp.location} · {hosp.distanceKm} km away
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      hosp.status === 'Available'
                        ? 'bg-neutral-100 text-neutral-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hosp.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {hosp.status}
                  </span>
                </div>

                {/* ICU Capacity meter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-normal">ICU Beds</span>
                    <span className="font-medium text-neutral-800">
                      {hosp.icuBeds.available} available ({hosp.icuBeds.total} total)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        icuPercent > 80 ? 'bg-rose-500' : 'bg-neutral-900'
                      }`}
                      style={{ width: `${icuPercent}%` }}
                    />
                  </div>
                </div>

                {/* Quick stats footer */}
                <div className="pt-2 border-t border-black/[0.03] flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Droplet className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{totalBlood} blood units</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{hosp.doctorsAvailable} doctors on duty</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
