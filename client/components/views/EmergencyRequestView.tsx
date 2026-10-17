'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  Building2,
  Navigation,
  Clock,
  CheckCircle2,
  RefreshCw,
  HeartPulse,
  User,
  Droplet,
  Pill,
  BedDouble,
  ShieldAlert,
} from 'lucide-react';
import { allocateRequest } from '@/lib/api';
import { AllocationResponse, PriorityLevel } from '@/lib/types';
import { ErrorCard } from '@/components/ui/ErrorCard';

interface EmergencyRequestViewProps {
  onSuccessAllocation?: (result: AllocationResponse) => void;
  onErrorToast?: (message: string) => void;
}

export function EmergencyRequestView({
  onSuccessAllocation,
  onErrorToast,
}: EmergencyRequestViewProps) {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientLocation, setPatientLocation] = useState('City Hospital');
  const [resourceType, setResourceType] = useState('A+ Blood');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priority, setPriority] = useState<PriorityLevel>('Critical');

  // Submission & Result State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationResult, setAllocationResult] = useState<AllocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        patientName: patientName.trim() || 'Anonymous Patient',
        patientLocation,
        resource: resourceType,
        resourceType,
        bloodGroup: resourceType.includes('Blood') ? bloodGroup : undefined,
        medicineName: resourceType.includes('Medicine') ? medicineName : undefined,
        quantity: Number(quantity) || 1,
        priority,
      };

      const result = await allocateRequest(payload);
      setAllocationResult(result);

      if (onSuccessAllocation) {
        onSuccessAllocation(result);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to dispatch allocation request through C engine.';
      setError(errMsg);
      if (onErrorToast) {
        onErrorToast(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAllocationResult(null);
    setError(null);
    setPatientName('');
    setQuantity(1);
    setPriority('Critical');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency Intake & Dispatch Triage</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Submit Emergency Resource Request
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dispatches patient requirements directly to the compiled C Allocation Engine (Max-Heap + Dijkstra + Kuhn Bipartite)
          </p>
        </div>

        <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 items-center justify-center shrink-0">
          <HeartPulse className="h-6 w-6 animate-pulse" />
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <ErrorCard
          title="Allocation Engine Error"
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      {/* Result Card: Displayed upon Successful Allocation */}
      {allocationResult && (
        <div className="rounded-2xl bg-white border border-emerald-200/80 p-6 shadow-md shadow-emerald-500/5 space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block">
                  Optimal Facility Match Found
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {allocationResult.assignedHospital || 'City Hospital'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                {allocationResult.allocationStatus || 'Allocated'}
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                New Request
              </button>
            </div>
          </div>

          {/* 4 Required Result Display Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Assigned Hospital */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                Assigned Hospital
              </span>
              <p className="text-sm font-bold text-slate-900 truncate">
                {allocationResult.assignedHospital || 'City Hospital'}
              </p>
            </div>

            {/* 2. Distance */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                Network Distance
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {allocationResult.distance !== undefined ? `${allocationResult.distance} km` : '0 km'}
                <span className="text-[10px] text-slate-400 font-normal ml-1">(Dijkstra shortest path)</span>
              </p>
            </div>

            {/* 3. Allocation Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                Allocation Status
              </span>
              <p className="text-sm font-bold text-emerald-700">
                {allocationResult.allocationStatus || 'Allocated'}
              </p>
            </div>

            {/* 4. Estimated Response Time */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Est. Response Time
              </span>
              <p className="text-sm font-bold text-blue-700 font-mono">
                {allocationResult.estimatedResponseTime || `${Math.max(3, Math.round((allocationResult.distance || 0) * 1.6 + 2))} mins`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Request Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="h-3.5 w-3.5 text-blue-600" />
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Johnathan Vance"
              className="w-full h-11 px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 text-slate-900 placeholder-slate-400 transition"
            />
          </div>

          {/* Patient Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Navigation className="h-3.5 w-3.5 text-emerald-600" />
              Patient Location (Origin Hub) *
            </label>
            <select
              value={patientLocation}
              onChange={(e) => setPatientLocation(e.target.value)}
              className="w-full h-11 px-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 text-slate-900 transition"
            >
              <option value="City Hospital">City Hospital (Downtown Hub)</option>
              <option value="General Hospital">General Hospital (North-East)</option>
              <option value="Sunrise Medical Center">Sunrise Medical Center (Midtown)</option>
              <option value="Apollo Care">Apollo Care (Uptown)</option>
              <option value="Metro Hospital">Metro Hospital (South District)</option>
            </select>
          </div>

          {/* Resource Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <BedDouble className="h-3.5 w-3.5 text-violet-600" />
              Resource Type Needed *
            </label>
            <select
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                if (e.target.value.includes('Blood') && !bloodGroup) {
                  setBloodGroup('A+');
                }
              }}
              className="w-full h-11 px-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 text-slate-900 transition"
            >
              <option value="A+ Blood">A+ Blood Products</option>
              <option value="O- Blood">O- Blood (Universal Emergency)</option>
              <option value="ICU Bed">ICU Critical Care Bed</option>
              <option value="Ventilator">Mechanical Ventilator</option>
              <option value="Oxygen Cylinder">Medical Oxygen 50L Cylinder</option>
              <option value="Paracetamol">IV Paracetamol (500mg)</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              Quantity Required *
            </label>
            <input
              type="number"
              min={1}
              max={20}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-11 px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 text-slate-900 transition"
            />
          </div>

          {/* Optional: Blood Group */}
          {resourceType.includes('Blood') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Droplet className="h-3.5 w-3.5 text-red-600" />
                Blood Group (Optional)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 text-slate-900 transition"
              >
                <option value="A+">A+ (Rh Positive)</option>
                <option value="O-">O- (Universal Donor)</option>
                <option value="O+">O+ (Rh Positive)</option>
                <option value="AB+">AB+ (Universal Recipient)</option>
                <option value="B+">B+ (Rh Positive)</option>
              </select>
            </div>
          )}

          {/* Optional: Medicine Name */}
          {resourceType.includes('Paracetamol') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Pill className="h-3.5 w-3.5 text-purple-600" />
                Medicine Name / Specification (Optional)
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Paracetamol 500mg IV infusion"
                className="w-full h-11 px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 text-slate-900 placeholder-slate-400 transition"
              />
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
              Triage Priority Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { level: 'Critical', label: 'Critical (4)', desc: 'Life-threatening trauma', color: 'border-red-500 bg-red-50/80 text-red-800' },
                { level: 'High', label: 'High (3)', desc: 'Severe unstable condition', color: 'border-amber-500 bg-amber-50/80 text-amber-800' },
                { level: 'Medium', label: 'Medium (2)', desc: 'Urgent acute care', color: 'border-blue-500 bg-blue-50/80 text-blue-800' },
                { level: 'Low', label: 'Low (1)', desc: 'Stable non-urgent', color: 'border-slate-400 bg-slate-50/80 text-slate-800' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.level}
                  onClick={() => setPriority(item.level as PriorityLevel)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    priority === item.level
                      ? `${item.color} shadow-xs font-bold`
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs block font-bold">{item.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal block leading-tight mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            * Triggering will compute shortest paths & update regional hospital inventory immediately.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running C Engine...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Run Emergency Allocation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
