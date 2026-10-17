'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getInventory } from '@/lib/api';
import { InventoryItem, InventoryResponse, ApiError } from '@/lib/types';

export function useInventory(autoRefreshIntervalMs = 30000) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [metadata, setMetadata] = useState<{
    totalUnits: number;
    lowStockCount: number;
    categories: Record<string, number>;
    lastUpdated: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const isMounted = useRef(true);

  const fetchInventory = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const response: InventoryResponse = await getInventory();
      if (isMounted.current && response && response.success) {
        setInventory(response.data);
        setMetadata({
          totalUnits: response.totalUnits,
          lowStockCount: response.lowStockCount,
          categories: response.categories,
          lastUpdated: response.lastUpdated,
        });
        setLastRefreshed(new Date());
      }
    } catch (err: unknown) {
      if (isMounted.current) {
        const apiErr = err as ApiError;
        setError(apiErr?.message || 'Failed to refresh healthcare inventory.');
      }
    } finally {
      if (isMounted.current && !isSilent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchInventory();

    // Auto-refresh interval (30 seconds)
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshIntervalMs > 0) {
      intervalId = setInterval(() => {
        fetchInventory(true); // Silent background refresh
      }, autoRefreshIntervalMs);
    }

    return () => {
      isMounted.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchInventory, autoRefreshIntervalMs]);

  return {
    inventory,
    metadata,
    isLoading,
    error,
    lastRefreshed,
    refetch: () => fetchInventory(false),
  };
}
