import type { BookingStatus, Booking } from "@/lib/types";

export function getStatusColor(status: BookingStatus) {
  const map: Record<BookingStatus, { bg: string; text: string; border: string }> = {
    confirmed: { bg: "bg-primary-light", text: "text-primary", border: "border-l-primary" },
    arrived: { bg: "bg-warning-light", text: "text-warning", border: "border-l-warning" },
    completed: { bg: "bg-success-light", text: "text-success", border: "border-l-success" },
    cancelled: { bg: "bg-bg", text: "text-text-secondary", border: "border-l-text-secondary" },
    no_show: { bg: "bg-error-light", text: "text-error", border: "border-l-error" },
  };
  return map[status];
}

export function getStatusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    confirmed: "Bestätigt",
    arrived: "Angekommen",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
    no_show: "Nicht erschienen",
  };
  return map[status];
}

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getBookingPosition(
  booking: Booking,
  openingTime: string,
  closingTime: string
): { left: string; width: string } {
  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);
  const totalMinutes = closingMinutes - openingMinutes;

  const start = new Date(booking.slot_start);
  const end = new Date(booking.slot_end);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();

  const left = ((startMinutes - openingMinutes) / totalMinutes) * 100;
  const width = ((endMinutes - startMinutes) / totalMinutes) * 100;

  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.max(1, width)}%`,
  };
}
