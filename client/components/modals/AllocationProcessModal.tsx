'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Navigation,
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
      title: 'Request Received & Validated',
      subtitle: 'Clinical parameters and patient acuity cataloged',
    },
    {
      id: 2,
      title: 'Triage Priority Ordering',
      subtitle: 'Min-Heap evaluates patient acuity tier',
    },
    {
      id: 3,
      title: 'Spatial Discovery & Transit Routing',
      subtitle: 'Spatial hash index matches closest regional hub',
    },
    {
      id: 4,
      title: 'Facility Matching & Supply Verification',
      subtitle: 'Guaranteed supply reservation with zero race conditions',
    },
    {
      id: 5,
      title: 'Allocation Complete & Dispatch Locked',
      subtitle: 'Inventory decremented and transit route confirmed',
    },
  ];

  const toggleStep = (id: number) => {
    setExpandedStep((prev) => (prev === id ? 0 : id));
  };

  const availableUnits = data.availableUnits ?? 12;
  const quantity = data.quantity ?? 1;
  const remainingUnits = Math.max(0, availableUnits - quantity);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-black/[0.06] shadow-editorial-float overflow-hidden my-8 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-black/[0.04] flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>Telemetry</span>
              <span>/</span>
              <span className="text-neutral-700 font-medium">{data.allocationId}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950 mt-1">
              Dispatch Verification Pipeline
            </h2>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              Audited allocation trace for patient <strong className="text-neutral-900">{data.patientName}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Vertical Timeline */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isSelected = expandedStep === step.id;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative pl-8">
                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="absolute left-3 top-7 bottom-0 w-px bg-neutral-200" />
                  )}

                  {/* Step Status Dot */}
                  <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center ring-4 ring-white">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neutral-900" />
                  </div>

                  {/* Step Header Button */}
                  <div
                    onClick={() => toggleStep(step.id)}
                    className="cursor-pointer group select-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold tracking-tight text-neutral-950 group-hover:text-blue-600 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-xs text-neutral-400">
                          {step.subtitle}
                        </p>
                      </div>

                      <div className="text-neutral-400 p-1">
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
                    <div className="mt-3 rounded-2xl bg-neutral-50/80 border border-black/[0.04] p-4 text-xs space-y-3 animate-in fade-in duration-150">
                      {/* Step 1: Request Received Details */}
                      {step.id === 1 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Patient</span>
                            <span className="text-neutral-900 font-medium">{data.patientName}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Resource</span>
                            <span className="text-neutral-900 font-medium">{data.resource}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Quantity</span>
                            <span className="text-neutral-900 font-medium">{data.quantity} Units</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Timestamp</span>
                            <span className="text-neutral-900 font-mono">{data.timestamp}</span>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Prioritized Details */}
                      {step.id === 2 && (
                        <div className="space-y-2">
                          <p className="text-neutral-600 leading-relaxed">
                            Emergency request classified by clinical urgency. Min-Heap Priority Queue ranks critical trauma cases before standard transfers.
                          </p>
                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div>
                              <span className="text-neutral-400 block text-[11px]">Priority Tier</span>
                              <span className="font-semibold text-neutral-900">{data.priority}</span>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                              <span className="text-neutral-400 block text-[11px]">Clinical Reason</span>
                              <span className="text-neutral-700 block truncate">
                                {data.emergencyReason || 'Critical emergency clinical triage dispatch.'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Nearest Resource Located Details */}
                      {step.id === 3 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <span className="text-neutral-400 block text-[11px]">Target Hub</span>
                              <span className="text-neutral-900 font-medium">{data.assignedHospital}</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[11px]">Transit Distance</span>
                              <span className="text-neutral-900 font-mono">{data.distanceKm} km</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[11px]">Stock Available</span>
                              <span className="text-neutral-900 font-mono">{availableUnits} Units</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[11px]">Est. Travel Time</span>
                              <span className="text-neutral-900 font-mono">{data.estimatedArrivalTime}</span>
                            </div>
                          </div>

                          {/* Mini Map Route */}
                          <div className="pt-2">
                            <span className="text-[11px] font-medium text-neutral-500 block mb-1.5 flex items-center gap-1">
                              <Navigation className="h-3 w-3 stroke-[2]" />
                              <span>Computed Dijkstra Transit Path</span>
                            </span>
                            <div className="rounded-2xl bg-white border border-black/[0.04] p-3 flex items-center justify-center">
                              <svg viewBox="0 0 460 130" className="w-full max-h-32">
                                <line x1="80" y1="65" x2="230" y2="35" stroke="#171717" strokeWidth="2" />
                                <line x1="80" y1="65" x2="200" y2="105" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="230" y1="35" x2="380" y2="65" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="200" y1="105" x2="380" y2="65" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />

                                <rect x="135" y="38" width="50" height="20" rx="10" fill="#f5f5f5" />
                                <text x="160" y="52" textAnchor="middle" fill="#171717" className="text-[10px] font-mono font-medium">
                                  {data.distanceKm} km
                                </text>

                                <circle cx="80" cy="65" r="14" fill="#ffffff" stroke="#a3a3a3" strokeWidth="1.5" />
                                <text x="80" y="69" textAnchor="middle" fill="#525252" className="text-[10px] font-medium">Origin</text>
                                <text x="80" y="93" textAnchor="middle" fill="#737373" className="text-[9px]">Patient Coord</text>

                                <circle cx="230" cy="35" r="16" fill="#171717" stroke="#171717" strokeWidth="1" />
                                <text x="230" y="39" textAnchor="middle" fill="#ffffff" className="text-[10px] font-medium">Hub</text>
                                <text x="230" y="15" textAnchor="middle" fill="#171717" className="text-[10px] font-semibold">
                                  {data.assignedHospital} (Matched)
                                </text>

                                <circle cx="200" cy="105" r="10" fill="#fafafa" stroke="#d4d4d4" strokeWidth="1" />
                                <text x="200" y="125" textAnchor="middle" fill="#a3a3a3" className="text-[9px]">Metro Hospital</text>

                                <circle cx="380" cy="65" r="10" fill="#fafafa" stroke="#d4d4d4" strokeWidth="1" />
                                <text x="380" y="89" textAnchor="middle" fill="#a3a3a3" className="text-[9px]">Apollo Care</text>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Best Hospital Matched Details */}
                      {step.id === 4 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Matched Facility</span>
                            <span className="text-neutral-900 font-medium">{data.assignedHospital}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Resource Reserved</span>
                            <span className="text-emerald-600 font-medium">{quantity} Units</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Remaining Stock</span>
                            <span className="text-neutral-900 font-mono">{remainingUnits} Units</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Selection Rationale</span>
                            <span className="text-neutral-700 block truncate">
                              {data.reasonSelected || 'Lowest transit delay with guaranteed reserve.'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Step 5: Allocation Completed Details */}
                      {step.id === 5 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Allocation ID</span>
                            <span className="text-neutral-900 font-mono">{data.allocationId}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Status</span>
                            <span className="text-emerald-600 font-medium">Allocated</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Assigned Facility</span>
                            <span className="text-neutral-900 truncate">{data.assignedHospital}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Arrival Window</span>
                            <span className="text-neutral-900 font-mono">{data.estimatedArrivalTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AT THE BOTTOM: Technical Details Accordion */}
          <div className="border-t border-black/[0.04] pt-4">
            <button
              onClick={() => setTechnicalDetailsOpen(!technicalDetailsOpen)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 hover:bg-neutral-100/80 border border-black/[0.04] transition text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center">
                  <Cpu className="h-3.5 w-3.5 stroke-[1.75]" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-tight text-neutral-950 group-hover:text-neutral-900 transition">
                    Technical Architecture (Data Structures & Algorithms)
                  </span>
                  <span className="text-[11px] text-neutral-400 block font-normal">
                    Algorithmic complexity and discrete optimization foundations
                  </span>
                </div>
              </div>

              <div className="text-neutral-400 group-hover:text-neutral-700">
                {technicalDetailsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {technicalDetailsOpen && (
              <div className="mt-3 rounded-2xl bg-neutral-50/80 border border-black/[0.04] p-5 space-y-4 text-xs animate-in fade-in duration-150">
                {/* 1. Priority Queue */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">1. Priority Queue (Min-Heap)</span>
                    <span className="font-mono text-[10px] bg-neutral-200/80 px-2 py-0.5 rounded text-neutral-700 font-medium">O(log N)</span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Maintains triage acuity ranking where critical trauma cases supersede routine requests with guaranteed logarithmic insertion and extraction.
                  </p>
                </div>

                {/* 2. Hash Map */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">2. Spatial Hash Map</span>
                    <span className="font-mono text-[10px] bg-neutral-200/80 px-2 py-0.5 rounded text-neutral-700 font-medium">O(1)</span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Partitions geographic coordinates into spatial cells to perform constant-time facility proximity lookups.
                  </p>
                </div>

                {/* 3. Dijkstra's Algorithm */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">3. Dijkstra Shortest-Path Graph</span>
                    <span className="font-mono text-[10px] bg-neutral-200/80 px-2 py-0.5 rounded text-neutral-700 font-medium">O((V + E) log V)</span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Models regional road networks as a weighted directed graph, dynamically calculating minimum transit times factoring distance and traffic.
                  </p>
                </div>

                {/* 4. Bipartite Matching */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">4. Bipartite Matching & Network Flow</span>
                    <span className="font-mono text-[10px] bg-neutral-200/80 px-2 py-0.5 rounded text-neutral-700 font-medium">O(V · E)</span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Solves multi-facility supply constraints to guarantee that scarce blood units and ICU beds are allocated to maximize patient survival.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
