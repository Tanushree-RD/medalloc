'use client';

import React, { useState } from 'react';
import {
  Navigation,
  X,
  Search,
} from 'lucide-react';
import { useMedAlloc } from '@/context/MedAllocContext';
import { Hospital, HospitalStatus } from '@/lib/types';

interface HospitalsViewProps {
  initialSelectedHospitalId?: number | null;
}

export function HospitalsView({ initialSelectedHospitalId }: HospitalsViewProps) {
  const {
    hospitals,
    inventory,
    allocationHistory,
    globalSearchQuery,
  } = useMedAlloc();

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(() => {
    if (initialSelectedHospitalId) {
      return hospitals.find((h) => h.id === initialSelectedHospitalId) || null;
    }
    return null;
  });

  const [modalActiveTab, setModalActiveTab] = useState<'inventory' | 'allocations'>('inventory');
  const [statusFilter, setStatusFilter] = useState<'All' | HospitalStatus>('All');
  const [localSearch, setLocalSearch] = useState('');

  const effectiveSearch = localSearch || globalSearchQuery;

  // Filter hospitals by search & status
  const filteredHospitals = hospitals.filter((hosp) => {
    const matchesSearch =
      !effectiveSearch ||
      hosp.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      hosp.location.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      hosp.type.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesStatus = statusFilter === 'All' || hosp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Data for the selected hospital modal
  const selectedHospitalInventory = selectedHospital
    ? inventory.filter((item) => item.hospitalId === selectedHospital.id)
    : [];

  const selectedHospitalAllocations = selectedHospital
    ? allocationHistory.filter((item) => item.hospital === selectedHospital.name)
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
            Coordinated Medical Hubs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
            5 certified emergency care centers and trauma facilities maintaining live capacity telemetry.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search hubs..."
              className="w-full h-9 pl-9 pr-3 rounded-full bg-white border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-black/[0.04]">
            {(['All', 'Available', 'Busy', 'Low Stock'] as Array<'All' | HospitalStatus>).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-neutral-950 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hospitals Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => {
          const totalBlood = Object.values(hospital.bloodAvailability || {}).reduce((a, b) => a + b, 0);
          const totalMedicines = Object.values(hospital.medicines || {}).reduce((a, b) => a + (typeof b === 'number' ? b : b.stock || 0), 0);
          const icuPercent = Math.round(
            ((hospital.icuBeds.total - hospital.icuBeds.available) / (hospital.icuBeds.total || 1)) * 100
          );

          return (
            <div
              key={hospital.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.04] shadow-editorial hover:shadow-editorial-hover transition-all duration-200 flex flex-col justify-between space-y-6 group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-neutral-400">
                      {hospital.type}
                    </span>
                    <h2 className="text-base font-semibold tracking-tight text-neutral-950">
                      {hospital.name}
                    </h2>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hospital.status === 'Available'
                        ? 'bg-neutral-100 text-neutral-700'
                        : hospital.status === 'Busy'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hospital.status === 'Available'
                          ? 'bg-emerald-500'
                          : hospital.status === 'Busy'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    {hospital.status}
                  </span>
                </div>

                {/* Location & Transit Distance */}
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Navigation className="h-3.5 w-3.5 text-neutral-400 stroke-[1.75]" />
                  <span>{hospital.location}</span>
                  <span>•</span>
                  <span className="font-mono text-neutral-600">{hospital.distanceKm} km transit</span>
                </div>
              </div>

              {/* ICU Bed Capacity Gauge */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50/70 border border-black/[0.03]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-medium">ICU Beds Capacity</span>
                  <span className="font-mono text-neutral-900 font-semibold">
                    {hospital.icuBeds.available} / {hospital.icuBeds.total} open
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-200/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      icuPercent > 80 ? 'bg-rose-500' : 'bg-neutral-900'
                    }`}
                    style={{ width: `${icuPercent}%` }}
                  />
                </div>
              </div>

              {/* Stockpile Overview */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/[0.04] text-center">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-neutral-400 block">Blood</span>
                  <span className="text-sm font-semibold tracking-tight text-neutral-900 font-mono">
                    {totalBlood}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-neutral-400 block">Medicines</span>
                  <span className="text-sm font-semibold tracking-tight text-neutral-900 font-mono">
                    {totalMedicines}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-neutral-400 block">Ambulances</span>
                  <span className="text-sm font-semibold tracking-tight text-neutral-900 font-mono">
                    {hospital.ambulances?.available ?? (typeof hospital.ambulances === 'number' ? hospital.ambulances : 4)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedHospital(hospital)}
                className="w-full py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-950 hover:text-white text-xs font-medium text-neutral-800 transition-all duration-150 cursor-pointer"
              >
                Inspect Facility Dossier
              </button>
            </div>
          );
        })}
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-black/[0.06] shadow-editorial-float overflow-hidden space-y-6 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-neutral-400">
                  {selectedHospital.type} · {selectedHospital.location}
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-neutral-950 mt-0.5">
                  {selectedHospital.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-neutral-50/80 border border-black/[0.03] text-center">
              <div>
                <span className="text-[11px] text-neutral-400 block">Transit</span>
                <span className="text-xs font-mono font-medium text-neutral-900">
                  {selectedHospital.distanceKm} km
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block">ICU Beds</span>
                <span className="text-xs font-mono font-medium text-neutral-900">
                  {selectedHospital.icuBeds.available}/{selectedHospital.icuBeds.total}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block">Doctors</span>
                <span className="text-xs font-mono font-medium text-neutral-900">
                  {selectedHospital.doctorsAvailable}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block">Ambulances</span>
                <span className="text-xs font-mono font-medium text-neutral-900">
                  {selectedHospital.ambulances?.available ?? (typeof selectedHospital.ambulances === 'number' ? selectedHospital.ambulances : 4)}
                </span>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-2">
              <button
                onClick={() => setModalActiveTab('inventory')}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition cursor-pointer ${
                  modalActiveTab === 'inventory'
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Inventory ({selectedHospitalInventory.length})
              </button>
              <button
                onClick={() => setModalActiveTab('allocations')}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition cursor-pointer ${
                  modalActiveTab === 'allocations'
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Recent Allocations ({selectedHospitalAllocations.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {modalActiveTab === 'inventory' ? (
                selectedHospitalInventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-neutral-50/60 border border-black/[0.03] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-neutral-900">{item.name}</span>
                      <span className="text-neutral-400 ml-2">({item.category})</span>
                    </div>
                    <span className="font-mono font-semibold text-neutral-800">
                      {item.stock} {item.unit}
                    </span>
                  </div>
                ))
              ) : (
                selectedHospitalAllocations.map((alloc) => (
                  <div
                    key={alloc.id}
                    className="p-3 rounded-xl bg-neutral-50/60 border border-black/[0.03] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-neutral-900">{alloc.patient}</span>
                      <span className="text-neutral-400 ml-2">· {alloc.resource}</span>
                    </div>
                    <span className="text-neutral-500 font-mono">{alloc.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
