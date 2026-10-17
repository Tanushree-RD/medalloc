'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAnalytics } from '@/lib/api';
import { AnalyticsData, ApiError } from '@/lib/types';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAnalytics();
      if (response && response.success) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load analytics data.');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || 'Error connecting to analytics backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
