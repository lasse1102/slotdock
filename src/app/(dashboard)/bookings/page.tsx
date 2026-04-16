"use client";

import { useState, useCallback, useMemo } from "react";
import { format, subDays } from "date-fns";
import { useWarehouse } from "@/hooks/use-warehouse";
import { useDocks } from "@/hooks/use-docks";
import { useBookingsList } from "@/hooks/use-bookings-list";
import { BookingDetail } from "@/components/features/dashboard/booking-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatSlotTime } from "@/lib/utils";
import { getStatusLabel } from "@/lib/booking-utils";
import { BOOKING_STATUSES } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Alle Status" },
  ...BOOKING_STATUSES.map((s) => ({ value: s, label: getStatusLabel(s) })),
];

export default function BookingsPage() {
  const { warehouse } = useWarehouse();
  const { docks } = useDocks(warehouse?.id ?? null);

  const [dateFrom, setDateFrom] = useState(() =>
    format(subDays(new Date(), 7), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [dockId, setDockId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 50;

  const { bookings, total, loading, error, refetch } = useBookingsList({
    warehouseId: warehouse?.id ?? null,
    dateFrom,
    dateTo,
    dockId: dockId || undefined,
    status: status || undefined,
    page,
    perPage,
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const dockMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of docks) {
      map.set(d.id, d.name);
    }
    return map;
  }, [docks]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleStatusChange = useCallback((updatedBooking: Booking) => {
    setSelectedBooking(updatedBooking);
    // Refetch list to reflect changes
    refetch();
  }, [refetch]);

  // Reset to page 1 when filters change
  const handleFilterChange = useCallback(
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    },
    []
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Buchungen</h1>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Von</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
            className="w-full min-w-[130px] rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Bis</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
            className="w-full min-w-[130px] rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">
            Rampe
          </label>
          <select
            value={dockId}
            onChange={(e) => handleFilterChange(setDockId)(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none sm:w-auto"
          >
            <option value="">Alle Rampen</option>
            {docks
              .filter((d) => d.is_active)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleFilterChange(setStatus)(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none sm:w-auto"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-text-secondary">{error}</p>
          <Button variant="secondary" onClick={refetch}>
            Erneut versuchen
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16">
              <Inbox className="h-12 w-12 text-text-secondary" />
              <p className="text-text-secondary">Keine Buchungen gefunden.</p>
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="block sm:hidden space-y-2">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Buchung ${booking.carrier_company}, ${formatDate(booking.slot_start)}`}
                    className="cursor-pointer rounded-lg border border-border bg-surface p-4 hover:bg-bg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                    onClick={() => setSelectedBooking(booking)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedBooking(booking);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-text">{booking.carrier_company}</p>
                        <p className="mt-0.5 text-sm text-text-secondary">
                          {formatDate(booking.slot_start)} · {formatSlotTime(booking.slot_start, booking.slot_end)}
                        </p>
                        <p className="mt-0.5 text-sm text-text-secondary">
                          {dockMap.get(booking.dock_id) || "–"}
                          {booking.reference_number && ` · ${booking.reference_number}`}
                        </p>
                      </div>
                      <Badge variant={booking.status as BookingStatus}>
                        {getStatusLabel(booking.status as BookingStatus)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-bg">
                    <tr>
                      <th className="px-4 py-3 font-medium text-text-secondary">
                        Datum
                      </th>
                      <th className="px-4 py-3 font-medium text-text-secondary">
                        Uhrzeit
                      </th>
                      <th className="px-4 py-3 font-medium text-text-secondary">
                        Rampe
                      </th>
                      <th className="px-4 py-3 font-medium text-text-secondary">
                        Firma
                      </th>
                      <th className="px-4 py-3 font-medium text-text-secondary">
                        Referenz
                      </th>
                      <th className="px-4 py-3 font-medium text-text-secondary">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="cursor-pointer border-b border-border last:border-b-0 hover:bg-bg focus:bg-bg focus:outline-none"
                        tabIndex={0}
                        role="button"
                        aria-label={`Buchung ${booking.carrier_company}, ${formatDate(booking.slot_start)}`}
                        onClick={() => setSelectedBooking(booking)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedBooking(booking);
                          }
                        }}
                      >
                        <td className="px-4 py-3 text-text">
                          {formatDate(booking.slot_start)}
                        </td>
                        <td className="px-4 py-3 text-text">
                          {formatSlotTime(booking.slot_start, booking.slot_end)}
                        </td>
                        <td className="px-4 py-3 text-text">
                          {dockMap.get(booking.dock_id) || "–"}
                        </td>
                        <td className="px-4 py-3 font-medium text-text">
                          {booking.carrier_company}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {booking.reference_number || "–"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={booking.status as BookingStatus}>
                            {getStatusLabel(booking.status as BookingStatus)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Seite {page} von {totalPages} ({total} Ergebnisse)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Zurück
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Weiter
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Booking detail slide-over */}
      <BookingDetail
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        dockName={
          selectedBooking
            ? dockMap.get(selectedBooking.dock_id)
            : undefined
        }
      />
    </div>
  );
}
