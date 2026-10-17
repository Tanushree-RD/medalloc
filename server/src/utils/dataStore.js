/**
 * In-memory Data Store for MedAlloc Server
 * Coordinates live state for regional hospitals, emergency inventory,
 * and dispatch requests.
 */

const hospitals = [
  {
    id: 1,
    name: 'City Hospital',
    type: 'Level 1 Trauma & Academic Medical Center',
    location: 'Downtown Central',
    latitude: 40.7128,
    longitude: -74.006,
    distanceKm: 0,
    bloodAvailability: {
      'A+': 12,
      'O+': 25,
      'B+': 14,
      'AB+': 8,
      'O-': 6
    },
    icuBeds: {
      total: 30,
      occupied: 22,
      available: 8
    },
    medicines: [
      { name: 'Paracetamol (500mg IV)', stock: 350, unit: 'vials' },
      { name: 'Epinephrine (1mg)', stock: 120, unit: 'amps' },
      { name: 'Normal Saline (1000ml)', stock: 480, unit: 'bags' }
    ],
    equipment: {
      ventilators: 12,
      oxygenCylinders: 40
    },
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2831'
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
      'O-': 5,
      'A+': 18,
      'B+': 12,
      'AB-': 4
    },
    icuBeds: {
      total: 25,
      occupied: 11,
      available: 14
    },
    medicines: [
      { name: 'Medical Oxygen 50L', stock: 45, unit: 'cylinders' },
      { name: 'Morphine Sulfate (10mg)', stock: 85, unit: 'vials' },
      { name: 'Ceftriaxone (1g)', stock: 210, unit: 'vials' }
    ],
    equipment: {
      ventilators: 8,
      oxygenCylinders: 45
    },
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2832'
  },
  {
    id: 3,
    name: 'Sunrise Medical Center',
    type: 'Tertiary Care & Cardiac Institute',
    location: 'Midtown Plaza',
    latitude: 40.7589,
    longitude: -73.9851,
    distanceKm: 8,
    bloodAvailability: {
      'A+': 10,
      'AB+': 18,
      'O+': 22,
      'B-': 7
    },
    icuBeds: {
      total: 35,
      occupied: 13,
      available: 22
    },
    medicines: [
      { name: 'Heparin (5000 IU)', stock: 160, unit: 'vials' },
      { name: 'Amiodarone (150mg)', stock: 95, unit: 'vials' },
      { name: 'Atropine (0.5mg)', stock: 140, unit: 'amps' }
    ],
    equipment: {
      ventilators: 10,
      oxygenCylinders: 35
    },
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2833'
  },
  {
    id: 4,
    name: 'Apollo Care',
    type: 'Specialized Trauma & Critical Care',
    location: 'Uptown Medical Corridor',
    latitude: 40.7829,
    longitude: -73.9654,
    distanceKm: 12,
    bloodAvailability: {
      'O+': 15,
      'A-': 9,
      'B+': 11,
      'AB+': 14
    },
    icuBeds: {
      total: 28,
      occupied: 12,
      available: 16
    },
    medicines: [
      { name: 'Paracetamol (500mg IV)', stock: 100, unit: 'vials' },
      { name: 'Fentanyl (50mcg)', stock: 75, unit: 'amps' },
      { name: 'Propofol (20ml)', stock: 110, unit: 'vials' }
    ],
    equipment: {
      ventilators: 8,
      oxygenCylinders: 25
    },
    status: 'High Load',
    statusColor: 'amber',
    contact: '+1 (555) 019-2834'
  },
  {
    id: 5,
    name: 'Metro Hospital',
    type: 'Metropolitan Community & Trauma',
    location: 'South District',
    latitude: 40.6782,
    longitude: -73.9442,
    distanceKm: 12,
    bloodAvailability: {
      'O-': 15,
      'A+': 14,
      'O+': 30,
      'AB-': 5
    },
    icuBeds: {
      total: 24,
      occupied: 12,
      available: 12
    },
    medicines: [
      { name: 'Medical Oxygen 50L', stock: 30, unit: 'cylinders' },
      { name: 'Dopamine (200mg)', stock: 65, unit: 'vials' },
      { name: 'Lidocaine 2%', stock: 180, unit: 'vials' }
    ],
    equipment: {
      ventilators: 6,
      oxygenCylinders: 30
    },
    status: 'Operational',
    statusColor: 'emerald',
    contact: '+1 (555) 019-2835'
  }
];

const inventory = [
  { id: 'INV-01', name: 'A+ Blood', category: 'Blood Products', hospitalId: 1, hospitalName: 'City Hospital', stock: 12, minThreshold: 5, unit: 'Units', status: 'Adequate' },
  { id: 'INV-02', name: 'A+ Blood', category: 'Blood Products', hospitalId: 3, hospitalName: 'Sunrise Medical Center', stock: 10, minThreshold: 5, unit: 'Units', status: 'Adequate' },
  { id: 'INV-03', name: 'O- Blood (Universal)', category: 'Blood Products', hospitalId: 2, hospitalName: 'General Hospital', stock: 5, minThreshold: 8, unit: 'Units', status: 'Low' },
  { id: 'INV-04', name: 'O- Blood (Universal)', category: 'Blood Products', hospitalId: 5, hospitalName: 'Metro Hospital', stock: 15, minThreshold: 8, unit: 'Units', status: 'Adequate' },
  { id: 'INV-05', name: 'AB+ Blood', category: 'Blood Products', hospitalId: 3, hospitalName: 'Sunrise Medical Center', stock: 18, minThreshold: 6, unit: 'Units', status: 'Adequate' },
  { id: 'INV-06', name: 'ICU Bed (Adult)', category: 'Critical Care Beds', hospitalId: 1, hospitalName: 'City Hospital', stock: 8, minThreshold: 4, unit: 'Beds', status: 'Adequate' },
  { id: 'INV-07', name: 'ICU Bed (Adult)', category: 'Critical Care Beds', hospitalId: 2, hospitalName: 'General Hospital', stock: 14, minThreshold: 4, unit: 'Beds', status: 'Adequate' },
  { id: 'INV-08', name: 'ICU Bed (Adult)', category: 'Critical Care Beds', hospitalId: 3, hospitalName: 'Sunrise Medical Center', stock: 22, minThreshold: 6, unit: 'Beds', status: 'Adequate' },
  { id: 'INV-09', name: 'ICU Bed (Adult)', category: 'Critical Care Beds', hospitalId: 4, hospitalName: 'Apollo Care', stock: 16, minThreshold: 4, unit: 'Beds', status: 'Adequate' },
  { id: 'INV-10', name: 'ICU Bed (Adult)', category: 'Critical Care Beds', hospitalId: 5, hospitalName: 'Metro Hospital', stock: 12, minThreshold: 4, unit: 'Beds', status: 'Adequate' },
  { id: 'INV-11', name: 'Ventilator (Mechanical)', category: 'Emergency Equipment', hospitalId: 3, hospitalName: 'Sunrise Medical Center', stock: 10, minThreshold: 3, unit: 'Units', status: 'Adequate' },
  { id: 'INV-12', name: 'Ventilator (Mechanical)', category: 'Emergency Equipment', hospitalId: 4, hospitalName: 'Apollo Care', stock: 8, minThreshold: 3, unit: 'Units', status: 'Adequate' },
  { id: 'INV-13', name: 'Medical Oxygen 50L', category: 'Respiratory Care', hospitalId: 2, hospitalName: 'General Hospital', stock: 45, minThreshold: 15, unit: 'Cylinders', status: 'Adequate' },
  { id: 'INV-14', name: 'Medical Oxygen 50L', category: 'Respiratory Care', hospitalId: 5, hospitalName: 'Metro Hospital', stock: 30, minThreshold: 15, unit: 'Cylinders', status: 'Adequate' },
  { id: 'INV-15', name: 'Paracetamol (500mg IV)', category: 'Pharmaceuticals', hospitalId: 1, hospitalName: 'City Hospital', stock: 350, minThreshold: 100, unit: 'Vials', status: 'Adequate' },
  { id: 'INV-16', name: 'Paracetamol (500mg IV)', category: 'Pharmaceuticals', hospitalId: 4, hospitalName: 'Apollo Care', stock: 100, minThreshold: 50, unit: 'Vials', status: 'Adequate' }
];

const requests = [
  {
    id: 'REQ-101',
    patientName: 'John Doe',
    patientLocation: 'City Hospital',
    resourceType: 'A+ Blood',
    bloodGroup: 'A+',
    medicineName: '',
    quantity: 2,
    priority: 'Critical',
    assignedHospital: 'City Hospital',
    distanceKm: 0,
    allocationStatus: 'Allocated',
    estimatedResponseTime: '3 mins',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString()
  },
  {
    id: 'REQ-102',
    patientName: 'Sarah Chen',
    patientLocation: 'Apollo Care',
    resourceType: 'Ventilator',
    bloodGroup: '',
    medicineName: '',
    quantity: 1,
    priority: 'High',
    assignedHospital: 'Apollo Care',
    distanceKm: 0,
    allocationStatus: 'Allocated',
    estimatedResponseTime: '4 mins',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: 'REQ-103',
    patientName: 'Michael Brown',
    patientLocation: 'General Hospital',
    resourceType: 'Oxygen Cylinder',
    bloodGroup: '',
    medicineName: 'Medical Oxygen 50L',
    quantity: 1,
    priority: 'High',
    assignedHospital: 'General Hospital',
    distanceKm: 0,
    allocationStatus: 'Allocated',
    estimatedResponseTime: '5 mins',
    timestamp: new Date(Date.now() - 14 * 60000).toISOString()
  },
  {
    id: 'REQ-104',
    patientName: 'Alice Thorne',
    patientLocation: 'Metro Hospital',
    resourceType: 'ICU Bed',
    bloodGroup: '',
    medicineName: '',
    quantity: 1,
    priority: 'Medium',
    assignedHospital: 'Metro Hospital',
    distanceKm: 0,
    allocationStatus: 'Allocated',
    estimatedResponseTime: '6 mins',
    timestamp: new Date(Date.now() - 22 * 60000).toISOString()
  },
  {
    id: 'REQ-105',
    patientName: 'Robert Taylor',
    patientLocation: 'Midtown Plaza',
    resourceType: 'O- Blood',
    bloodGroup: 'O-',
    medicineName: '',
    quantity: 3,
    priority: 'Critical',
    assignedHospital: 'Sunrise Medical Center',
    distanceKm: 4.5,
    allocationStatus: 'Allocated',
    estimatedResponseTime: '9 mins',
    timestamp: new Date(Date.now() - 31 * 60000).toISOString()
  },
  {
    id: 'REQ-106',
    patientName: 'Elena Gomez',
    patientLocation: 'City Hospital',
    resourceType: 'Rare Antidote',
    bloodGroup: '',
    medicineName: 'Rare Antidote',
    quantity: 1,
    priority: 'Low',
    assignedHospital: 'None',
    distanceKm: 0,
    allocationStatus: 'Failed',
    estimatedResponseTime: 'N/A',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
  }
];

module.exports = {
  hospitals,
  inventory,
  requests
};
