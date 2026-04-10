import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/rate-limit";
import { addMinutes, addDays, isBefore, startOfDay, parseISO, getHours, getMinutes } from "date-fns";
import type { Warehouse, Dock, DockSchedule, Booking } from "@/lib/types";

const bookingSchema = z.object({
  dock_id: z.string().uuid("dock_id muss eine gültige UUID sein"),
  slot_start: z.string().datetime({ message: "slot_start muss ein gültiges ISO-8601-Datum sein" }),
  carrier_company: z.string().trim().min(1, "Firmenname ist erforderlich").max(255),
  carrier_contact_name: z.string().max(255).optional(),
  carrier_email: z.string().email("Ungültige E-Mail-Adresse").max(255).optional(),
  carrier_phone: z.string().max(50).optional(),
  license_plate: z.string().max(50).optional(),
  reference_number: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

/** Generate an 8-character uppercase alphanumeric confirmation code */
function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(bytes[i] % chars.length);
  }
  return code;
}

/** Strip the public booking response to only carrier-relevant fields */
function formatPublicBooking(booking: Booking) {
  return {
    id: booking.id,
    dock_id: booking.dock_id,
    slot_start: booking.slot_start,
    slot_end: booking.slot_end,
    status: booking.status,
    carrier_company: booking.carrier_company,
    carrier_contact_name: booking.carrier_contact_name,
    carrier_email: booking.carrier_email,
    carrier_phone: booking.carrier_phone,
    license_plate: booking.license_plate,
    reference_number: booking.reference_number,
    notes: booking.notes,
    confirmation_code: booking.confirmation_code,
    created_at: booking.created_at,
  };
}

/**
 * POST /api/public/book/[token]
 *
 * Public endpoint — no auth required, token-based access.
 * Creates a booking with race condition protection via PostgreSQL function.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Rate limit: 20 booking attempts per minute per IP
  const rateLimited = rateLimit(request, { limit: 20, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const { token } = await params;
  const supabase = createServiceClient();

  // 1. Validate token against warehouses.booking_token
  const { data: warehouse, error: warehouseError } = await supabase
    .from("warehouses")
    .select("*")
    .eq("booking_token", token)
    .single();

  if (warehouseError || !warehouse) {
    return NextResponse.json(
      { error: "INVALID_TOKEN", message: "Ungültiger Buchungslink" },
      { status: 404 }
    );
  }

  const wh = warehouse as Warehouse;

  // 2. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Ungültiger Request-Body" },
      { status: 400 }
    );
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Ungültige Eingabedaten",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { dock_id, slot_start: slotStartStr, ...carrierData } = parsed.data;

  // 3. Verify dock belongs to warehouse and is active
  const { data: dock, error: dockError } = await supabase
    .from("docks")
    .select("*")
    .eq("id", dock_id)
    .eq("warehouse_id", wh.id)
    .eq("is_active", true)
    .single();

  if (dockError || !dock) {
    return NextResponse.json(
      { error: "INVALID_DOCK", message: "Die gewählte Rampe ist ungültig oder nicht verfügbar" },
      { status: 400 }
    );
  }

  const activeDock = dock as Dock;

  // 4. Fetch dock_schedules override for the requested day
  const slotStart = parseISO(slotStartStr);
  const dayOfWeek = slotStart.getDay(); // 0 = Sunday

  const { data: scheduleRows } = await supabase
    .from("dock_schedules")
    .select("*")
    .eq("dock_id", dock_id)
    .eq("day_of_week", dayOfWeek)
    .limit(1);

  const schedule = (scheduleRows?.[0] as DockSchedule | undefined) ?? null;

  // Check if dock is closed on this day
  if (schedule?.is_closed) {
    return NextResponse.json(
      { error: "DOCK_CLOSED", message: "Die Rampe ist an diesem Tag geschlossen" },
      { status: 400 }
    );
  }

  // Use dock schedule overrides or warehouse defaults
  const effectiveOpeningTime = schedule?.opening_time ?? wh.opening_time;
  const effectiveClosingTime = schedule?.closing_time ?? wh.closing_time;
  const effectiveSlotDuration = schedule?.slot_duration_minutes ?? wh.default_slot_duration_minutes;

  // Calculate slot_end using effective duration
  const slotEnd = addMinutes(slotStart, effectiveSlotDuration);

  // 5. Validate slot_start is not in the past
  const now = new Date();
  if (isBefore(slotStart, now)) {
    return NextResponse.json(
      { error: "SLOT_IN_PAST", message: "Der gewählte Zeitpunkt liegt in der Vergangenheit" },
      { status: 400 }
    );
  }

  // 6. Validate not beyond max_advance_booking_days
  const today = startOfDay(now);
  const maxDate = addDays(today, wh.max_advance_booking_days + 1);
  if (!isBefore(slotStart, maxDate)) {
    return NextResponse.json(
      {
        error: "DATE_TOO_FAR",
        message: `Buchungen sind maximal ${wh.max_advance_booking_days} Tage im Voraus möglich`,
      },
      { status: 400 }
    );
  }

  // 7. Validate slot falls within effective opening hours
  const slotHour = getHours(slotStart);
  const slotMinute = getMinutes(slotStart);
  const slotTimeMinutes = slotHour * 60 + slotMinute;

  const [openH, openM] = effectiveOpeningTime.split(":").map(Number);
  const [closeH, closeM] = effectiveClosingTime.split(":").map(Number);
  const openingMinutes = openH * 60 + openM;
  const closingMinutes = closeH * 60 + closeM;

  const slotEndHour = getHours(slotEnd);
  const slotEndMinute = getMinutes(slotEnd);
  const slotEndTimeMinutes = slotEndHour * 60 + slotEndMinute;

  if (slotTimeMinutes < openingMinutes || slotEndTimeMinutes > closingMinutes) {
    return NextResponse.json(
      {
        error: "OUTSIDE_HOURS",
        message: `Buchungen sind nur zwischen ${effectiveOpeningTime} und ${effectiveClosingTime} möglich`,
      },
      { status: 400 }
    );
  }

  // 8. Create booking atomically with race condition protection
  const confirmationCode = generateConfirmationCode();

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "create_booking_if_available",
    {
      p_warehouse_id: wh.id,
      p_dock_id: dock_id,
      p_slot_start: slotStart.toISOString(),
      p_slot_end: slotEnd.toISOString(),
      p_carrier_company: carrierData.carrier_company,
      p_carrier_contact_name: carrierData.carrier_contact_name ?? null,
      p_carrier_email: carrierData.carrier_email ?? null,
      p_carrier_phone: carrierData.carrier_phone ?? null,
      p_license_plate: carrierData.license_plate ?? null,
      p_reference_number: carrierData.reference_number ?? null,
      p_notes: carrierData.notes ?? null,
      p_confirmation_code: confirmationCode,
    }
  );

  if (rpcError) {
    console.error("Booking RPC error:", rpcError);
    return NextResponse.json(
      { error: "BOOKING_FAILED", message: "Fehler beim Erstellen der Buchung" },
      { status: 500 }
    );
  }

  // RPC returns an array; empty means slot was not available
  const bookingRows = rpcResult as Booking[];
  if (!bookingRows || bookingRows.length === 0) {
    return NextResponse.json(
      {
        error: "SLOT_UNAVAILABLE",
        message: "Das gewählte Zeitfenster ist nicht mehr verfügbar.",
      },
      { status: 409 }
    );
  }

  const newBooking = bookingRows[0];

  return NextResponse.json(
    {
      booking: formatPublicBooking(newBooking),
      confirmation_code: confirmationCode,
    },
    { status: 201 }
  );
}
