import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/rate-limit";
import { addMinutes, addDays, isBefore, startOfDay, parseISO, getHours, getMinutes, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";
import { sendEmail } from "@/lib/email/send";
import { BookingConfirmationEmail } from "@/lib/email/templates/booking-confirmation";
import { NewBookingNotificationEmail } from "@/lib/email/templates/new-booking-notification";
import type { Warehouse, Dock, DockSchedule, Booking, Profile } from "@/lib/types";

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

  // Use warehouse timezone for business rule checks
  const tz = wh.timezone ?? "Europe/Berlin";

  // 5. Validate slot_start is not in the past
  const now = new Date();
  if (isBefore(slotStart, now)) {
    return NextResponse.json(
      { error: "SLOT_IN_PAST", message: "Der gewählte Zeitpunkt liegt in der Vergangenheit" },
      { status: 400 }
    );
  }

  // 6. Validate not beyond max_advance_booking_days (in warehouse timezone)
  const nowInTz = toZonedTime(now, tz);
  const today = startOfDay(nowInTz);
  const slotStartInTz = toZonedTime(slotStart, tz);
  const maxDate = addDays(today, wh.max_advance_booking_days + 1);
  if (!isBefore(slotStartInTz, maxDate)) {
    return NextResponse.json(
      {
        error: "DATE_TOO_FAR",
        message: `Buchungen sind maximal ${wh.max_advance_booking_days} Tage im Voraus möglich`,
      },
      { status: 400 }
    );
  }

  // 7. Validate slot falls within effective opening hours (in warehouse timezone)
  const slotEndInTz = toZonedTime(slotEnd, tz);
  const slotTimeMinutes = getHours(slotStartInTz) * 60 + getMinutes(slotStartInTz);

  const [openH, openM] = effectiveOpeningTime.split(":").map(Number);
  const [closeH, closeM] = effectiveClosingTime.split(":").map(Number);
  const openingMinutes = openH * 60 + openM;
  const closingMinutes = closeH * 60 + closeM;

  const slotEndTimeMinutes = getHours(slotEndInTz) * 60 + getMinutes(slotEndInTz);

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

  // Fire-and-forget: send emails without blocking the booking response
  sendBookingEmails(newBooking, wh, activeDock, supabase);

  return NextResponse.json(
    {
      booking: formatPublicBooking(newBooking),
      confirmation_code: confirmationCode,
    },
    { status: 201 }
  );
}

/**
 * Send booking confirmation to carrier (if email provided)
 * and new-booking notification to warehouse owner (if enabled).
 * Runs async, never blocks the booking response.
 */
async function sendBookingEmails(
  booking: Booking,
  warehouse: Warehouse,
  dock: Dock,
  supabase: ReturnType<typeof createServiceClient>
) {
  const tz = warehouse.timezone ?? "Europe/Berlin";
  const slotStart = toZonedTime(parseISO(booking.slot_start), tz);
  const slotEnd = toZonedTime(parseISO(booking.slot_end), tz);
  const dateStr = format(slotStart, "EEEE, d. MMMM yyyy", { locale: de });
  const timeStr = `${format(slotStart, "HH:mm")} – ${format(slotEnd, "HH:mm")} Uhr`;

  // 1. Booking confirmation to carrier
  if (booking.carrier_email) {
    sendEmail({
      to: booking.carrier_email,
      subject: `Buchungsbestätigung – ${warehouse.name} am ${format(slotStart, "dd.MM.yyyy")}`,
      react: BookingConfirmationEmail({
        warehouseName: warehouse.name,
        dockName: dock.name,
        date: dateStr,
        time: timeStr,
        confirmationCode: booking.confirmation_code ?? "",
        carrierCompany: booking.carrier_company,
        contactName: booking.carrier_contact_name,
        licensePlate: booking.license_plate,
        referenceNumber: booking.reference_number,
      }),
    }).catch((err) => console.error("Failed to send carrier confirmation email:", err));
  }

  // 2. New-booking notification to warehouse owner
  try {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("email, notify_new_bookings")
      .eq("id", warehouse.owner_id)
      .single();

    const profile = ownerProfile as (Pick<Profile, "email"> & { notify_new_bookings?: boolean }) | null;

    if (profile?.email && profile.notify_new_bookings !== false) {
      sendEmail({
        to: profile.email,
        subject: `Neue Buchung – ${booking.carrier_company} am ${format(slotStart, "dd.MM.yyyy")}`,
        react: NewBookingNotificationEmail({
          warehouseName: warehouse.name,
          dockName: dock.name,
          date: dateStr,
          time: timeStr,
          carrierCompany: booking.carrier_company,
          referenceNumber: booking.reference_number,
        }),
      }).catch((err) => console.error("Failed to send dispatcher notification email:", err));
    }
  } catch (err) {
    console.error("Failed to fetch owner profile for notification:", err);
  }
}
