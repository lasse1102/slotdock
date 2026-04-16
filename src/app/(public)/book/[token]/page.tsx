"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { format, startOfDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicCalendar } from "@/components/features/booking/public-calendar";
import { SlotPicker } from "@/components/features/booking/slot-picker";
import {
  BookingForm,
  type BookingConfirmation as BookingConfirmationType,
} from "@/components/features/booking/booking-form";
import { BookingConfirmation } from "@/components/features/booking/booking-confirmation";
import { MapPin } from "lucide-react";
import { ToastContainer } from "@/components/ui/toast";

interface WarehouseInfo {
  name: string;
  address: string;
}

interface DockInfo {
  id: string;
  name: string;
}

interface SlotInfo {
  dock_id: string;
  start: string;
  end: string;
  available: boolean;
}

interface AvailabilityResponse {
  warehouse: WarehouseInfo;
  max_advance_booking_days: number;
  docks: DockInfo[];
  slots: SlotInfo[];
}

interface SelectedSlot {
  dock_id: string;
  start: string;
  end: string;
}

export default function PublicBookingPage() {
  const { token } = useParams<{ token: string }>();

  const [warehouse, setWarehouse] = useState<WarehouseInfo | null>(null);
  const [docks, setDocks] = useState<DockInfo[]>([]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);

  const formRef = useRef<HTMLDivElement>(null);

  const fetchAvailability = useCallback(
    async (date: Date) => {
      setLoading(true);
      setError(null);

      const dateStr = format(date, "yyyy-MM-dd");

      try {
        const res = await fetch(
          `/api/public/book/${token}/availability?date=${dateStr}`
        );

        if (res.status === 404) {
          setError("INVALID_TOKEN");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.message ?? "Ein Fehler ist aufgetreten.");
          setLoading(false);
          return;
        }

        const data: AvailabilityResponse = await res.json();
        setWarehouse(data.warehouse);
        setMaxAdvanceDays(data.max_advance_booking_days);
        setDocks(data.docks);
        setSlots(data.slots);
      } catch {
        setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch on mount and when date changes
  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, fetchAvailability]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: SelectedSlot) => {
    setSelectedSlot(slot);
    // Scroll to booking form on mobile
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBookingSuccess = (booking: BookingConfirmationType) => {
    setConfirmation(booking);
  };

  const handleSlotUnavailable = () => {
    // Keep selectedSlot so the form stays mounted and preserves user input.
    // Refresh availability so the slot grid updates.
    fetchAvailability(selectedDate);
  };

  const handleNewBooking = () => {
    setConfirmation(null);
    setSelectedSlot(null);
    fetchAvailability(selectedDate);
  };

  // Get dock name for the selected slot
  const selectedDockName =
    docks.find((d) => d.id === selectedSlot?.dock_id)?.name ?? "";

  // Get dock name for confirmed booking
  const confirmedDockName =
    docks.find((d) => d.id === confirmation?.dock_id)?.name ?? "";

  // Invalid token error page
  if (error === "INVALID_TOKEN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <Card className="max-w-md text-center">
          <h1 className="mb-2 text-lg font-semibold text-text">
            Ungültiger Link
          </h1>
          <p className="text-sm text-text-secondary">
            Dieser Buchungslink ist ungültig.
          </p>
        </Card>
      </div>
    );
  }

  // Booking confirmation view
  if (confirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
        <BookingConfirmation
          booking={confirmation}
          warehouseName={warehouse?.name ?? ""}
          dockName={confirmedDockName}
          onNewBooking={handleNewBooking}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <ToastContainer />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* Warehouse header */}
        <div className="mb-6">
          {loading && !warehouse ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
          ) : warehouse ? (
            <>
              <h1 className="text-lg font-bold text-text sm:text-xl">
                {warehouse.name}
              </h1>
              {warehouse.address && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {warehouse.address}
                </p>
              )}
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left column: Calendar */}
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-text">
              Datum wählen
            </h2>
            <PublicCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              maxAdvanceDays={maxAdvanceDays}
            />
          </Card>

          {/* Right column: Slot picker + booking form */}
          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-text">
                Zeitfenster wählen
              </h2>

              {error && error !== "INVALID_TOKEN" ? (
                <p className="py-4 text-center text-sm text-error">{error}</p>
              ) : (
                <SlotPicker
                  docks={docks}
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  loading={loading}
                />
              )}
            </Card>

            {/* Booking form */}
            {selectedSlot && (
              <div ref={formRef}>
                <BookingForm
                  token={token}
                  selectedSlot={selectedSlot}
                  dockName={selectedDockName}
                  onSuccess={handleBookingSuccess}
                  onSlotUnavailable={handleSlotUnavailable}
                  onCancel={() => setSelectedSlot(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
