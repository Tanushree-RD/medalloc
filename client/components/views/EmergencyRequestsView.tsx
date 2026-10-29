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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!patientName.trim()) {
      setFormError('Please enter a valid patient name.');
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Emergency Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time intake dispatch, automated resource matching, and active triage tracking.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'form'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Request Intake
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Requests</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
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
            <div className="bg-white rounded-2xl border border-blue-200/90 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Running Automated Allocation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simulating regional Dijkstra routing and bipartite matching...
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-blue-700 font-mono">
                    Step {simulationState.currentStep} of {simulationState.totalSteps}: {simulationState.stepMessage}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {simulationState.progressPercent}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${simulationState.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Step Sequence Display (Prompt: Receiving, Prioritizing, Locating, Checking, Selecting, Allocating, Completed) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
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
                      className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-blue-100/70 text-blue-900 font-bold shadow-2xs'
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
                          <div className="h-2 w-2 rounded-full bg-slate-300" />
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
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Resource Allocation Confirmed
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Patient Assigned to {allocationResult.assignedHospital}
                    </h2>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 self-start sm:self-auto font-mono">
                  ID: {allocationResult.allocationId}
                </span>
              </div>

              {/* Automatic Inventory Change Alert (Prompt Requirement: Decrease inventory automatically: A+ 12 ↓ 10, Show Inventory Updated Successfully) */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Inventory Updated Successfully</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Automatic regional inventory decrement applied at {allocationResult.assignedHospital}.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 font-mono font-bold text-blue-900 text-xs shadow-2xs self-start sm:self-auto">
                  {allocationResult.resource.split('(')[0].trim()}: {allocationResult.previousInventoryStock} ↓ {allocationResult.updatedInventoryStock} units
                </div>
              </div>

              {/* Allocation Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                {/* Patient */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Patient</span>
                  <strong className="text-slate-900 text-sm block truncate">
                    {allocationResult.patientName}
                  </strong>
                </div>

                {/* Requested Resource */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Requested Resource</span>
                  <strong className="text-slate-900 text-sm block truncate">
                    {allocationResult.resource}
                  </strong>
                </div>

                {/* Assigned Hospital */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Assigned Hospital</span>
                  <strong className="text-blue-700 text-sm block truncate">
                    {allocationResult.assignedHospital}
                  </strong>
                </div>

                {/* Distance */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Distance</span>
                  <strong className="text-slate-900 text-sm font-mono block">
                    {allocationResult.distanceKm} km
                  </strong>
                </div>

                {/* Estimated Arrival Time */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Estimated Arrival</span>
                  <strong className="text-blue-600 text-sm font-mono block">
                    {allocationResult.estimatedArrivalTime}
                  </strong>
                </div>

                {/* Priority */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Priority</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
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

                {/* Allocation Status */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-100">
                    Allocated
                  </span>
                </div>

                {/* Assigned Resources */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Reserved Stock</span>
                  <strong className="text-slate-800 text-sm block truncate">
                    {allocationResult.quantity} Units Locked
                  </strong>
                </div>
              </div>

              {/* Action Buttons: New Request & View Allocation Process */}
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
            /* MODERN EMERGENCY INTAKE FORM */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* Row 1: Patient Name & Age / Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Vance"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as 'M' | 'F' | 'Other')}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Origin Hospital & Incident Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Requesting / Origin Hospital
                    </label>
                    <select
                      value={originHospital}
                      onChange={(e) => setOriginHospital(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                    >
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.name}>
                          {h.name} ({h.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Incident / Pickup Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sector 4 Corridor"
                      value={patientLocation}
                      onChange={(e) => setPatientLocation(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Row 3: Resource Type & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Required Medical Resource
                    </label>
                    <select
                      value={resourceType}
                      onChange={(e) =>
                        setResourceType(
                          e.target.value as
                            | 'Blood Products'
                            | 'ICU Bed'
                            | 'Ventilator'
                            | 'Pharmaceuticals'
                            | 'Medical Oxygen'
                            | 'Ambulance'
                        )
                      }
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer font-medium"
                    >
                      <option value="Blood Products">Blood Products (Packed RBCs)</option>
                      <option value="ICU Bed">ICU Bed (Adult Critical Care)</option>
                      <option value="Ventilator">Mechanical Ventilator</option>
                      <option value="Pharmaceuticals">Emergency Pharmaceuticals</option>
                      <option value="Medical Oxygen">Medical Oxygen (50L Cylinders)</option>
                      <option value="Ambulance">ALS Emergency Ambulance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Quantity Required
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="flex-1 h-10 px-3 text-center font-mono font-bold text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conditional fields based on Resource Type */}
                {resourceType === 'Blood Products' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Blood Group
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {['A+', 'O+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setBloodGroup(bg)}
                          className={`py-2 px-1 text-center font-bold text-xs rounded-xl border transition ${
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
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Medicine Line
                    </label>
                    <select
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
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

                {/* Priority Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Triage Acuity Priority
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { value: 'Critical', label: 'Critical', color: 'border-red-300 text-red-700 bg-red-50' },
                      { value: 'High', label: 'High', color: 'border-amber-300 text-amber-700 bg-amber-50' },
                      { value: 'Medium', label: 'Medium', color: 'border-blue-300 text-blue-700 bg-blue-50' },
                      { value: 'Low', label: 'Low', color: 'border-slate-300 text-slate-700 bg-slate-100' },
                    ].map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setPriority(tier.value as PriorityLevel)}
                        className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                          priority === tier.value
                            ? `${tier.color} ring-2 ring-blue-500/20`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emergency Notes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Emergency Clinical Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter trauma diagnosis, vitals, or dispatch instructions..."
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                {/* Submit Request Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition"
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
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Priority Filters (Critical, High, Medium, Low) */}
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

              {/* Status Filters (Pending, Processing, Allocated, Completed, Cancelled) */}
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
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-medium">
                  <th className="py-3 px-5">ID & Patient</th>
                  <th className="py-3 px-5">Resource</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Assigned Facility</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5 text-right">Actions</th>
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
