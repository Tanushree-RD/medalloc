'use client';

import React, { useState } from 'react';
import {
  Send,
  AlertTriangle,
  Search,
  Sparkles,
  Plus,
  Minus,
  Droplet,
  BedDouble,
  Pill,
  Ambulance,
  Wind,
  Zap,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { useMedAlloc } from '@/context/MedAllocContext';
import { PriorityLevel, AllocationResultData } from '@/lib/types';

interface EmergencyRequestsViewProps {
  onOpenProcessModal?: (data: AllocationResultData) => void;
}

export function EmergencyRequestsView({
  onOpenProcessModal,
}: EmergencyRequestsViewProps) {
  const {
    requests,
    hospitals,
    submitEmergencyRequest,
    simulationState,
    openProcessModalWithData,
    globalSearchQuery,
  } = useMedAlloc();

  // Mode: 'intake' | 'allocating' | 'result' | 'queue'
  const [viewMode, setViewMode] = useState<'intake' | 'allocating' | 'result' | 'queue'>('intake');

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(42);
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Other'>('M');
  const [patientLocation, setPatientLocation] = useState('Sector 4, Westside');
  const [originHospital, setOriginHospital] = useState('City Hospital');
  const [resourceType, setResourceType] = useState<
    'Blood Products' | 'ICU Bed' | 'Ventilator' | 'Pharmaceuticals' | 'Medical Oxygen' | 'Ambulance'
  >('Blood Products');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [medicineName, setMedicineName] = useState('Paracetamol (500mg IV)');
  const [quantity, setQuantity] = useState<number>(2);
  const [priority, setPriority] = useState<PriorityLevel>('Critical');
  const [emergencyNotes, setEmergencyNotes] = useState('');

  // Result & Error State
  const [allocationResult, setAllocationResult] = useState<AllocationResultData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Queue Filters & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');

  // 1-Click Clinical Presets
  const applyPreset = (preset: {
    name: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    location: string;
    resource: 'Blood Products' | 'ICU Bed' | 'Ventilator' | 'Pharmaceuticals' | 'Medical Oxygen' | 'Ambulance';
    bloodGroup?: string;
    medicine?: string;
    qty: number;
    priority: PriorityLevel;
    notes: string;
  }) => {
    setPatientName(preset.name);
    setPatientAge(preset.age);
    setPatientGender(preset.gender);
    setPatientLocation(preset.location);
    setResourceType(preset.resource);
    if (preset.bloodGroup) setBloodGroup(preset.bloodGroup);
    if (preset.medicine) setMedicineName(preset.medicine);
    setQuantity(preset.qty);
    setPriority(preset.priority);
    setEmergencyNotes(preset.notes);
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      setFormError('Please enter a valid patient name or triage identifier.');
      return;
    }
    if (quantity <= 0) {
      setFormError('Requested quantity must be at least 1 unit.');
      return;
    }

    setFormError(null);
    setViewMode('allocating');

    try {
      const result = await submitEmergencyRequest({
        patientName: patientName.trim(),
        patientAge,
        patientGender,
        patientLocation,
        originHospital,
        resourceType,
        bloodGroup: resourceType === 'Blood Products' ? bloodGroup : undefined,
        medicineName: resourceType === 'Pharmaceuticals' ? medicineName : undefined,
        quantity,
        priority,
        emergencyNotes: emergencyNotes.trim() || `${priority} clinical priority request for ${resourceType}.`,
      });

      setAllocationResult(result);
      setViewMode('result');
    } catch {
      setFormError('Simulation failed. Please try submitting again.');
      setViewMode('intake');
    }
  };

  // Filter requests for Queue view
  const effectiveQueueSearch = searchFilter || globalSearchQuery;
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      !effectiveQueueSearch ||
      r.patientName.toLowerCase().includes(effectiveQueueSearch.toLowerCase()) ||
      r.resource.toLowerCase().includes(effectiveQueueSearch.toLowerCase()) ||
      (r.assignedHospital && r.assignedHospital.toLowerCase().includes(effectiveQueueSearch.toLowerCase())) ||
      r.id.toLowerCase().includes(effectiveQueueSearch.toLowerCase());

    const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const getPriorityDot = (p: PriorityLevel) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-500';
      case 'High':
        return 'bg-amber-500';
      case 'Medium':
        return 'bg-blue-500';
      case 'Low':
        return 'bg-neutral-400';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TOP HEADER & VIEW MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
            Clinical Triage & Allocation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
            Algorithmic priority queue matching emergency patient acuity with regional inventories.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-full border border-black/[0.04] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('intake')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              viewMode === 'intake' || viewMode === 'allocating' || viewMode === 'result'
                ? 'bg-white text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => setViewMode('queue')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'queue'
                ? 'bg-white text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Active Queue</span>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">
              {requests.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. MODE: INTAKE FORM */}
      {viewMode === 'intake' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Quick 1-Click Clinical Presets */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-black/[0.03] space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
              <Sparkles className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>1-Click Clinical Triage Scenarios</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    name: 'Jonathan Vance',
                    age: 38,
                    gender: 'M',
                    location: 'Highway 101, Marker 44',
                    resource: 'Blood Products',
                    bloodGroup: 'O-',
                    qty: 3,
                    priority: 'Critical',
                    notes: 'Major arterial trauma from high-speed motor vehicle collision. Acute hemorrhage protocol.',
                  })
                }
                className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100/80 border border-black/[0.06] text-xs font-normal text-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Acute Hemorrhage (O-)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    name: 'Beatrix Morales',
                    age: 64,
                    gender: 'F',
                    location: 'North District Clinic',
                    resource: 'ICU Bed',
                    qty: 1,
                    priority: 'High',
                    notes: 'Post-cardiac arrest stabilization requiring continuous telemetry and invasive monitoring.',
                  })
                }
                className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100/80 border border-black/[0.06] text-xs font-normal text-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Adult ICU Admission</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    name: 'David Thorne',
                    age: 52,
                    gender: 'M',
                    location: 'East Industrial Complex',
                    resource: 'Pharmaceuticals',
                    medicine: 'Paracetamol (500mg IV)',
                    qty: 4,
                    priority: 'Medium',
                    notes: 'Emergency IV replenishment for regional triage unit.',
                  })
                }
                className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100/80 border border-black/[0.06] text-xs font-normal text-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Emergency IV Stock</span>
              </button>
            </div>
          </div>

          {/* Intake Form */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] shadow-editorial space-y-6"
          >
            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Patient Demographics */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-950">
                1. Patient Demographics & Location
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">
                    Patient Name or Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. John Doe / Trauma Code-12"
                    className="w-full h-10 px-3.5 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600">
                      Age
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600">
                      Sex
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as 'M' | 'F' | 'Other')}
                      className="w-full h-10 px-2 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">
                    Incident Location / Coordinates
                  </label>
                  <input
                    type="text"
                    value={patientLocation}
                    onChange={(e) => setPatientLocation(e.target.value)}
                    placeholder="e.g. Sector 4, Westside"
                    className="w-full h-10 px-3.5 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">
                    Requesting Facility / Unit
                  </label>
                  <select
                    value={originHospital}
                    onChange={(e) => setOriginHospital(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} ({h.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Requested Resource */}
            <div className="space-y-4 pt-4 border-t border-black/[0.04]">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-950">
                2. Resource Selection
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'Blood Products', icon: Droplet },
                  { label: 'ICU Bed', icon: BedDouble },
                  { label: 'Ventilator', icon: Wind },
                  { label: 'Pharmaceuticals', icon: Pill },
                  { label: 'Medical Oxygen', icon: Zap },
                  { label: 'Ambulance', icon: Ambulance },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = resourceType === item.label;
                  return (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => setResourceType(item.label as typeof resourceType)}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-2xs'
                          : 'border-black/[0.06] bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <Icon className={`h-4 w-4 stroke-[1.75] ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Resource Sub-options */}
              {resourceType === 'Blood Products' && (
                <div className="p-4 rounded-xl bg-neutral-50/70 border border-black/[0.04] space-y-2">
                  <label className="text-xs font-medium text-neutral-600">
                    Blood Group
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((grp) => (
                      <button
                        type="button"
                        key={grp}
                        onClick={() => setBloodGroup(grp)}
                        className={`h-8 w-11 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                          bloodGroup === grp
                            ? 'bg-neutral-950 text-white'
                            : 'bg-white border border-black/[0.06] text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {resourceType === 'Pharmaceuticals' && (
                <div className="p-4 rounded-xl bg-neutral-50/70 border border-black/[0.04] space-y-2">
                  <label className="text-xs font-medium text-neutral-600">
                    Pharmaceutical Agent
                  </label>
                  <select
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  >
                    <option value="Paracetamol (500mg IV)">Paracetamol (500mg IV)</option>
                    <option value="Norepinephrine (4mg/4mL)">Norepinephrine (4mg/4mL)</option>
                    <option value="Morphine Sulfate (10mg/mL)">Morphine Sulfate (10mg/mL)</option>
                    <option value="Broad-Spectrum Ceftriaxone">Broad-Spectrum Ceftriaxone</option>
                  </select>
                </div>
              )}
            </div>

            {/* Priority & Quantity */}
            <div className="space-y-4 pt-4 border-t border-black/[0.04]">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-950">
                3. Triage Priority & Quantity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">
                    Acuity Tier
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Critical', 'High', 'Medium', 'Low'] as PriorityLevel[]).map((p) => {
                      const isSelected = priority === p;
                      return (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setPriority(p)}
                          className={`py-2 px-1 rounded-xl text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-neutral-950 text-white shadow-2xs'
                              : 'bg-neutral-50/80 hover:bg-neutral-100 text-neutral-600 border border-black/[0.04]'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${getPriorityDot(p)}`} />
                          <span>{p}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">
                    Requested Units
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-10 w-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition cursor-pointer"
                    >
                      <Minus className="h-4 w-4 stroke-[2]" />
                    </button>
                    <span className="font-mono text-base font-semibold text-neutral-950 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-10 w-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clinical Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">
                  Clinical Dispatch Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="Additional context for receiving medical officers..."
                  className="w-full p-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-medium transition-all shadow-editorial flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Send className="h-4 w-4 stroke-[1.75]" />
                <span>Run Algorithmic Allocation</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. MODE: ALLOCATION SIMULATION (Raycast / Linear style progress) */}
      {viewMode === 'allocating' && (
        <div className="max-w-xl mx-auto py-12 space-y-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 border border-black/[0.04] shadow-editorial-float space-y-6 text-center">
            {/* Pulsing Status Dot */}
            <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center relative">
              <span className="h-4 w-4 rounded-full bg-neutral-950 animate-breathing-dot" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                Running MedAlloc Routing Engine
              </h2>
              <p className="text-xs text-neutral-500 font-normal">
                {simulationState.stepMessage || 'Evaluating regional inventory and transit paths...'}
              </p>
            </div>

            {/* Hairline Progress Bar */}
            <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-950 transition-all duration-500"
                style={{ width: `${simulationState.progressPercent}%` }}
              />
            </div>

            {/* Telemetry Steps */}
            <div className="pt-4 text-left space-y-2 border-t border-black/[0.03]">
              <div className="text-[11px] font-medium text-neutral-400">
                Live Dispatch Telemetry:
              </div>
              <div className="text-xs text-neutral-600 font-mono space-y-1">
                <p>• Patient: {patientName} ({patientLocation})</p>
                <p>• Acuity Order: Priority Queue Min-Heap evaluated</p>
                <p>• Spatial Grid: Dijkstra shortest transit matrix computing</p>
                <p>• Inventory: Synchronizing hospital reserve state</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODE: ALLOCATION RESULT (Stripe / Vercel style success receipt) */}
      {viewMode === 'result' && allocationResult && (
        <div className="max-w-xl mx-auto py-8 space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 border border-black/[0.04] shadow-editorial-float space-y-6">
            {/* Success Ring */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                  Resource Allocated Successfully
                </h2>
                <p className="text-xs text-neutral-400">
                  Reservation confirmed & dispatch route locked.
                </p>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-black/[0.03] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Patient</span>
                <span className="font-medium text-neutral-900">{allocationResult.patientName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Assigned Hospital</span>
                <span className="font-semibold text-neutral-950">{allocationResult.assignedHospital}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Resource</span>
                <span className="font-medium text-neutral-900">
                  {allocationResult.resource} ({allocationResult.quantity} units)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Transit Distance / ETA</span>
                <span className="font-mono text-neutral-900">
                  {allocationResult.distanceKm} km · {allocationResult.estimatedArrivalTime}
                </span>
              </div>
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs">
                <span className="text-neutral-500">Inventory Balance</span>
                <span className="font-medium text-emerald-600">
                  {allocationResult.previousInventoryStock} units → {allocationResult.updatedInventoryStock} units
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  if (onOpenProcessModal) onOpenProcessModal(allocationResult);
                  else openProcessModalWithData(allocationResult);
                }}
                className="w-full h-11 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Inspect Algorithmic Process</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setPatientName('');
                    setViewMode('intake');
                  }}
                  className="h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium transition cursor-pointer"
                >
                  New Intake
                </button>
                <button
                  onClick={() => setViewMode('queue')}
                  className="h-10 rounded-full border border-black/[0.08] hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition cursor-pointer"
                >
                  View Active Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODE: ACTIVE QUEUE (Linear Issue List Style) */}
      {viewMode === 'queue' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter requests..."
                className="w-full h-9 pl-9 pr-3 rounded-full bg-white border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Critical', 'High', 'Medium', 'Low'] as Array<'All' | PriorityLevel>).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    priorityFilter === p
                      ? 'bg-neutral-950 text-white'
                      : 'bg-white border border-black/[0.05] text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-black/[0.04] text-center text-xs text-neutral-400">
                No matching requests found
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-editorial-sm hover:shadow-editorial hover:border-black/[0.08] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${getPriorityDot(req.priority)}`} />
                      <span className="text-sm font-semibold tracking-tight text-neutral-950 truncate">
                        {req.patientName}
                      </span>
                      <span className="text-xs text-neutral-400">
                        ({req.patientAge}y, {req.patientGender}) · {req.patientLocation}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="font-medium text-neutral-800">
                        {req.resource} ({req.quantity})
                      </span>
                      <span>•</span>
                      <span className="text-neutral-500">
                        Assigned: {req.assignedHospital || 'Pending Match'}
                      </span>
                      <span>•</span>
                      <span className="text-neutral-400">
                        {req.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        const processData: AllocationResultData = {
                          requestId: req.id,
                          allocationId: req.allocationId || `ALC-${req.id.replace('REQ-', '')}`,
                          patientName: req.patientName,
                          resource: req.resource,
                          quantity: req.quantity,
                          priority: req.priority,
                          assignedHospital: req.assignedHospital || req.originHospital,
                          distanceKm: req.distanceKm ?? 3.8,
                          estimatedArrivalTime: req.estimatedArrivalTime || '10 mins',
                          timestamp: req.timestamp,
                          availableUnits: 12,
                          previousInventoryStock: 12,
                          updatedInventoryStock: 12 - req.quantity,
                          reasonSelected: 'Nearest regional hospital holding required reserve.',
                          emergencyReason: req.emergencyNotes || 'Emergency clinical triage intake dispatch.',
                          status: req.status,
                        };
                        openProcessModalWithData(processData);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-800 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="h-3 w-3 stroke-[2]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
