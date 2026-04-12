"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useWarehouse } from "@/hooks/use-warehouse";
import { useDocks } from "@/hooks/use-docks";
import { useBookings } from "@/hooks/use-bookings";
import { useRealtimeBookings } from "@/hooks/use-realtime-bookings";
import { DayView } from "@/components/features/dashboard/day-view";
import { BookingDetail } from "@/components/features/dashboard/booking-detail";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { warehouse, loading: whLoading } = useWarehouse();
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const { docks, loading: docksLoading } = useDocks(warehouse?.id ?? null);
  const { bookings, setBookings, loading: bookingsLoading, error, refetch } =
    useBookings(warehouse?.id ?? null, selectedDate);

  const { connectionLost } = useRealtimeBookings(
    warehouse?.id ?? null,
    setBookings
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!whLoading && !warehouse) {
      router.replace("/warehouse/setup");
    }
  }, [whLoading, warehouse, router]);

  const handleBookingClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
  }, []);

  const handleStatusChange = useCallback(
    (updatedBooking: Booking) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );
      setSelectedBooking(updatedBooking);
    },
    [setBookings]
  );

  if (whLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="mt-6 h-48 w-full" />
      </div>
    );
  }

  if (!warehouse) return null;

  const selectedDockName = selectedBooking
    ? docks.find((d) => d.id === selectedBooking.dock_id)?.name
    : undefined;

  return (
    <>
      <DayView
        warehouse={warehouse}
        docks={docks}
        bookings={bookings}
        loading={docksLoading || bookingsLoading}
        error={error}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onRetry={refetch}
        onBookingClick={handleBookingClick}
        connectionLost={connectionLost}
      />
      <BookingDetail
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        dockName={selectedDockName}
      />
    </>
  );
}
