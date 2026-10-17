const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AllocationPayload {
  patientName?: string;
  resource?: string;
  priority?: string;
  [key: string]: unknown;
}

export interface AllocationResponse<T = unknown> {
  success: boolean;
  message?: string;
  received?: T;
  error?: string;
  code?: string;
}

/**
 * Sends allocation request to the Express backend (POST /api/allocate)
 * which forwards the payload to the C algorithm engine via stdin/stdout IPC
 * @param data Request payload
 */
export async function allocate(data: AllocationPayload): Promise<AllocationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      responseData.error || responseData.message || `Request failed with status: ${response.status}`
    );
  }

  return responseData;
}
