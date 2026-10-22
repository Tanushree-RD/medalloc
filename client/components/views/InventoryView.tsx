'use client';

import React, { useState } from 'react';
import { Search, Building2 } from 'lucide-react';
import { HOSPITALS_DATA } from '@/lib/mockData';

export function InventoryView() {
  const [searchQuery, setSearchQuery] = useState('');

  // Transform hospital data into inventory rows
  const inventoryRows = HOSPITALS_DATA.map((hosp) => {
    const totalBlood = Object.values(hosp.bloodAvailability || {}).reduce((a, b) => a + b, 0);
    const topMedicines = hosp.medicines?.map((m) => `${m.name} (${m.stock})`).join(', ') || 'Standard Emergency Pack';

    return {
      id: hosp.id,
      hospital: hosp.name,
      location: hosp.location,
      bloodUnits: totalBlood,
      icuBeds: `${hosp.icuBeds.available} Available / ${hosp.icuBeds.total} Total`,
      medicines: topMedicines,
      lastUpdated: '10 mins ago',
    };
  });

  const filteredRows = inventoryRows.filter((row) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      row.hospital.toLowerCase().includes(query) ||
      row.location.toLowerCase().includes(query) ||
      row.medicines.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stockpile levels for emergency medical supplies across the network.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter hospitals or medicines..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
          />
        </div>
      </div>

      {/* Simple Searchable Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-medium">
                <th className="py-3 px-6">Hospital</th>
                <th className="py-3 px-6">Blood Units</th>
                <th className="py-3 px-6">ICU Beds</th>
                <th className="py-3 px-6">Medicines</th>
                <th className="py-3 px-6 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Hospital */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {row.hospital}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {row.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Blood Units */}
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {row.bloodUnits} Units
                    </td>

                    {/* ICU Beds */}
                    <td className="py-4 px-6 font-mono text-slate-700">
                      {row.icuBeds}
                    </td>

                    {/* Medicines */}
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate" title={row.medicines}>
                      {row.medicines}
                    </td>

                    {/* Last Updated */}
                    <td className="py-4 px-6 text-right text-slate-400 font-mono">
                      {row.lastUpdated}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No matching hospital inventory found for &quot;{searchQuery}&quot;.
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
