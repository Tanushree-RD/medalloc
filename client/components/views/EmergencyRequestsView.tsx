'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  RotateCcw,
  Eye,
  AlertTriangle,
  Search,
  Sparkles,
  User,
  Check,
  Plus,
  Minus,
  Droplet,
  BedDouble,
  Pill,
  Ambulance,
  Wind,
  Zap,
} from 'lucide-react';
import { useMedAlloc } from '@/context/MedAllocContext';
import { PriorityLevel, RequestStatus, AllocationResultData } from '@/lib/types';

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
    updateRequestStatus,
    simulationState,
    openProcessModalWithData,
    globalSearchQuery,
  } = useMedAlloc();

  // Active Tab: 'form' (Intake & Simulation) or 'queue' (All Requests)
  const [activeTab, setActiveTab] = useState<'form' | 'queue'>('form');

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

  // Table Filters & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus>('All');

  // One-click Clinical Triage Presets
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!patientName.trim()) {
      setFormError('Please enter patient full name.');
      return;
    }
    if (quantity < 1) {
      setFormError('Quantity required must be at least 1.');
      return;
    }

    try {
      const result = await submitEmergencyRequest({
        patientName: patientName.trim(),
        patientAge: Number(patientAge) || 40,
        patientGender,
        patientLocation: patientLocation.trim() || 'Central District',
        originHospital,
        resourceType,
        bloodGroup,
        medicineName,
        quantity: Number(quantity) || 1,
        priority,
        emergencyNotes: emergencyNotes.trim() || 'Urgent clinical dispatch intake.',
      });

      setAllocationResult(result);
    } catch (err) {
      console.error(err);
      setFormError('An error occurred during simulated allocation.');
    }
  };

  const handleResetForm = () => {
    setAllocationResult(null);
    setPatientName('');
    setQuantity(2);
    setPriority('Critical');
    setEmergencyNotes('');
    setFormError(null);
  };

  const handleViewProcess = (result: AllocationResultData) => {
    if (onOpenProcessModal) {
      onOpenProcessModal(result);
    } else {
      openProcessModalWithData(result);
    }
  };

  // Filter requests for the table
  const effectiveSearch = searchFilter || globalSearchQuery;
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      !effectiveSearch ||
      req.patientName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      req.resource.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (req.assignedHospital && req.assignedHospital.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      req.id.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const resourceOptions: Array<{
    id: typeof resourceType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'Blood Products', label: 'Blood Units', icon: Droplet },
    { id: 'ICU Bed', label: 'ICU Bed', icon: BedDouble },
    { id: 'Ventilator', label: 'Ventilator', icon: Wind },
    { id: 'Pharmaceuticals', label: 'Medicine', icon: Pill },
    { id: 'Medical Oxygen', label: 'Oxygen 50L', icon: Sparkles },
    { id: 'Ambulance', label: 'Ambulance', icon: Ambulance },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Emergency Dispatch & Intake
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time medical intake, algorithmic resource allocation, and active triage tracking.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'form'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Request Intake
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Requests Queue</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono">
              {requests.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: NEW REQUEST INTAKE */}
      {activeTab === 'form' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* SIMULATION RUNNING OVERLAY / PROGRESS CARD */}
          {simulationState.isActive ? (
            <div className="bg-white rounded-3xl border border-blue-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Simulating Regional Allocation
                    </h3>
                    <p className="text-xs text-slate-400">
                      Executing spatial Dijkstra routing and capacity matching...
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {simulationState.progressPercent}% Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${simulationState.progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-medium text-right font-mono">
                  Step {simulationState.currentStep} of {simulationState.totalSteps}
                </div>
              </div>

              {/* Step Sequence Display */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2 text-xs">
                {[
                  'Receiving request...',
                  'Prioritizing request...',
                  'Locating nearby hospitals...',
                  'Checking inventory...',
                  'Selecting best hospital...',
                  'Allocating resources...',
                  'Completed.',
                ].map((stepText, idx) => {
                  const isCurrent = simulationState.currentStep === idx + 1;
                  const isDone = simulationState.currentStep > idx + 1;

                  return (
                    <div
                      key={stepText}
                      className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-blue-100/80 text-blue-900 font-bold shadow-2xs'
                          : isDone
                          ? 'text-emerald-700 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span>{stepText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : allocationResult ? (
            /* ALLOCATION RESULT CONFIRMED CARD */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Resource Allocation Confirmed
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Patient Assigned to {allocationResult.assignedHospital}
                    </h2>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 self-start sm:self-auto font-mono">
                  ID: {allocationResult.allocationId}
                </span>
              </div>

              {/* Automatic Inventory Change Alert */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Inventory Updated Successfully</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Automatic inventory reserve applied at {allocationResult.assignedHospital}.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 font-mono font-bold text-blue-900 text-xs shadow-2xs self-start sm:self-auto">
                  {allocationResult.resource.split('(')[0].trim()}: {allocationResult.previousInventoryStock} ↓ {allocationResult.updatedInventoryStock} units
                </div>
              </div>

              {/* Allocation Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Patient</span>
                  <strong className="text-slate-900 text-sm block truncate">
                    {allocationResult.patientName}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Requested Resource</span>
                  <strong className="text-slate-900 text-sm block truncate">
                    {allocationResult.resource}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Assigned Facility</span>
                  <strong className="text-blue-700 text-sm block truncate">
                    {allocationResult.assignedHospital}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Transit Distance</span>
                  <strong className="text-slate-900 text-sm font-mono block">
                    {allocationResult.distanceKm} km
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Estimated Arrival</span>
                  <strong className="text-blue-600 text-sm font-mono block">
                    {allocationResult.estimatedArrivalTime}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Priority</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      allocationResult.priority === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : allocationResult.priority === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {allocationResult.priority}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-100">
                    Allocated
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Reserved Stock</span>
                  <strong className="text-slate-800 text-sm block truncate">
                    {allocationResult.quantity} Units Locked
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={handleResetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>New Request</span>
                </button>

                <button
                  onClick={() => handleViewProcess(allocationResult)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Allocation Process</span>
                </button>
              </div>
            </div>
          ) : (
            /* MODERN INTAKE FORM (With One-Click Clinical Presets!) */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
              {/* Presets Bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Quick Clinical Intake Presets (1-Click Fill)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        name: 'Marcus Vance',
                        age: 48,
                        gender: 'M',
                        location: 'Highway 4 Bypass',
                        resource: 'Blood Products',
                        bloodGroup: 'A+',
                        qty: 2,
                        priority: 'Critical',
                        notes: 'Severe motor trauma with acute hemorrhagic shock.',
                      })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-medium transition text-slate-700"
                  >
                    🩸 A+ Blood Transfusion (2u)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        name: 'Emily Watson',
                        age: 62,
                        gender: 'F',
                        location: 'Central Plaza',
                        resource: 'ICU Bed',
                        qty: 1,
                        priority: 'High',
                        notes: 'Acute myocardial infarction post-cardiac catheterization.',
                      })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-medium transition text-slate-700"
                  >
                    🛏️ Adult ICU Bed (1 bed)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        name: 'David Kim',
                        age: 35,
                        gender: 'M',
                        location: 'North Corridor',
                        resource: 'Blood Products',
                        bloodGroup: 'O-',
                        qty: 3,
                        priority: 'Critical',
                        notes: 'Ruptured spleen requiring urgent universal donor blood.',
                      })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-medium transition text-slate-700"
                  >
                    🚨 O- Blood (Trauma 3u)
                  </button>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* Row 1: Patient Info */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-6">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as 'M' | 'F' | 'Other')}
                      className="w-full h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Origin Hospital & Incident Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Requesting / Origin Facility
                    </label>
                    <select
                      value={originHospital}
                      onChange={(e) => setOriginHospital(e.target.value)}
                      className="w-full h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer font-medium"
                    >
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.name}>
                          {h.name} ({h.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Incident / Pickup Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sector 4 Corridor"
                      value={patientLocation}
                      onChange={(e) => setPatientLocation(e.target.value)}
                      className="w-full h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Row 3: Segmented Visual Resource Selector */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Required Medical Resource
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {resourceOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = resourceType === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setResourceType(opt.id)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-[11px] truncate leading-tight">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-inputs depending on selected resource */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {resourceType === 'Blood Products' && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Blood Group
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {['A+', 'O+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setBloodGroup(bg)}
                            className={`py-1.5 px-1 text-center font-bold text-xs rounded-lg border transition ${
                              bloodGroup === bg
                                ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500/20'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {bg}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {resourceType === 'Pharmaceuticals' && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Medicine Line
                      </label>
                      <select
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="w-full h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                      >
                        <option value="Paracetamol (500mg IV)">Paracetamol (500mg IV)</option>
                        <option value="Epinephrine (1mg)">Epinephrine (1mg)</option>
                        <option value="Normal Saline (1000ml)">Normal Saline (1000ml)</option>
                        <option value="Heparin (5000 IU)">Heparin (5000 IU)</option>
                        <option value="Propofol (20ml)">Propofol (20ml)</option>
                        <option value="Lidocaine 2%">Lidocaine 2%</option>
                        <option value="Ceftriaxone (1g)">Ceftriaxone (1g)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Quantity Required
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-9.5 w-9.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="flex-1 h-9.5 px-3 text-center font-mono font-bold text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-9.5 w-9.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Triage Acuity Priority
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { value: 'Critical', label: 'Critical', detail: '< 15m Dispatch', color: 'border-red-300 text-red-700 bg-red-50' },
                      { value: 'High', label: 'High', detail: '< 30m Urgent', color: 'border-amber-300 text-amber-700 bg-amber-50' },
                      { value: 'Medium', label: 'Medium', detail: '< 2h Acute', color: 'border-blue-300 text-blue-700 bg-blue-50' },
                      { value: 'Low', label: 'Low', detail: 'Routine Schedule', color: 'border-slate-300 text-slate-700 bg-slate-100' },
                    ].map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setPriority(tier.value as PriorityLevel)}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                          priority === tier.value
                            ? `${tier.color} ring-2 ring-blue-500/20 font-bold`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{tier.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{tier.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emergency Notes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Emergency Clinical Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter trauma diagnosis, vital signs, or dispatch instructions..."
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                {/* Submit Request Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit & Run Simulated Allocation</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: ALL REQUESTS QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
          {/* Table Controls Header: Search & Filter Pills */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search requests..."
                className="w-full h-8.5 pl-8 pr-3 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 px-1 font-semibold">Priority:</span>
                {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      priorityFilter === p
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 px-1 font-semibold">Status:</span>
                {(['All', 'Pending', 'Processing', 'Allocated', 'Completed', 'Cancelled'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      statusFilter === s
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-5">ID & Patient</th>
                  <th className="py-2.5 px-5">Resource</th>
                  <th className="py-2.5 px-5">Priority</th>
                  <th className="py-2.5 px-5">Assigned Facility</th>
                  <th className="py-2.5 px-5">Status</th>
                  <th className="py-2.5 px-5">Timestamp</th>
                  <th className="py-2.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patient */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate">
                              {req.patientName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {req.id} • {req.patientLocation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {req.resource}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            req.priority === 'Critical'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : req.priority === 'High'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : req.priority === 'Medium'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>

                      {/* Assigned Hospital */}
                      <td className="py-3.5 px-5">
                        <span className="text-slate-800 font-medium">
                          {req.assignedHospital || req.originHospital}
                        </span>
                        {req.distanceKm !== undefined && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {req.distanceKm} km • {req.estimatedArrivalTime}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            req.status === 'Allocated' || req.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : req.status === 'Processing'
                              ? 'bg-blue-50 text-blue-700'
                              : req.status === 'Cancelled'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                        {req.timestamp}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <button
                          onClick={() => {
                            const resData: AllocationResultData = {
                              requestId: req.id,
                              allocationId: req.allocationId || `ALC-${req.id.replace('REQ-', '')}`,
                              patientName: req.patientName,
                              resource: req.resource,
                              quantity: req.quantity,
                              priority: req.priority,
                              assignedHospital: req.assignedHospital || req.originHospital,
                              distanceKm: req.distanceKm ?? 4,
                              estimatedArrivalTime: req.estimatedArrivalTime || '10 mins',
                              timestamp: req.timestamp,
                              availableUnits: 14,
                              previousInventoryStock: 14,
                              updatedInventoryStock: 14 - req.quantity,
                              reasonSelected: 'Optimal available facility with guaranteed reserve.',
                              emergencyReason: req.emergencyNotes || 'Emergency clinical triage intake dispatch.',
                              status: req.status,
                            };
                            handleViewProcess(resData);
                          }}
                          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 font-semibold text-xs transition"
                        >
                          View Process
                        </button>

                        {req.status === 'Allocated' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'Completed')}
                            className="px-2 py-1 rounded-lg text-emerald-700 hover:bg-emerald-50 font-semibold text-xs transition"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                        )}

                        {req.status !== 'Completed' && req.status !== 'Cancelled' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'Cancelled')}
                            className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 font-semibold text-xs transition"
                            title="Cancel Request"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No emergency requests match current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
