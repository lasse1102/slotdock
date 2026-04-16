"use client";

import { useEffect, useState } from "react";
import type { Warehouse } from "@/lib/types";

export function useWarehouse() {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWarehouse() {
      try {
        const res = await fetch("/api/warehouses");
        if (!res.ok) {
          setError("Fehler beim Laden des Lagers");
          return;
        }
        const { warehouses } = await res.json();
        setWarehouse(warehouses?.[0] ?? null);
      } catch {
        setError("Netzwerkfehler");
      } finally {
        setLoading(false);
      }
    }

    fetchWarehouse();
  }, []);

  return { warehouse, loading, error };
}
