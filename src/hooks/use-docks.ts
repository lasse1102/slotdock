"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dock } from "@/lib/types";

export function useDocks(warehouseId: string | null) {
  const [docks, setDocks] = useState<Dock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocks = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/docks`);
      if (!res.ok) {
        setError("Fehler beim Laden der Rampen");
        return;
      }
      const { docks } = await res.json();
      setDocks(docks);
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    fetchDocks();
  }, [fetchDocks]);

  return { docks, loading, error, refetch: fetchDocks };
}
