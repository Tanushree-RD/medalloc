import { ENDPOINTS } from './endpoints';
import {
  DashboardStatsResponse,
  Hospital,
  InventoryResponse,
  EmergencyRequest,
  CreateRequestPayload,
  AllocationPayload,
  AllocationResponse,
  AnalyticsResponse,
  ApiError,
} from './types';

export type { AllocationPayload, AllocationResponse };

/**
 * Robust fetch wrapper handling JSON serialization, timeouts, and network failure diagnostics
 */
async function fetchClient<T>(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(id);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error: ApiError = {
        message: data?.error || data?.message || `HTTP ${response.status}: Request failed`,
        status: response.status,
        code: data?.code,
        details: data,
      };
      throw error;
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(id);

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    const isAbort = (err as Error)?.name === 'AbortError';
    const networkError: ApiError = {
      message: isAbort
        ? `Request timed out after ${timeoutMs}ms. Please verify the Express backend is running on port 5000.`
        : `Network connection failed: ${(err as Error)?.message || 'Unable to reach backend service'}.`,
      code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
      status: 0,
    };
    throw networkError;
  }
}

/**
 * Fetches real-time dashboard KPIs and aggregated metrics
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return fetchClient<DashboardStatsResponse>(ENDPOINTS.DASHBOARD_STATS);
}

/**
 * Fetches the list of all regional hospitals with inventory availability
 */
export async function getHospitals(): Promise<{ success: boolean; count: number; data: Hospital[] }> {
  return fetchClient<{ success: boolean; count: number; data: Hospital[] }>(ENDPOINTS.HOSPITALS);
}

/**
 * Fetches live hospital inventory with categorized breakdown
 */
export async function getInventory(): Promise<InventoryResponse> {
  return fetchClient<InventoryResponse>(ENDPOINTS.INVENTORY);
}

/**
 * Fetches all registered emergency requests
 */
export async function getRequests(): Promise<{ success: boolean; count: number; data: EmergencyRequest[] }> {
  return fetchClient<{ success: boolean; count: number; data: EmergencyRequest[] }>(ENDPOINTS.REQUESTS);
}

/**
 * Registers an emergency patient request and triggers auto-allocation
 */
export async function createRequest(payload: CreateRequestPayload): Promise<{ success: boolean; data: EmergencyRequest }> {
  return fetchClient<{ success: boolean; data: EmergencyRequest }>(ENDPOINTS.REQUESTS, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Dispatches an emergency request directly through the C Allocation Engine
 * POST /api/allocate
 */
export async function allocateRequest(payload: AllocationPayload): Promise<AllocationResponse> {
  const formattedPayload = {
    patientName: payload.patientName,
    resource: payload.resource || payload.resourceType || 'A+ Blood',
    hospital: payload.hospital || payload.patientLocation || 'City Hospital',
    priority: payload.priority || 'High',
    quantity: payload.quantity || 1,
    bloodGroup: payload.bloodGroup,
    medicineName: payload.medicineName,
  };

  return fetchClient<AllocationResponse>(ENDPOINTS.ALLOCATE, {
    method: 'POST',
    body: JSON.stringify(formattedPayload),
  });
}

/**
 * Legacy compatibility helper for allocate
 */
export async function allocate(data: AllocationPayload): Promise<AllocationResponse> {
  return allocateRequest(data);
}

/**
 * Fetches live analytical and capacity utilization metrics for Recharts
 */
export async function getAnalytics(): Promise<AnalyticsResponse> {
  return fetchClient<AnalyticsResponse>(ENDPOINTS.ANALYTICS);
}
