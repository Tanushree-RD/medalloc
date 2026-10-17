/**
 * Shared Type Definitions for MedAlloc API Layer & UI Components
 */

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type AllocationStatus = 'Allocated' | 'In-Transit' | 'Queued' | 'Pending' | 'Failed';

export interface Hospital {
  id: number;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  bloodAvailability: Record<string, number>;
  icuBeds: {
    total: number;
    occupied: number;
    available: number;
  };
  medicines: Array<{
    name: string;
    stock: number;
    unit: string;
  }>;
  equipment?: {
    ventilators: number;
    oxygenCylinders: number;
  };
  status: string;
  statusColor: string;
  contact: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  hospitalId: number;
  hospitalName: string;
  stock: number;
  minThreshold: number;
  unit: string;
  status: 'Adequate' | 'Low' | 'Critical';
}

export interface InventoryResponse {
  success: boolean;
  count: number;
  totalUnits: number;
  lowStockCount: number;
  categories: Record<string, number>;
  lastUpdated: string;
  data: InventoryItem[];
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  patientLocation: string;
  resourceType: string;
  bloodGroup?: string;
  medicineName?: string;
  quantity: number;
  priority: PriorityLevel;
  assignedHospital: string;
  distanceKm: number;
  allocationStatus: AllocationStatus;
  estimatedResponseTime: string;
  timestamp: string;
}

export interface CreateRequestPayload {
  patientName: string;
  patientLocation: string;
  resourceType: string;
  bloodGroup?: string;
  medicineName?: string;
  quantity: number;
  priority: PriorityLevel;
}

export interface AllocationPayload {
  patientName: string;
  resource?: string;
  resourceType?: string;
  hospital?: string;
  patientLocation?: string;
  priority?: PriorityLevel | string;
  quantity?: number;
  bloodGroup?: string;
  medicineName?: string;
}

export interface AllocationResultItem {
  patientName: string;
  hospital: string;
  resource: string;
  distance: number;
  priority: string;
  status: string;
}

export interface AllocationResponse {
  success: boolean;
  assignedHospital?: string;
  distance?: number;
  allocationStatus?: string;
  estimatedResponseTime?: string;
  processedRequests?: number;
  successfulAllocations?: number;
  failedAllocations?: number;
  results?: AllocationResultItem[];
  error?: string;
  message?: string;
}

export interface StatCardItem {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral' | 'urgent';
  subtitle: string;
  category: 'critical' | 'blood' | 'icu' | 'medicine' | 'allocations' | 'requests';
}

export interface DashboardStatsData {
  activeRequests: number;
  bloodUnits: number;
  icuBeds: number;
  medicineStock: string | number;
  successfulAllocations: number;
  criticalRequests: number;
  statCards: StatCardItem[];
  connectedHospitals: number;
  systemStatus: string;
  timestamp: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStatsData;
}

export interface ResourceDistributionItem {
  name: string;
  value: number;
  color: string;
  unit: string;
}

export interface DailyAllocationPoint {
  time: string;
  requests: number;
  allocated: number;
  pending: number;
}

export interface HospitalCapacityItem {
  name: string;
  capacity: number;
  occupied: number;
  available: number;
  icuUtilization: number;
}

export interface AnalyticsData {
  resourceDistribution: ResourceDistributionItem[];
  dailyAllocationTrend: DailyAllocationPoint[];
  hospitalCapacity: HospitalCapacityItem[];
  kpis: {
    peakHour: string;
    matchingAccuracy: string;
    avgResponseTime: string;
    totalCapacity: number;
    occupancyRate: string;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}
