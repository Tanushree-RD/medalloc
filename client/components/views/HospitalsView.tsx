'use client';

import React from 'react';
import {
  Building2,
  Navigation,
  Droplet,
  BedDouble,
  Pill,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { useHospitals } from '@/hooks/useHospitals';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

export function HospitalsView() {
  const { hospitals, isLoading, error, refetch } = useHospitals();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <Building2 className="h-4 w-4" />
            <span>Regional Healthcare Network</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Connected Regional Hospitals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Live telemetry of the 5 regional hubs connected to the C Dijkstra Roadway Graph
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Facilities</span>
        </button>
      </div>

      {/* Error Card */}
      {error && (
        <ErrorCard
          title="Hospital Telemetry Error"
          message={error}
          onRetry={refetch}
        />
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-56" />
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hospitals Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-5 flex flex-col justify-between group"
            >
              {/* Top Row: Hospital Title & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                      #{hosp.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {hosp.name}
                      </h3>
                      <span className="text-xs text-slate-500 block leading-tight">{hosp.type}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                      hosp.status === 'Operational'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hosp.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {hosp.status}
                  </span>
                </div>

                {/* Distance & Location */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 font-medium">
                  <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>
                    Distance from Central Hub:{' '}
                    <strong className="text-slate-800 font-mono">{hosp.distanceKm} km</strong>
                  </span>
                </div>
              </div>

              {/* Required Details Breakdown */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                {/* 1. Blood Availability */}
                <div className="space-y-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Droplet className="h-3.5 w-3.5 text-red-600" />
                    Blood Availability
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {hosp.bloodAvailability && Object.entries(hosp.bloodAvailability).length > 0 ? (
                      Object.entries(hosp.bloodAvailability).map(([group, units]) => (
                        <span
                          key={group}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]"
                        >
                          {group}: <strong className="text-red-700">{units}u</strong>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None in stock</span>
                    )}
                  </div>
                </div>

                {/* 2. ICU Beds */}
                <div className="space-y-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <BedDouble className="h-3.5 w-3.5 text-cyan-600" />
                    ICU Beds
                  </span>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-slate-600">
                      Open Reserve: <strong className="text-emerald-700 font-bold">{hosp.icuBeds.available} beds</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {hosp.icuBeds.occupied} / {hosp.icuBeds.total} occupied
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.round((hosp.icuBeds.occupied / hosp.icuBeds.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 3. Medicines */}
                <div className="space-y-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Pill className="h-3.5 w-3.5 text-purple-600" />
                    Key Medicines & Stock
                  </span>
                  <div className="space-y-1 pt-0.5">
                    {hosp.medicines && hosp.medicines.slice(0, 2).map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="truncate max-w-[180px]">{med.name}</span>
                        <strong className="text-slate-900 font-mono">{med.stock} {med.unit}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {hosp.contact}
                </span>
                <span className="text-blue-600 font-semibold group-hover:underline cursor-pointer">
                  View Telemetry →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
