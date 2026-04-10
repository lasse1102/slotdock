"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatSlotTime } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { BookingConfirmation as BookingConfirmationType } from "./booking-form";

interface BookingConfirmationProps {
  booking: BookingConfirmationType;
  warehouseName: string;
  dockName: string;
  onNewBooking?: () => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text">{value}</span>
    </div>
  );
}

export function BookingConfirmation({
  booking,
  warehouseName,
  dockName,
  onNewBooking,
}: BookingConfirmationProps) {
  return (
    <Card className="w-full max-w-lg mx-auto text-center">
      {/* Success icon and heading */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-text">
          Buchung bestätigt!
        </h2>
      </div>

      {/* Confirmation code */}
      {booking.confirmation_code && (
        <div className="mb-6 rounded-[8px] bg-bg border border-border px-6 py-4">
          <p className="text-xs text-text-secondary mb-1">
            Bestätigungscode
          </p>
          <p className="text-2xl font-bold font-mono tracking-widest text-text">
            {booking.confirmation_code}
          </p>
        </div>
      )}

      {/* Booking details */}
      <div className="text-left mb-6">
        <DetailRow label="Lager" value={warehouseName} />
        <DetailRow label="Rampe" value={dockName} />
        <DetailRow label="Datum" value={formatDate(booking.slot_start)} />
        <DetailRow
          label="Uhrzeit"
          value={formatSlotTime(booking.slot_start, booking.slot_end)}
        />
        <DetailRow label="Firma" value={booking.carrier_company} />
        <DetailRow label="Kontakt" value={booking.carrier_contact_name} />
        <DetailRow label="Kennzeichen" value={booking.license_plate} />
        <DetailRow label="Referenz" value={booking.reference_number} />
      </div>

      {/* New booking button */}
      {onNewBooking && (
        <Button
          variant="secondary"
          onClick={onNewBooking}
          className="w-full"
        >
          Neue Buchung
        </Button>
      )}
    </Card>
  );
}
