/**
 * Realistic Mock Data for the MedAlloc Healthcare Dashboard
 */

export interface StatMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral' | 'urgent';
  subtitle: string;
  category: 'critical' | 'blood' | 'icu' | 'medicine' | 'allocations' | 'requests';
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

export interface RecentRequestItem {
  id: string;
  patient: string;
  age: number;
  gender: string;
  resource: string;
  quantity: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedHospital: string;
  distanceKm: number;
  status: 'Allocated' | 'In-Transit' | 'Queued' | 'Pending';
  timeAgo: string;
}

export interface EmergencyAlertItem {
  id: string;
  level: 'Critical' | 'Warning' | 'Info';
  title: string;
  message: string;
  facility: string;
  timestamp: string;
  actionLabel?: string;
}

import { Hospital } from './types';

export const HOSPITALS_DATA: Hospital[] = [
  {
    id: 1,
    name: 'City Hospital',
    type: 'Trauma & Academic Medical Center',
    location: 'Downtown Central',
    latitude: 40.7128,
    longitude: -74.006,
    distanceKm: 0,
    bloodAvailability: {
      'A+': 12,
      'O+': 25,
      'B+': 14,
      'AB+': 8,
      'O-': 6,
    },
    icuBeds: {
      total: 30,
      occupied: 22,
      available: 8,
    },
    medicines: [
      { name: 'Normal Saline (1000ml)', stock: 480, unit: 'bags' },
      { name: 'Paracetamol (500mg IV)', stock: 350, unit: 'vials' },
      { name: 'Epinephrine (1mg)', stock: 120, unit: 'amps' },
    ],
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2831',
  },
  {
    id: 2,
    name: 'General Hospital',
    type: 'Regional Emergency Center',
    location: 'North-East District',
    latitude: 40.7306,
    longitude: -73.9352,
    distanceKm: 5,
    bloodAvailability: {
      'A+': 18,
      'B+': 12,
      'O-': 5,
      'AB-': 4,
    },
    icuBeds: {
      total: 25,
      occupied: 11,
      available: 14,
    },
    medicines: [
      { name: 'Medical Oxygen 50L', stock: 45, unit: 'cylinders' },
      { name: 'Ceftriaxone (1g)', stock: 210, unit: 'vials' },
      { name: 'Morphine Sulfate (10mg)', stock: 85, unit: 'vials' },
    ],
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2832',
  },
  {
    id: 3,
    name: 'Sunrise Medical Center',
    type: 'Cardiac & Critical Care Institute',
    location: 'Midtown Plaza',
    latitude: 40.7589,
    longitude: -73.9851,
    distanceKm: 8,
    bloodAvailability: {
      'O+': 22,
      'AB+': 18,
      'A+': 10,
      'B-': 7,
    },
    icuBeds: {
      total: 35,
      occupied: 13,
      available: 22,
    },
    medicines: [
      { name: 'Heparin (5000 IU)', stock: 160, unit: 'vials' },
      { name: 'Atropine (0.5mg)', stock: 140, unit: 'amps' },
      { name: 'Amiodarone (150mg)', stock: 95, unit: 'vials' },
    ],
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2833',
  },
  {
    id: 4,
    name: 'Apollo Care',
    type: 'Specialized Trauma & Surgery Center',
    location: 'Uptown Medical Corridor',
    latitude: 40.7829,
    longitude: -73.9654,
    distanceKm: 12,
    bloodAvailability: {
      'O+': 15,
      'AB+': 14,
      'B+': 11,
      'A-': 9,
    },
    icuBeds: {
      total: 28,
      occupied: 12,
      available: 16,
    },
    medicines: [
      { name: 'Propofol (20ml)', stock: 110, unit: 'vials' },
      { name: 'Paracetamol (500mg IV)', stock: 100, unit: 'vials' },
      { name: 'Fentanyl (50mcg)', stock: 75, unit: 'amps' },
    ],
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2834',
  },
  {
    id: 5,
    name: 'Metro Hospital',
    type: 'Metropolitan Community & Critical Care',
    location: 'South District',
    latitude: 40.6782,
    longitude: -73.9442,
    distanceKm: 12,
    bloodAvailability: {
      'O+': 30,
      'O-': 15,
      'A+': 14,
      'AB-': 5,
    },
    icuBeds: {
      total: 24,
      occupied: 12,
      available: 12,
    },
    medicines: [
      { name: 'Lidocaine 2%', stock: 180, unit: 'vials' },
      { name: 'Dopamine (200mg)', stock: 65, unit: 'vials' },
      { name: 'Medical Oxygen 50L', stock: 30, unit: 'cylinders' },
    ],
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2835',
  },
];

export const STAT_CARDS_DATA: StatMetric[] = [
  {
    id: 'active-requests',
    title: 'Active Emergency Requests',
    value: 14,
    change: '+3 in last hour',
    changeType: 'urgent',
    subtitle: 'Under live dispatch triage',
    category: 'requests',
  },
  {
    id: 'blood-units',
    title: 'Available Blood Units',
    value: 142,
    change: '89% optimal capacity',
    changeType: 'positive',
    subtitle: 'A+: 22 • O-: 20 • AB+: 18',
    category: 'blood',
  },
  {
    id: 'icu-beds',
    title: 'ICU Beds Available',
    value: 28,
    change: '6 reserve critical beds',
    changeType: 'neutral',
    subtitle: '28 / 72 regional beds open',
    category: 'icu',
  },
  {
    id: 'medicine-stock',
    title: 'Medicine Stock',
    value: '3,420',
    change: '94% adequate inventory',
    changeType: 'positive',
    subtitle: 'IV fluids, oxygen, antivirals',
    category: 'medicine',
  },
  {
    id: 'successful-allocations',
    title: 'Successful Allocations',
    value: 189,
    change: '98.4% success rate today',
    changeType: 'positive',
    subtitle: 'Avg dispatch time: 4.2 mins',
    category: 'allocations',
  },
  {
    id: 'critical-requests',
    title: 'Critical Requests',
    value: 4,
    change: 'Immediate triage required',
    changeType: 'negative',
    subtitle: 'Priority 4 Max-Heap head',
    category: 'critical',
  },
];

export const RESOURCE_DISTRIBUTION_DATA: ResourceDistributionItem[] = [
  { name: 'Blood Units', value: 142, color: '#2563eb', unit: 'units' },
  { name: 'ICU Beds', value: 72, color: '#10b981', unit: 'beds' },
  { name: 'Oxygen 50L', value: 250, color: '#06b6d4', unit: 'cylinders' },
  { name: 'Ventilators', value: 60, color: '#8b5cf6', unit: 'units' },
  { name: 'Emergency Meds', value: 450, color: '#f59e0b', unit: 'packs' },
];

export const DAILY_ALLOCATION_TREND_DATA: DailyAllocationPoint[] = [
  { time: '04:00', requests: 18, allocated: 18, pending: 0 },
  { time: '07:00', requests: 35, allocated: 33, pending: 2 },
  { time: '10:00', requests: 72, allocated: 69, pending: 3 },
  { time: '13:00', requests: 110, allocated: 106, pending: 4 },
  { time: '16:00', requests: 145, allocated: 141, pending: 4 },
  { time: '19:00', requests: 172, allocated: 168, pending: 4 },
  { time: '22:00', requests: 189, allocated: 186, pending: 3 },
];

export const HOSPITAL_CAPACITY_DATA: HospitalCapacityItem[] = [
  { name: 'City Hospital', capacity: 120, occupied: 98, available: 22, icuUtilization: 82 },
  { name: 'General Hospital', capacity: 85, occupied: 71, available: 14, icuUtilization: 84 },
  { name: 'Sunrise Med.', capacity: 110, occupied: 88, available: 22, icuUtilization: 80 },
  { name: 'Apollo Care', capacity: 90, occupied: 74, available: 16, icuUtilization: 82 },
  { name: 'Metro Hospital', capacity: 95, occupied: 83, available: 12, icuUtilization: 87 },
];

export const RECENT_REQUESTS_DATA: RecentRequestItem[] = [
  {
    id: 'REQ-1094',
    patient: 'John Doe',
    age: 46,
    gender: 'M',
    resource: 'A+ Blood (2 Units)',
    quantity: 2,
    priority: 'Critical',
    assignedHospital: 'City Hospital',
    distanceKm: 5.2,
    status: 'Allocated',
    timeAgo: '2 mins ago',
  },
  {
    id: 'REQ-1093',
    patient: 'Sarah Chen',
    age: 34,
    gender: 'F',
    resource: 'Ventilator (1 Unit)',
    quantity: 1,
    priority: 'High',
    assignedHospital: 'Apollo Care',
    distanceKm: 3.8,
    status: 'In-Transit',
    timeAgo: '8 mins ago',
  },
  {
    id: 'REQ-1092',
    patient: 'Michael Brown',
    age: 58,
    gender: 'M',
    resource: 'Oxygen 50L (1 Cyl)',
    quantity: 1,
    priority: 'High',
    assignedHospital: 'General Hospital',
    distanceKm: 6.4,
    status: 'Allocated',
    timeAgo: '14 mins ago',
  },
  {
    id: 'REQ-1091',
    patient: 'Alice Thorne',
    age: 29,
    gender: 'F',
    resource: 'ICU Bed (1 Bed)',
    quantity: 1,
    priority: 'Medium',
    assignedHospital: 'Metro Hospital',
    distanceKm: 7.1,
    status: 'Allocated',
    timeAgo: '22 mins ago',
  },
  {
    id: 'REQ-1090',
    patient: 'Robert Taylor',
    age: 62,
    gender: 'M',
    resource: 'O- Blood (3 Units)',
    quantity: 3,
    priority: 'Critical',
    assignedHospital: 'Sunrise Med. Center',
    distanceKm: 4.5,
    status: 'In-Transit',
    timeAgo: '31 mins ago',
  },
  {
    id: 'REQ-1089',
    patient: 'Elena Gomez',
    age: 51,
    gender: 'F',
    resource: 'Rare Antidote (1 Unit)',
    quantity: 1,
    priority: 'Low',
    assignedHospital: 'Pending Facility',
    distanceKm: 0,
    status: 'Queued',
    timeAgo: '45 mins ago',
  },
  {
    id: 'REQ-1088',
    patient: 'David Miller',
    age: 42,
    gender: 'M',
    resource: 'ICU Bed (1 Bed)',
    quantity: 1,
    priority: 'Critical',
    assignedHospital: 'City Hospital',
    distanceKm: 2.1,
    status: 'Allocated',
    timeAgo: '52 mins ago',
  },
  {
    id: 'REQ-1087',
    patient: 'Sophia Patel',
    age: 38,
    gender: 'F',
    resource: 'IV Paracetamol 500mg',
    quantity: 4,
    priority: 'Medium',
    assignedHospital: 'Apollo Care',
    distanceKm: 4.0,
    status: 'Allocated',
    timeAgo: '1 hr ago',
  },
];

export const EMERGENCY_ALERTS_DATA: EmergencyAlertItem[] = [
  {
    id: 'ALERT-01',
    level: 'Critical',
    title: 'O- Blood Shortage Warning',
    message: 'General Hospital O- reserve dropped below safe threshold (5 units remaining). Automatic regional redistribution recommended.',
    facility: 'General Hospital',
    timestamp: '3 mins ago',
    actionLabel: 'Redistribute Stock',
  },
  {
    id: 'ALERT-02',
    level: 'Critical',
    title: 'Mass Casualty Triage Activated',
    message: 'Multi-vehicle collision on Sector 4 Highway. 7 incoming trauma cases dispatched to City Hospital & Sunrise Medical Center.',
    facility: 'Sector 4 Corridor',
    timestamp: '12 mins ago',
    actionLabel: 'View Triage Board',
  },
  {
    id: 'ALERT-03',
    level: 'Warning',
    title: 'ICU Capacity Warning (92%)',
    message: 'Apollo Care has only 2 remaining ICU beds available. Non-critical admissions diverted to Metro Hospital.',
    facility: 'Apollo Care',
    timestamp: '25 mins ago',
    actionLabel: 'Manage Routing',
  },
  {
    id: 'ALERT-04',
    level: 'Info',
    title: 'Emergency Restock Delivered',
    message: '45 medical oxygen cylinders received, verified, and cataloged into Central Hub inventory.',
    facility: 'Central Logistics Hub',
    timestamp: '1 hr ago',
    actionLabel: 'View Manifest',
  },
  {
    id: 'ALERT-05',
    level: 'Info',
    title: 'Dijkstra Roadway Re-routing',
    message: 'Main Street transit construction bypassed; alternate routing via 5th Ave active for emergency ambulances.',
    facility: 'Regional Dispatch GIS',
    timestamp: '2 hrs ago',
  },
];
