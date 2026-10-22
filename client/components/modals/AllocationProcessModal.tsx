'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
} from 'lucide-react';

export interface AllocationProcessData {
  patientName: string;
  resource: string;
  quantity: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedHospital: string;
  distanceKm: number;
  estimatedArrivalTime: string;
  timestamp: string;
  allocationId: string;
  availableUnits: number;
  reasonSelected: string;
  emergencyReason: string;
}

interface AllocationProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AllocationProcessData;
}

export function AllocationProcessModal({
  isOpen,
  onClose,
  data,
}: AllocationProcessModalProps) {
  const [selectedStep, setSelectedStep] = useState<number>(3); // Default expanded step: Nearest Resource or Best Hospital
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  if (!isOpen) return null;

  const steps = [
    {
      id: 1,
      title: 'Request Received',
      subtitle: 'Emergency intake registered with clinical parameters',
      technical: null,
    },
    {
      id: 2,
      title: 'Prioritized',
      subtitle: 'Triage assessment classified by medical urgency',
      technical: {
        uses: 'Priority Queue (Max Heap)',
        purpose: 'Ensures critical requests are processed before lower-priority requests.',
      },
    },
    {
      id: 3,
      title: 'Nearest Resource Located',
      subtitle: 'Spatial routing across regional road network',
      technical: {
        uses: 'Hash Map, Graph, Dijkstra Algorithm',
        purpose: 'Find the nearest hospital with the requested resource while minimizing travel distance.',
      },
    },
    {
      id: 4,
      title: 'Best Hospital Matched',
      subtitle: 'Optimized matching ensuring capacity conservation',
      technical: {
        uses: 'Bipartite Matching',
        purpose: 'Assigns patients to the most suitable hospital while maximizing successful allocations.',
      },
    },
    {
      id: 5,
      title: 'Allocation Completed',
      subtitle: 'Reservation confirmed & dispatch telemetry locked',
      technical: null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
              Allocation Telemetry Log
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Allocation Process
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequence of operational stages executed for patient <strong className="text-slate-800">{data.patientName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Show Technical Details Toggle (Educational Mode) */}
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                showTechnicalDetails
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showTechnicalDetails ? 'Hide Technical Details' : 'Show Technical Details'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Vertical Timeline */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isSelected = selectedStep === step.id;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative pl-8">
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200" />
                  )}

                  {/* Step status checkmark circle */}
                  <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-4 ring-white">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>

                  {/* Step Header Button */}
                  <div
                    onClick={() => setSelectedStep(isSelected ? 0 : step.id)}
                    className="cursor-pointer group select-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {step.subtitle}
                        </p>
                      </div>

                      <div className="text-slate-400 p-1">
                        {isSelected ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step Details Panel (Expanded) */}
                  {isSelected && (
                    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs space-y-3 animate-in fade-in duration-150">
                      {/* Step 1: Request Received Details */}
                      {step.id === 1 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Patient</span>
                            <strong className="text-slate-800">{data.patientName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Resource</span>
                            <strong className="text-slate-800">{data.resource}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Quantity</span>
                            <strong className="text-slate-800">{data.quantity} Units</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Timestamp</span>
                            <strong className="text-slate-800 font-mono">{data.timestamp}</strong>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Prioritized Details */}
                      {step.id === 2 && (
                        <div className="space-y-2">
                          <p className="text-slate-600">
                            The request was classified according to medical urgency.
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Priority</span>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded font-bold text-red-700 bg-red-100 border border-red-200">
                                {data.priority}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Reason</span>
                              <strong className="text-slate-800">{data.emergencyReason || 'Emergency blood requirement.'}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Nearest Resource Located Details */}
                      {step.id === 3 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Hospital</span>
                              <strong className="text-slate-800">{data.assignedHospital}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Distance</span>
                              <strong className="text-slate-800 font-mono">{data.distanceKm} km</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Available Units</span>
                              <strong className="text-slate-800 font-mono">{data.availableUnits} Units</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Est. Travel Time</span>
                              <strong className="text-blue-600 font-mono">{data.estimatedArrivalTime}</strong>
                            </div>
                          </div>

                          {/* Mini Map with Highlighted Hospital */}
                          <div className="pt-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                              Network Map & Route
                            </span>
                            <div className="rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-center">
                              <svg viewBox="0 0 460 140" className="w-full max-h-36">
                                {/* Connecting Roads */}
                                <line x1="80" y1="70" x2="230" y2="40" stroke="#2563eb" strokeWidth="2.5" />
                                <line x1="80" y1="70" x2="200" y2="110" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="230" y1="40" x2="380" y2="70" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="200" y1="110" x2="380" y2="70" stroke="#e2e8f0" strokeWidth="1.5" />

                                {/* Distance badge on active road */}
                                <rect x="135" y="45" width="40" height="18" rx="4" fill="#eff6ff" stroke="#bfdbfe" />
                                <text x="155" y="58" textAnchor="middle" fill="#1d4ed8" className="text-[9px] font-mono font-bold">
                                  {data.distanceKm} km
                                </text>

                                {/* Origin Node */}
                                <circle cx="80" cy="70" r="14" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                                <text x="80" y="74" textAnchor="middle" fill="#475569" className="text-[10px] font-bold">Orig</text>
                                <text x="80" y="98" textAnchor="middle" fill="#64748b" className="text-[9px]">City Hospital</text>

                                {/* Destination Matched Node (Highlighted) */}
                                <circle cx="230" cy="40" r="18" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
                                <text x="230" y="44" textAnchor="middle" fill="#1e40af" className="text-[10px] font-extrabold">Hub</text>
                                <text x="230" y="20" textAnchor="middle" fill="#1d4ed8" className="text-[10px] font-bold">
                                  {data.assignedHospital} (Matched)
                                </text>

                                {/* Other Nodes */}
                                <circle cx="200" cy="110" r="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                                <text x="200" y="130" textAnchor="middle" fill="#94a3b8" className="text-[9px]">Metro Hospital</text>

                                <circle cx="380" cy="70" r="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                                <text x="380" y="94" textAnchor="middle" fill="#94a3b8" className="text-[9px]">Apollo Care</text>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Best Hospital Matched Details */}
                      {step.id === 4 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Matched Hospital</span>
                            <strong className="text-slate-800">{data.assignedHospital}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Resource Reserved</span>
                            <strong className="text-emerald-700">{data.quantity} {data.resource}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Capacity Remaining</span>
                            <strong className="text-slate-800 font-mono">{Math.max(1, data.availableUnits - data.quantity)} Units</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Selection Rationale</span>
                            <strong className="text-slate-700">{data.reasonSelected || 'Lowest transit delay with guaranteed reserve.'}</strong>
                          </div>
                        </div>
                      )}

                      {/* Step 5: Allocation Completed Details */}
                      {step.id === 5 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Allocation ID</span>
                            <strong className="text-slate-800 font-mono">{data.allocationId}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Status</span>
                            <span className="inline-block px-2 py-0.5 rounded font-bold text-emerald-700 bg-emerald-100">
                              Confirmed
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Assigned Team</span>
                            <strong className="text-slate-800">Rapid Medical Transit #4</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Exp. Completion Time</span>
                            <strong className="text-blue-600 font-mono">{data.estimatedArrivalTime}</strong>
                          </div>
                        </div>
                      )}

                      {/* EDUCATIONAL TECHNICAL DETAILS (Collapsed by default, shown ONLY when toggled) */}
                      {showTechnicalDetails && step.technical && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 bg-blue-50/50 p-3 rounded-lg border border-blue-200/60">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px] font-mono">
                            <Code2 className="h-3.5 w-3.5 text-blue-600" />
                            <span>Technical Details (Educational Mode)</span>
                          </div>
                          <div className="text-[11px]">
                            <span className="text-slate-500 font-medium">Uses: </span>
                            <span className="font-bold text-blue-800">{step.technical.uses}</span>
                          </div>
                          <div className="text-[11px]">
                            <span className="text-slate-500 font-medium">Purpose: </span>
                            <span className="text-slate-700">{step.technical.purpose}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            Close Telemetry Log
          </button>
        </div>
      </div>
    </div>
  );
}
