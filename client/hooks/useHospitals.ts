'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHospitals } from '@/lib/api';
import { Hospital, ApiError } from '@/lib/types';

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getHospitals();
      if (response && response.success) {
        setHospitals(response.data);
      } else {
        setError('Failed to load hospital network.');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || 'Error connecting to backend service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return {
    hospitals,
    isLoading,
    error,
    refetch: fetchHospitals,
  };
}
