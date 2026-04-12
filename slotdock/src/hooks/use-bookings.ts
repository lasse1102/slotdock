"use client";

import { useCallback, useEffect, useState } from "react";
import type { Booking } from "@/lib/types";

export function useBookings(warehouseId: string | null, date: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/warehouses/${warehouseId}/bookings?date=${date}`
      );
      if (!res.ok) {
        setError("Fehler beim Laden der Buchungen");
        return;
      }
      const data = await res.json();
      setBookings(data.bookings);
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }, [warehouseId, date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, setBookings, loading, error, refetch: fetchBookings };
}
