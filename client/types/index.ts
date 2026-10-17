/**
 * MedAlloc Type Definitions
 */

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp?: string;
  service?: string;
}

export interface MedicalResource {
  id: string;
  name: string;
  type: 'ventilator' | 'icu_bed' | 'oxygen_cylinder' | 'ecmo' | 'staff';
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  status: 'available' | 'low' | 'critical' | 'depleted';
}

export interface PatientDemand {
  id: string;
  patientId: string;
  severityScore: number; // e.g. 1-100 triage score
  requiredResources: Array<{
    type: string;
    quantity: number;
    urgencyHours: number;
  }>;
  createdAt: string;
}

export interface AllocationPlan {
  id: string;
  timestamp: string;
  allocatedItems: Array<{
    patientId: string;
    resourceId: string;
    resourceType: string;
    allocatedUnits: number;
    matchScore: number;
  }>;
  summary: {
    totalRequested: number;
    totalFulfilled: number;
    efficiencyRate: number;
  };
}
