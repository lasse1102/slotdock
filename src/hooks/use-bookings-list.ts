"use client";

import { useCallback, useEffect, useState } from "react";
import type { Booking } from "@/lib/types";

interface UseBookingsListParams {
  warehouseId: string | null;
  dateFrom: string;
  dateTo: string;
  dockId?: string;
  status?: string;
  page: number;
  perPage?: number;
}

interface UseBookingsListReturn {
  bookings: Booking[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBookingsList({
  warehouseId,
  dateFrom,
  dateTo,
  dockId,
  status,
  page,
  perPage = 50,
}: UseBookingsListParams): UseBookingsListReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo,
        page: String(page),
        per_page: String(perPage),
      });
      if (dockId) params.set("dock_id", dockId);
      if (status) params.set("status", status);

      const res = await fetch(
        `/api/warehouses/${warehouseId}/bookings?${params.toString()}`
      );
      if (!res.ok) {
        setError("Fehler beim Laden der Buchungen");
        return;
      }
      const data = await res.json();
      setBookings(data.bookings);
      setTotal(data.total);
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }, [warehouseId, dateFrom, dateTo, dockId, status, page, perPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, total, loading, error, refetch: fetchBookings };
}
