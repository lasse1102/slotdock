"use client";

import { useMemo } from "react";
import type { Warehouse, Dock, Booking } from "@/lib/types";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DockTimeline } from "./dock-timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { CalendarDays, Copy, RefreshCw } from "lucide-react";

interface DayViewProps {
  warehouse: Warehouse;
  docks: Dock[];
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRetry: () => void;
  onBookingClick: (booking: Booking) => void;
  connectionLost?: boolean;
}

interface StatItem {
  label: string;
  count: number;
  colorClass: string;
}

function DayView({
  warehouse,
  docks,
  bookings,
  loading,
  error,
  selectedDate,
  onDateChange,
  onRetry,
  onBookingClick,
  connectionLost,
}: DayViewProps) {
  const activeDocks = useMemo(
    () =>
      docks
        .filter((d) => d.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [docks]
  );

  const stats = useMemo<StatItem[]>(() => {
    const countByStatus = (status: BookingStatus) =>
      bookings.filter((b) => b.status === status).length;

    return [
      { label: "Gesamt", count: bookings.length, colorClass: "text-text" },
      { label: "Bestätigt", count: countByStatus("confirmed"), colorClass: "text-primary" },
      { label: "Angekommen", count: countByStatus("arrived"), colorClass: "text-warning" },
      { label: "Abgeschlossen", count: countByStatus("completed"), colorClass: "text-success" },
    ];
  }, [bookings]);

  const bookingsByDock = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const dock of activeDocks) {
      map.set(dock.id, []);
    }
    for (const booking of bookings) {
      const existing = map.get(booking.dock_id);
      if (existing) {
        existing.push(booking);
      }
    }
    return map;
  }, [bookings, activeDocks]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/book/${warehouse.booking_token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link kopiert!", "success");
    } catch {
      toast("Link konnte nicht kopiert werden", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection lost banner */}
      {connectionLost && (
        <div className="flex items-center justify-between rounded-md border border-warning bg-warning-light px-4 py-2">
          <span className="text-sm text-warning">
            Echtzeit-Verbindung unterbrochen.
          </span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Neu laden
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Tagesübersicht</h1>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-text-secondary" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div className="flex flex-wrap gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2"
            >
              <span className={cn("text-xl font-bold", stat.colorClass)}>
                {stat.count}
              </span>
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-12 w-28" />
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-text-secondary">
            Dashboard konnte nicht geladen werden.
          </p>
          <Button variant="secondary" onClick={onRetry}>
            Erneut versuchen
          </Button>
        </div>
      )}

      {/* Dock timelines */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-8 pb-6">
          {activeDocks.map((dock) => (
            <DockTimeline
              key={dock.id}
              dock={dock}
              bookings={bookingsByDock.get(dock.id) || []}
              openingTime={warehouse.opening_time}
              closingTime={warehouse.closing_time}
              onBookingClick={onBookingClick}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16">
          <CalendarDays className="h-12 w-12 text-text-secondary" />
          <p className="text-text-secondary">
            Heute keine Buchungen. Buchungslink an Spediteure senden?
          </p>
          <Button variant="secondary" onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Buchungslink kopieren
          </Button>
        </div>
      )}
    </div>
  );
}

export { DayView };
