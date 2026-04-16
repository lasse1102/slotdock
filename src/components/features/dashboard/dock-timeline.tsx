"use client";

import type { Dock, Booking } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatSlotTime } from "@/lib/utils";
import { getStatusColor, getBookingPosition, timeToMinutes } from "@/lib/booking-utils";
import { Badge } from "@/components/ui/badge";

interface DockTimelineProps {
  dock: Dock;
  bookings: Booking[];
  openingTime: string;
  closingTime: string;
  timezone: string;
  onBookingClick: (booking: Booking) => void;
}

function generateHourMarkers(openingTime: string, closingTime: string) {
  const startMinutes = timeToMinutes(openingTime);
  const endMinutes = timeToMinutes(closingTime);
  const totalMinutes = endMinutes - startMinutes;
  const markers: { label: string; left: string }[] = [];

  // Start from the next full hour after opening
  const firstHour = Math.ceil(startMinutes / 60);
  const lastHour = Math.floor(endMinutes / 60);

  for (let h = firstHour; h <= lastHour; h++) {
    const minuteOffset = h * 60 - startMinutes;
    const left = (minuteOffset / totalMinutes) * 100;
    markers.push({
      label: `${String(h).padStart(2, "0")}:00`,
      left: `${left}%`,
    });
  }

  return markers;
}

function groupOverlappingBookings(bookings: Booking[]): Booking[][] {
  if (bookings.length === 0) return [];

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
  );

  const lanes: Booking[][] = [];

  for (const booking of sorted) {
    const bookingStart = new Date(booking.slot_start).getTime();
    let placed = false;

    for (const lane of lanes) {
      const lastInLane = lane[lane.length - 1];
      if (new Date(lastInLane.slot_end).getTime() <= bookingStart) {
        lane.push(booking);
        placed = true;
        break;
      }
    }

    if (!placed) {
      lanes.push([booking]);
    }
  }

  return lanes;
}

function DockTimeline({
  dock,
  bookings,
  openingTime,
  closingTime,
  timezone,
  onBookingClick,
}: DockTimelineProps) {
  const hourMarkers = generateHourMarkers(openingTime, closingTime);
  const lanes = groupOverlappingBookings(bookings);
  const laneCount = Math.max(1, lanes.length);
  const laneHeight = 48;

  return (
    <div className="flex items-start gap-4">
      {/* Dock label */}
      <div className="flex w-28 shrink-0 flex-col gap-1 pt-2">
        <span className="text-sm font-medium text-text">{dock.name}</span>
        <Badge variant="confirmed" className="w-fit text-[10px]">
          {dock.dock_type === "inbound"
            ? "Eingang"
            : dock.dock_type === "outbound"
              ? "Ausgang"
              : "Allgemein"}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative min-h-[56px] flex-1 rounded-md border border-border bg-bg">
        {/* Hour markers */}
        {hourMarkers.map((marker) => (
          <div
            key={marker.label}
            className="absolute top-0 bottom-0"
            style={{ left: marker.left }}
          >
            <div className="h-full w-px bg-border" />
            <span className="absolute -bottom-5 -translate-x-1/2 text-[10px] text-text-secondary">
              {marker.label}
            </span>
          </div>
        ))}

        {/* Booking cards */}
        <div
          className="relative"
          style={{ height: `${laneCount * laneHeight}px` }}
        >
          {lanes.map((lane, laneIndex) =>
            lane.map((booking) => {
              const { left, width } = getBookingPosition(
                booking,
                openingTime,
                closingTime,
                timezone
              );
              const colors = getStatusColor(booking.status);
              const isCancelled = booking.status === "cancelled";

              return (
                <button
                  key={booking.id}
                  type="button"
                  className={cn(
                    "absolute cursor-pointer overflow-hidden rounded border-l-2 px-2 py-1 text-left transition-shadow hover:shadow-md",
                    colors.bg,
                    colors.border,
                    isCancelled && "line-through opacity-60"
                  )}
                  style={{
                    left,
                    width,
                    top: `${laneIndex * laneHeight + 4}px`,
                    height: `${laneHeight - 8}px`,
                  }}
                  onClick={() => onBookingClick(booking)}
                  title={`${booking.carrier_company} – ${formatSlotTime(booking.slot_start, booking.slot_end)}`}
                >
                  <div className="truncate text-xs font-medium">
                    {booking.carrier_company}
                  </div>
                  <div className={cn("truncate text-[10px]", colors.text)}>
                    {formatSlotTime(booking.slot_start, booking.slot_end)}
                    {booking.reference_number && ` · ${booking.reference_number}`}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Empty state for this dock */}
        {bookings.length === 0 && (
          <div className="flex h-full min-h-[48px] items-center justify-center">
            <span className="text-xs text-text-secondary">Keine Buchungen</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { DockTimeline };
