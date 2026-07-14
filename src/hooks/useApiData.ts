"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useSite } from "@/context/StoreContext";

export function useSiteApi<T>(path: string, deps: unknown[] = []) {
  const { currentStore } = useSite();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fullPath = currentStore ? `/api/sites/${currentStore.id}${path}` : null;

  const refetch = useCallback(async () => {
    if (!fullPath) return;
    setLoading(true);
    setError(null);
    const res = await api.get<T>(fullPath);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "Failed to fetch");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullPath, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useApi<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<T>(path);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "Failed to fetch");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
