"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import { formatTime } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export function useRealtimeBookings(
  warehouseId: string | null,
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
) {
  const [connectionLost, setConnectionLost] = useState(false);

  useEffect(() => {
    if (!warehouseId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`bookings:${warehouseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `warehouse_id=eq.${warehouseId}`,
        },
        (payload) => {
          const newBooking = payload.new as Booking;
          setBookings((prev) => {
            if (prev.some((b) => b.id === newBooking.id)) return prev;
            return [...prev, newBooking].sort(
              (a, b) =>
                new Date(a.slot_start).getTime() -
                new Date(b.slot_start).getTime()
            );
          });
          toast(
            `Neue Buchung: ${newBooking.carrier_company}, ${formatTime(newBooking.slot_start)}`,
            "info"
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `warehouse_id=eq.${warehouseId}`,
        },
        (payload) => {
          const updated = payload.new as Booking;
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionLost(false);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionLost(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [warehouseId, setBookings]);

  return { connectionLost };
}
