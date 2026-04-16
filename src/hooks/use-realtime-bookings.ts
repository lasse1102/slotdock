"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import { formatTime } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export function useRealtimeBookings(
  warehouseId: string | null,
  selectedDate: string,
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
) {
  const [connectionLost, setConnectionLost] = useState(false);
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

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

          // Only add to state if the booking is for the currently selected date
          const bookingDate = newBooking.slot_start.slice(0, 10);
          const currentDate = selectedDateRef.current;

          // Compare booking date (UTC) loosely — also accept adjacent days
          // to handle timezone boundary cases. The exact match happens
          // because the API already filters by warehouse timezone.
          if (bookingDate === currentDate || isDateNearby(bookingDate, currentDate)) {
            setBookings((prev) => {
              if (prev.some((b) => b.id === newBooking.id)) return prev;
              return [...prev, newBooking].sort(
                (a, b) =>
                  new Date(a.slot_start).getTime() -
                  new Date(b.slot_start).getTime()
              );
            });
          }

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

/** Check if two date strings (YYYY-MM-DD) are within 1 day of each other */
function isDateNearby(dateA: string, dateB: string): boolean {
  const a = new Date(dateA + "T12:00:00Z");
  const b = new Date(dateB + "T12:00:00Z");
  const diffMs = Math.abs(a.getTime() - b.getTime());
  return diffMs <= 86_400_000; // 1 day in ms
}
