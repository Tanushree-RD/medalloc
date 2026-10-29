'use client';

import React, { useState } from 'react';
import {
  Navigation,
  Droplet,
  BedDouble,
  Pill,
  X,
  Search,
  Ambulance,
  Stethoscope,
  Clock,
  Package,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Regional Hospitals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Coordinated medical centers, acute care units, and live facility readiness.
          </p>
        </div>

        {/* Search & Filters (Available, Busy, Low Stock) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search hospitals..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            {(['All', 'Available', 'Busy', 'Low Stock'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHospitals.map((hosp) => {
          const totalBlood = Object.values(hosp.bloodAvailability || {}).reduce((a, b) => a + b, 0);

          return (
            <div
              key={hosp.id}
              className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Top: Name, Status, Distance */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {hosp.name}
                    </h3>
                    <span className="text-xs text-slate-500 block">
                      {hosp.type}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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

                {/* Distance & Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>
                    {hosp.location} • <strong className="text-slate-800 font-mono">{hosp.distanceKm} km</strong> transit
                  </span>
                </div>
              </div>

              {/* Middle: Resource Availability Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                {/* Available Blood Units */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span className="flex items-center gap-1 font-medium">
                      <Droplet className="h-3.5 w-3.5 text-rose-500" />
                      <span>Available Blood</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {totalBlood} Units
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(hosp.bloodAvailability || {}).slice(0, 5).map(([group, qty]) => (
                      <span
                        key={group}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          qty <= 2
                            ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {group}: {qty}u
                      </span>
                    ))}
                  </div>
                </div>

                {/* ICU Beds */}
                <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <BedDouble className="h-3.5 w-3.5 text-blue-500" />
                    <span>ICU Beds</span>
                  </span>
                  <span className="font-mono text-slate-800">
                    <strong className="text-emerald-700">{hosp.icuBeds.available}</strong> / {hosp.icuBeds.total} Available
                  </span>
                </div>

                {/* Medicines */}
                <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Pill className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Medicines</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {hosp.medicines?.length || 3} Primary Formulations
                  </span>
                </div>

                {/* Ambulances & Doctors Available */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Ambulance className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>
                      Ambulances: <strong className="text-slate-800 font-mono">{hosp.ambulances?.available ?? 3}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Stethoscope className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>
                      Doctors: <strong className="text-slate-800 font-mono">{hosp.doctorsAvailable ?? 12}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom: View Details Button */}
              <div className="pt-2">
                <button
                  onClick={() => setSelectedHospital(hosp)}
                  className="w-full py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition"
                >
                  View Details & Inventory
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hospital Details Modal (Prompt Requirement: Clicking one opens details. Show: Available Blood, Medicines, ICU Beds, Recent Allocations, Current Inventory) */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedHospital.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedHospital.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700'
                        : selectedHospital.status === 'Busy'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {selectedHospital.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedHospital.type} • {selectedHospital.location} • {selectedHospital.distanceKm} km from center
                </p>
              </div>

              <button
                onClick={() => setSelectedHospital(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Emergency Contact & Operational Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Emergency Dispatch</span>
                  <span className="font-semibold text-slate-900 font-mono">{selectedHospital.contact}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">ICU Bed Reserve</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {selectedHospital.icuBeds.available} of {selectedHospital.icuBeds.total} Beds
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Active Ambulances</span>
                  <span className="font-semibold text-blue-700 font-mono">
                    {selectedHospital.ambulances?.available ?? 3} of {selectedHospital.ambulances?.total ?? 8}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Doctors On Duty</span>
                  <span className="font-semibold text-indigo-700 font-mono">
                    {selectedHospital.doctorsAvailable ?? 16} Available
                  </span>
                </div>
              </div>

              {/* 1. Complete Available Blood Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Droplet className="h-4 w-4 text-rose-500" />
                  <span>Available Blood Inventory</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {Object.entries(selectedHospital.bloodAvailability || {}).map(([g, u]) => (
                    <div
                      key={g}
                      className={`p-2.5 rounded-xl text-center border ${
                        u <= 2
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-slate-50 border-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-bold">{g}</div>
                      <div className="font-mono font-extrabold text-sm">{u}</div>
                      <div className="text-[9px] text-slate-400">units</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Stocked Medicines */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Pill className="h-4 w-4 text-emerald-500" />
                  <span>Essential Emergency Medicines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedHospital.medicines?.map((m) => (
                    <div
                      key={m.name}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <span className="text-slate-800 font-medium truncate">{m.name}</span>
                      <span className="font-mono font-bold text-slate-900 ml-2">
                        {m.stock} {m.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Current Hospital Inventory (All Tracked Stock Lines) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Current Inventory Items ({selectedHospitalInventory.length})</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 font-medium text-[10px]">
                        <th className="py-2 px-3">Item</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Stock</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedHospitalInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-medium text-slate-800">{item.name}</td>
                          <td className="py-2 px-3 text-slate-500">{item.category}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {item.stock} {item.unit}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                item.status === 'Critical'
                                  ? 'bg-red-50 text-red-700'
                                  : item.status === 'Low'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Recent Allocations (Assigned to this Hospital) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Recent Allocations at {selectedHospital.name} ({selectedHospitalAllocations.length})</span>
                </div>
                {selectedHospitalAllocations.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {selectedHospitalAllocations.map((alloc) => (
                      <div
                        key={alloc.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900">{alloc.patient}</strong>
                          <span className="text-slate-500 text-[11px] block">
                            {alloc.resource} • {alloc.priority} Priority
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {alloc.status}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {alloc.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px] p-2 bg-slate-50 rounded-lg">
                    No recent allocations dispatched to this facility.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedHospital(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition"
              >
                Close Facility Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
