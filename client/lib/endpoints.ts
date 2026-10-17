/**
 * Centralized API Endpoints Configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  HOSPITALS: `${API_BASE_URL}/api/hospitals`,
  HOSPITAL_BY_ID: (id: string | number) => `${API_BASE_URL}/api/hospitals/${id}`,
  INVENTORY: `${API_BASE_URL}/api/inventory`,
  REQUESTS: `${API_BASE_URL}/api/requests`,
  ALLOCATE: `${API_BASE_URL}/api/allocate`,
  ANALYTICS: `${API_BASE_URL}/api/analytics`,
} as const;

export default ENDPOINTS;
