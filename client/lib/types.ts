/**
 * Shared Type Definitions for MedAlloc System
 */

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type RequestStatus = 'Pending' | 'Processing' | 'Allocated' | 'Completed' | 'Cancelled';
export type AllocationStatus = 'Allocated' | 'In-Transit' | 'Queued' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled';

export type HospitalStatus = 'Available' | 'Busy' | 'Low Stock' | 'Operational' | string;

export type InventoryCategory = 'Blood' | 'Medicine' | 'ICU Beds' | 'Ambulances' | 'Doctors' | 'Equipment' | string;

export type InventoryStockStatus = 'Adequate' | 'Low' | 'Critical';

export interface EmergencyRequest {
  id: string; // e.g. "REQ-101"
  patientName: string;
  patientAge?: number;
  patientGender?: 'M' | 'F' | 'Other' | string;
  patientLocation: string;
  originHospital: string;
  resourceType: string;
  resourceDetail: string; // e.g. "A+", "Paracetamol 500mg IV", "Adult ICU Bed"
  resource: string; // Formatted summary e.g. "A+ Blood (2 Units)"
  quantity: number;
  priority: PriorityLevel;
  emergencyNotes?: string;
  emergencyReason?: string;
  assignedHospital?: string;
  distanceKm?: number;
  estimatedArrivalTime?: string;
  estimatedResponseTime?: string;
  allocationId?: string;
  status: RequestStatus;
  allocationStatus?: AllocationStatus;
  timestamp: string; // Formatted time e.g. "10:42 AM"
  createdAt: number; // Unix timestamp ms for sorting
}

export interface Hospital {
  id: number;
  name: string;
  type: string;
  location: string;
  contact: string;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
  status: HospitalStatus;
  statusColor?: string;
  bloodAvailability: Record<string, number>; // e.g. { 'A+': 12, 'O+': 25, 'B+': 14, ... }
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
  ambulances?: {
    total: number;
    available: number;
  };
  doctorsAvailable?: number;
}

export interface InventoryItem {
  id: string; // e.g. "INV-101"
  hospitalId: number;
  hospitalName: string;
  category: InventoryCategory;
  name: string; // e.g. "A+ Blood", "Paracetamol 500mg IV", "ICU Beds"
  stock: number;
  minThreshold: number;
  unit: string; // "units", "vials", "beds", "vehicles", etc.
  status: InventoryStockStatus;
  lastUpdated: string;
}

export interface AllocationHistoryItem {
  id: string; // e.g. "ALC-4819"
  requestId: string;
  patient: string;
  hospital: string;
  resource: string;
  quantity: number;
  priority: PriorityLevel;
  distance: number;
  estimatedArrivalTime: string;
  timestamp: string;
  createdAt: number;
  status: 'Allocated' | 'Completed' | 'In-Transit' | 'Cancelled';
  reasonSelected?: string;
}

export interface NotificationItem {
  id: string;
  type: 'request_submitted' | 'allocation_completed' | 'low_stock' | 'inventory_updated' | 'info';
  title: string;
  message: string;
  timestamp: string;
  createdAt: number;
  read: boolean;
  severity: 'info' | 'success' | 'warning' | 'critical';
  targetPage?: 'Dashboard' | 'Emergency Requests' | 'Hospitals' | 'Inventory' | 'Allocation History';
}

export interface LowStockAlert {
  id: string;
  hospitalName: string;
  hospitalId: number;
  resourceName: string;
  category: string;
  remainingStock: number;
  minThreshold: number;
  unit: string;
  severity: 'Low' | 'Critical';
  timestamp: string;
}

export interface Settings {
  simulationDelayMs: number;
  autoOpenProcessModal: boolean;
  enableSoundEffects: boolean;
  enableAutoAlerts: boolean;
}

export interface CreateRequestInput {
  patientName: string;
  patientAge?: number;
  patientGender?: 'M' | 'F' | 'Other';
  patientLocation?: string;
  originHospital: string;
  resourceType: string;
  bloodGroup?: string;
  medicineName?: string;
  quantity: number;
  priority: PriorityLevel;
  emergencyNotes?: string;
}

export interface AllocationResultData {
  requestId: string;
  allocationId: string;
  patientName: string;
  resource: string;
  quantity: number;
  priority: PriorityLevel;
  assignedHospital: string;
  distanceKm: number;
  estimatedArrivalTime: string;
  timestamp: string;
  availableUnits: number;
  previousInventoryStock: number;
  updatedInventoryStock: number;
  reasonSelected: string;
  emergencyReason: string;
  status: RequestStatus;
}

// -------------------------------------------------------------
// Legacy & API Types for backward compatibility
// -------------------------------------------------------------

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

export interface InventoryResponse {
  success: boolean;
  count: number;
  totalUnits: number;
  lowStockCount: number;
  categories: Record<string, number>;
  lastUpdated: string;
  data: InventoryItem[];
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
