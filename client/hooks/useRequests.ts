'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRequests, createRequest, allocateRequest } from '@/lib/api';
import {
  EmergencyRequest,
  CreateRequestPayload,
  AllocationPayload,
  AllocationResponse,
  ApiError,
} from '@/lib/types';

export function useRequests() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRequests();
      if (response && response.success) {
        setRequests(response.data);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || 'Failed to retrieve emergency requests.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const submitNewRequest = async (payload: CreateRequestPayload): Promise<EmergencyRequest | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createRequest(payload);
      if (res && res.success) {
        setRequests((prev) => [res.data, ...prev]);
        return res.data;
      }
      return null;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || 'Failed to submit emergency request.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const allocateEmergency = async (payload: AllocationPayload): Promise<AllocationResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await allocateRequest(payload);
      await fetchRequests(); // Refresh list with newly allocated items
      return res;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || 'Failed to execute C allocation engine.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    requests,
    isLoading,
    isSubmitting,
    error,
    refetch: fetchRequests,
    createRequest: submitNewRequest,
    allocateRequest: allocateEmergency,
  };
}
