'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { AllocationProcessData } from '@/components/modals/AllocationProcessModal';
import { DashboardRequestItem } from '@/components/views/DashboardView';

interface EmergencyRequestsViewProps {
  onOpenProcessModal: (data: AllocationProcessData) => void;
  onNewRequestAdded?: (newReq: DashboardRequestItem) => void;
}

export function EmergencyRequestsView({
  onOpenProcessModal,
  onNewRequestAdded,
}: EmergencyRequestsViewProps) {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [hospital, setHospital] = useState('City Hospital');
  const [resourceType, setResourceType] = useState('Blood Products');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState<number>(2);
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Critical');
  const [emergencyNotes, setEmergencyNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationResult, setAllocationResult] = useState<AllocationProcessData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);

    // Simulate smart allocation
    setTimeout(() => {
      let resolvedResource = resourceType;
      if (resourceType === 'Blood Products') {
        resolvedResource = `${bloodGroup} Blood`;
      } else if (resourceType === 'Pharmaceuticals') {
        resolvedResource = medicineName || 'Emergency Medicine';
      }

      // Assign realistic hospital matching
      let assignedHospital = 'City Hospital';
      let distanceKm = 0;
      let availableUnits = 12;

      if (hospital === 'Apollo Care') {
        assignedHospital = 'Apollo Care';
        distanceKm = 0;
        availableUnits = 8;
      } else if (hospital === 'General Hospital') {
        assignedHospital = 'General Hospital';
        distanceKm = 5;
        availableUnits = 18;
      } else if (hospital === 'Sunrise Medical Center') {
        assignedHospital = 'Sunrise Medical Center';
        distanceKm = 8;
        availableUnits = 10;
      } else {
        assignedHospital = 'General Hospital';
        distanceKm = 5;
        availableUnits = 18;
      }

      const travelMins = Math.max(4, Math.round(distanceKm * 1.6 + 3));

      const resultData: AllocationProcessData = {
        patientName: patientName.trim(),
        resource: resolvedResource,
        quantity: Number(quantity) || 1,
        priority,
        assignedHospital,
        distanceKm,
        estimatedArrivalTime: `${travelMins} mins`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        allocationId: `ALC-${Math.floor(1000 + Math.random() * 9000)}`,
        availableUnits,
        reasonSelected: 'Lowest travel time and guaranteed matching inventory reserve.',
        emergencyReason: emergencyNotes.trim() || 'Severe trauma patient requiring rapid clinical stabilization.',
      };

      setAllocationResult(resultData);
      setIsSubmitting(false);

      if (onNewRequestAdded) {
        onNewRequestAdded({
          id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
          patient: resultData.patientName,
          resource: resultData.resource,
          priority: resultData.priority,
          assignedHospital: resultData.assignedHospital,
          status: 'Allocated',
          timestamp: 'Just now',
        });
      }
    }, 700);
  };

  const handleResetForm = () => {
    setAllocationResult(null);
    setPatientName('');
    setQuantity(2);
    setPriority('Critical');
    setEmergencyNotes('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Emergency Resource Intake
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit urgent hospital requests for immediate regional resource matching and dispatch.
        </p>
      </div>

      {/* Conditional: Allocation Result Success Card OR Modern Intake Form */}
      {allocationResult ? (
        /* Large Success Card */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
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

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 self-start sm:self-auto">
              ID: {allocationResult.allocationId}
            </span>
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
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold text-red-700 bg-red-100">
                {allocationResult.priority}
              </span>
            </div>

            {/* Allocation Status */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block text-[11px]">Allocation Status</span>
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-100">
                Allocated
              </span>
            </div>

            {/* Assigned Resources */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block text-[11px]">Assigned Resources</span>
              <strong className="text-slate-800 text-sm block truncate">
                {allocationResult.quantity} Units Reserved
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
              onClick={() => onOpenProcessModal(allocationResult)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <Eye className="h-4 w-4" />
              <span>View Allocation Process</span>
            </button>
          </div>
        </div>
      ) : (
        /* Modern Request Form */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Row 1: Patient Name & Origin Hospital */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Patient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Origin Hospital
                </label>
                <select
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="City Hospital">City Hospital (Downtown Central)</option>
                  <option value="General Hospital">General Hospital (North-East District)</option>
                  <option value="Sunrise Medical Center">Sunrise Medical Center (Midtown)</option>
                  <option value="Apollo Care">Apollo Care (Uptown Corridor)</option>
                  <option value="Metro Hospital">Metro Hospital (South District)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Resource Type & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Resource Type
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="Blood Products">Blood Products</option>
                  <option value="ICU Bed">ICU Bed (Adult Critical Care)</option>
                  <option value="Ventilator">Mechanical Ventilator</option>
                  <option value="Pharmaceuticals">Emergency Pharmaceuticals</option>
                  <option value="Medical Oxygen">Medical Oxygen (50L Cylinder)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Quantity Required
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Conditional fields based on Resource Type */}
            {resourceType === 'Blood Products' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="A+">A+ (Positive)</option>
                  <option value="O+">O+ (Positive)</option>
                  <option value="B+">B+ (Positive)</option>
                  <option value="AB+">AB+ (Positive)</option>
                  <option value="O-">O- (Universal Donor)</option>
                  <option value="A-">A- (Negative)</option>
                  <option value="B-">B- (Negative)</option>
                  <option value="AB-">AB- (Negative)</option>
                </select>
              </div>
            )}

            {resourceType === 'Pharmaceuticals' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Medicine Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Epinephrine (1mg) or Paracetamol (500mg IV)"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            )}

            {/* Priority */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Triage Priority
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { value: 'Critical', label: 'Critical', color: 'border-red-300 text-red-700 bg-red-50' },
                  { value: 'High', label: 'High', color: 'border-amber-300 text-amber-700 bg-amber-50' },
                  { value: 'Medium', label: 'Medium', color: 'border-slate-300 text-slate-700 bg-slate-100' },
                  { value: 'Low', label: 'Low', color: 'border-slate-300 text-slate-600 bg-slate-100' },
                ].map((tier) => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setPriority(tier.value as 'Critical' | 'High' | 'Medium' | 'Low')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                      priority === tier.value
                        ? `${tier.color} ring-2 ring-blue-500/30`
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
                Emergency Notes
              </label>
              <textarea
                rows={3}
                placeholder="Include diagnosis, trauma severity, or dispatch instructions..."
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Submit Request Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Processing Allocation...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
