'use client';

import React, { useState } from 'react';
import {
  Navigation,
  Droplet,
  BedDouble,
  Pill,
  X,
} from 'lucide-react';
import { Hospital } from '@/lib/types';
import { HOSPITALS_DATA } from '@/lib/mockData';

export function HospitalsView() {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Regional Hospitals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Coordinated regional medical centers and real-time facility resource availability.
        </p>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HOSPITALS_DATA.map((hosp) => (
          <div
            key={hosp.id}
            className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
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
                    hosp.status === 'Operational'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {hosp.status}
                </span>
              </div>

              {/* Distance */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>
                  Distance: <strong className="text-slate-800 font-mono">{hosp.distanceKm} km</strong>
                </span>
              </div>
            </div>

            {/* Middle: Resource Availability Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              {/* Blood Availability */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span className="flex items-center gap-1 font-medium">
                    <Droplet className="h-3.5 w-3.5 text-red-500" />
                    <span>Blood Availability</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {Object.values(hosp.bloodAvailability || {}).reduce((a, b) => a + b, 0)} Units
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(hosp.bloodAvailability || {}).slice(0, 4).map(([group, qty]) => (
                    <span
                      key={group}
                      className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 text-[10px] font-mono border border-slate-100"
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

              {/* Medicine Availability */}
              <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Pill className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Medicine Stock</span>
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {hosp.medicines?.length || 0} Critical Lines
                </span>
              </div>
            </div>

            {/* Bottom: View Details Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedHospital(hosp)}
                className="w-full py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700 font-semibold text-xs transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hospital Details Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedHospital.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedHospital.type} • {selectedHospital.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Contact & Status */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                  <span className="font-semibold text-slate-800">{selectedHospital.contact}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Network Status</span>
                  <span className="font-bold text-emerald-700">{selectedHospital.status}</span>
                </div>
              </div>

              {/* Blood Breakdown */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700 block">
                  Complete Blood Inventory
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selectedHospital.bloodAvailability || {}).map(([g, u]) => (
                    <div key={g} className="p-2 rounded-lg bg-slate-50 text-center border border-slate-100">
                      <div className="text-[10px] text-slate-400">{g}</div>
                      <div className="font-mono font-bold text-slate-900">{u} Units</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Pharmaceuticals */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700 block">
                  Stocked Pharmaceuticals
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedHospital.medicines?.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <span className="text-slate-800 font-medium">{m.name}</span>
                      <span className="font-mono font-bold text-slate-600">
                        {m.stock} {m.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHospital(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
