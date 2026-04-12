"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatSlotTime, formatDate } from "@/lib/utils";
import { getStatusLabel } from "@/lib/booking-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { X } from "lucide-react";
import type { Booking } from "@/lib/types";

interface BookingDetailProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (booking: Booking) => void;
  dockName?: string;
}

interface DetailRowProps {
  label: string;
  value: string | null | undefined;
}

function DetailRow({ label, value }: DetailRowProps) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-sm text-text">{value}</dd>
    </div>
  );
}

function BookingDetail({
  booking,
  open,
  onClose,
  onStatusChange,
  dockName,
}: BookingDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (cancelModalOpen) {
          setCancelModalOpen(false);
        } else {
          onClose();
        }
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose, cancelModalOpen]);

  if (!open || !booking) return null;

  const updateStatus = async (
    newStatus: string,
    reason?: string
  ) => {
    setLoading(true);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (reason) body.cancellation_reason = reason;

      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.message || "Fehler beim Statuswechsel", "error");
        return;
      }

      const { booking: updated } = await res.json();
      onStatusChange(updated);
      toast(`Status geändert: ${getStatusLabel(updated.status)}`, "success");
      setCancelModalOpen(false);
      setCancellationReason("");
    } catch {
      toast("Netzwerkfehler", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!cancellationReason.trim()) return;
    updateStatus("cancelled", cancellationReason.trim());
  };

  const showActions =
    booking.status === "confirmed" || booking.status === "arrived";

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      />

      {/* Slide-over panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-surface shadow-lg animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Buchungsdetails"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-text">
                {booking.carrier_company}
              </h2>
              <Badge variant={booking.status}>
                {getStatusLabel(booking.status)}
              </Badge>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-text-secondary hover:bg-bg hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow
                label="Datum"
                value={formatDate(booking.slot_start)}
              />
              <DetailRow
                label="Zeitfenster"
                value={formatSlotTime(booking.slot_start, booking.slot_end)}
              />
              <DetailRow label="Rampe" value={dockName} />
              <DetailRow
                label="Bestätigungscode"
                value={booking.confirmation_code}
              />
              <DetailRow
                label="Kontaktperson"
                value={booking.carrier_contact_name}
              />
              <DetailRow label="E-Mail" value={booking.carrier_email} />
              <DetailRow label="Telefon" value={booking.carrier_phone} />
              <DetailRow label="Kennzeichen" value={booking.license_plate} />
              <DetailRow
                label="Referenznummer"
                value={booking.reference_number}
              />
            </dl>

            {booking.notes && (
              <div className="mt-6">
                <dt className="text-xs text-text-secondary">Notizen</dt>
                <dd className="mt-1 whitespace-pre-wrap rounded-md bg-bg p-3 text-sm text-text">
                  {booking.notes}
                </dd>
              </div>
            )}

            {booking.status === "cancelled" && (
              <div className="mt-6 rounded-md border border-error-light bg-error-light p-3">
                <p className="text-xs font-medium text-error">
                  Stornierungsgrund
                </p>
                <p className="mt-1 text-sm text-text">
                  {booking.cancellation_reason || "–"}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="border-t border-border px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {booking.status === "confirmed" && (
                  <>
                    <Button
                      onClick={() => updateStatus("arrived")}
                      loading={loading}
                    >
                      Angekommen
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => updateStatus("no_show")}
                      loading={loading}
                    >
                      Nicht erschienen
                    </Button>
                  </>
                )}
                {booking.status === "arrived" && (
                  <Button
                    onClick={() => updateStatus("completed")}
                    loading={loading}
                  >
                    Abgefertigt
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setCancelModalOpen(true)}
                  disabled={loading}
                >
                  Stornieren
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel reason modal */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Buchung stornieren"
      >
        <p className="mb-3 text-sm text-text-secondary">
          Bitte geben Sie einen Grund für die Stornierung an.
        </p>
        <textarea
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Stornierungsgrund..."
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setCancelModalOpen(false)}
          >
            Abbrechen
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            loading={loading}
            disabled={!cancellationReason.trim()}
          >
            Stornieren
          </Button>
        </div>
      </Modal>
    </>
  );
}

export { BookingDetail };
