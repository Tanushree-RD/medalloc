'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Navigation,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { AllocationResultData, PriorityLevel } from '@/lib/types';

export interface AllocationProcessData {
  patientName: string;
  resource: string;
  quantity: number;
  priority: PriorityLevel;
  assignedHospital: string;
  distanceKm: number;
  estimatedArrivalTime: string;
  timestamp: string;
  allocationId: string;
  availableUnits?: number;
  previousInventoryStock?: number;
  updatedInventoryStock?: number;
  reasonSelected?: string;
  emergencyReason?: string;
}

interface AllocationProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AllocationResultData | AllocationProcessData | null;
}

export function AllocationProcessModal({
  isOpen,
  onClose,
  data,
}: AllocationProcessModalProps) {
  const [expandedStep, setExpandedStep] = useState<number>(3); // Step 3 expanded by default
  const [technicalDetailsOpen, setTechnicalDetailsOpen] = useState<boolean>(false);

  if (!isOpen || !data) return null;

  const steps = [
    {
      id: 1,
      title: 'Request Received',
      subtitle: 'Emergency intake registered with clinical parameters',
    },
    {
      id: 2,
      title: 'Prioritized',
      subtitle: 'Triage assessment classified by medical urgency',
    },
    {
      id: 3,
      title: 'Nearest Resource Located',
      subtitle: 'Spatial routing across regional road network',
    },
    {
      id: 4,
      title: 'Best Hospital Matched',
      subtitle: 'Optimized matching ensuring capacity conservation',
    },
    {
      id: 5,
      title: 'Allocation Completed',
      subtitle: 'Reservation confirmed & dispatch telemetry locked',
    },
  ];

  const toggleStep = (id: number) => {
    setExpandedStep((prev) => (prev === id ? 0 : id));
  };

  const availableUnits = data.availableUnits ?? 12;
  const quantity = data.quantity ?? 1;
  const remainingUnits = Math.max(0, availableUnits - quantity);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Allocation Telemetry Log</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Allocation Process
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified operational pipeline for patient <strong className="text-slate-800">{data.patientName}</strong> ({data.allocationId})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Vertical Timeline */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isSelected = expandedStep === step.id;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative pl-8">
                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200" />
                  )}

                  {/* Step status checkmark circle */}
                  <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-4 ring-white">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>

                  {/* Step Header Button */}
                  <div
                    onClick={() => toggleStep(step.id)}
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
                    <div className="mt-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 text-xs space-y-3 animate-in fade-in duration-150">
                      {/* Step 1: Request Received Details */}
                      {step.id === 1 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Patient</span>
                            <strong className="text-slate-800">{data.patientName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Resource</span>
                            <strong className="text-slate-800">{data.resource}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Quantity</span>
                            <strong className="text-slate-800">{data.quantity} Units</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Timestamp</span>
                            <strong className="text-slate-800 font-mono">{data.timestamp}</strong>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Prioritized Details */}
                      {step.id === 2 && (
                        <div className="space-y-2">
                          <p className="text-slate-600 leading-relaxed">
                            The emergency dispatch intake was triaged based on patient acuity and clinical condition.
                          </p>
                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Priority Tier</span>
                              <span
                                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                                  data.priority === 'Critical'
                                    ? 'text-red-700 bg-red-100 border border-red-200'
                                    : data.priority === 'High'
                                    ? 'text-amber-700 bg-amber-100 border border-amber-200'
                                    : 'text-blue-700 bg-blue-100 border border-blue-200'
                                }`}
                              >
                                {data.priority}
                              </span>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                              <span className="text-slate-400 block text-[10px]">Clinical Reason</span>
                              <strong className="text-slate-800 font-medium block truncate">
                                {data.emergencyReason || 'Critical emergency clinical triage dispatch.'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Nearest Resource Located Details */}
                      {step.id === 3 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Candidate Hub</span>
                              <strong className="text-blue-700">{data.assignedHospital}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Transit Distance</span>
                              <strong className="text-slate-800 font-mono">{data.distanceKm} km</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Stock Available</span>
                              <strong className="text-slate-800 font-mono">{availableUnits} Units</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Est. Travel Time</span>
                              <strong className="text-blue-600 font-mono">{data.estimatedArrivalTime}</strong>
                            </div>
                          </div>

                          {/* Mini Map Route */}
                          <div className="pt-2">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                              <Navigation className="h-3 w-3 text-blue-600" />
                              <span>Network Dispatch Route</span>
                            </span>
                            <div className="rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-center">
                              <svg viewBox="0 0 460 130" className="w-full max-h-32">
                                <line x1="80" y1="65" x2="230" y2="35" stroke="#2563eb" strokeWidth="2.5" />
                                <line x1="80" y1="65" x2="200" y2="105" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="230" y1="35" x2="380" y2="65" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="200" y1="105" x2="380" y2="65" stroke="#e2e8f0" strokeWidth="1.5" />

                                <rect x="135" y="40" width="45" height="18" rx="4" fill="#eff6ff" stroke="#bfdbfe" />
                                <text x="157" y="53" textAnchor="middle" fill="#1d4ed8" className="text-[9px] font-mono font-bold">
                                  {data.distanceKm} km
                                </text>

                                <circle cx="80" cy="65" r="14" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                                <text x="80" y="69" textAnchor="middle" fill="#475569" className="text-[10px] font-bold">Orig</text>
                                <text x="80" y="93" textAnchor="middle" fill="#64748b" className="text-[9px]">City Hospital</text>

                                <circle cx="230" cy="35" r="18" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
                                <text x="230" y="39" textAnchor="middle" fill="#1e40af" className="text-[10px] font-extrabold">Hub</text>
                                <text x="230" y="15" textAnchor="middle" fill="#1d4ed8" className="text-[10px] font-bold">
                                  {data.assignedHospital} (Matched)
                                </text>

                                <circle cx="200" cy="105" r="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                                <text x="200" y="125" textAnchor="middle" fill="#94a3b8" className="text-[9px]">Metro Hospital</text>

                                <circle cx="380" cy="65" r="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                                <text x="380" y="89" textAnchor="middle" fill="#94a3b8" className="text-[9px]">Apollo Care</text>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Best Hospital Matched Details */}
                      {step.id === 4 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Matched Facility</span>
                            <strong className="text-blue-700">{data.assignedHospital}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Resource Reserved</span>
                            <strong className="text-emerald-700">{quantity} Units</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Remaining Stock</span>
                            <strong className="text-slate-800 font-mono">{remainingUnits} Units</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Selection Rationale</span>
                            <strong className="text-slate-700 block truncate">
                              {data.reasonSelected || 'Lowest transit delay with guaranteed reserve.'}
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* Step 5: Allocation Completed Details */}
                      {step.id === 5 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Allocation ID</span>
                            <strong className="text-slate-800 font-mono">{data.allocationId}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Status</span>
                            <span className="inline-block px-2 py-0.5 rounded font-bold text-emerald-700 bg-emerald-100">
                              Allocated
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Assigned Facility</span>
                            <strong className="text-slate-800 truncate">{data.assignedHospital}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Arrival Window</span>
                            <strong className="text-blue-600 font-mono">{data.estimatedArrivalTime}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AT THE BOTTOM: Technical Details (Collapsed by default) */}
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => setTechnicalDetailsOpen(!technicalDetailsOpen)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-800 group-hover:text-blue-700 transition">
                    Technical Details
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Underlying algorithmic triage & optimization structures
                  </span>
                </div>
              </div>

              <div className="text-slate-400 group-hover:text-slate-600">
                {technicalDetailsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {technicalDetailsOpen && (
              <div className="mt-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 text-xs space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                  <Code2 className="h-4 w-4 text-blue-600" />
                  <span>Algorithmic Architecture</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* 1. Priority Queue */}
                  <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900 text-xs">
                      1. Priority Queue
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Implemented via a Max Heap. Ingests arriving emergency requests and continually maintains the highest-acuity patients (Critical before High, Medium, Low) at the root for immediate processing.
                    </p>
                  </div>

                  {/* 2. Hash Map */}
                  <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900 text-xs">
                      2. Hash Map
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Provides O(1) instantaneous lookup of hospital inventory, real-time blood unit availability by blood group, and ICU bed reservations across all regional nodes.
                    </p>
                  </div>

                  {/* 3. Graph */}
                  <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900 text-xs">
                      3. Graph
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Models the regional metropolitan road grid where hospitals and emergency pickup zones are vertices, and roadway segments with dynamic congestion weights form directed edges.
                    </p>
                  </div>

                  {/* 4. Dijkstra */}
                  <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900 text-xs">
                      4. Dijkstra Algorithm
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Calculates the exact shortest-path travel distance and minimal transit time between the incident site and candidate facilities holding compatible reserves.
                    </p>
                  </div>

                  {/* 5. Bipartite Matching */}
                  <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900 text-xs">
                      5. Bipartite Matching
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Solves multi-request capacity assignments across the regional network, optimizing resource allocation while avoiding premature exhaustion of critical stockpiles.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
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
