'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '@/lib/api';
import { DashboardStatsData, ApiError } from '@/lib/types';

export function useDashboard() {
  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDashboardStats();
      if (response && response.success) {
        setData(response.data);
      } else {
        setError('Failed to load dashboard metrics.');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || 'Error connecting to backend service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats: data,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
