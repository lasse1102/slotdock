import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/rate-limit";
import { addDays, addMinutes, startOfDay, isBefore } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { Warehouse, Dock, DockSchedule, Booking } from "@/lib/types";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss im Format YYYY-MM-DD sein");

/**
 * GET /api/public/book/[token]/availability?date=YYYY-MM-DD
 *
 * Public endpoint — no auth required, token-based access.
 * Returns available time slots for a given date.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Rate limit: 60 requests per minute per IP
  const rateLimited = rateLimit(request, { limit: 60, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const { token } = await params;
  const supabase = createServiceClient();

  // Look up warehouse by booking token
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

  // Validate date query param
  const dateParam = request.nextUrl.searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json(
      { error: "MISSING_DATE", message: "Datum ist erforderlich (date=YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const dateParsed = dateSchema.safeParse(dateParam);
  if (!dateParsed.success) {
    return NextResponse.json(
      { error: "INVALID_DATE", message: "Datum muss im Format YYYY-MM-DD sein" },
      { status: 400 }
    );
  }

  const tz = wh.timezone ?? "Europe/Berlin";

  // Parse date in the warehouse's timezone
  const [year, month, day] = dateParam.split("-").map(Number);
  const requestedDate = fromZonedTime(new Date(year, month - 1, day), tz);
  const nowInTz = toZonedTime(new Date(), tz);
  const today = startOfDay(nowInTz);

  // Compare in warehouse timezone
  const requestedDateInTz = toZonedTime(requestedDate, tz);
  if (isBefore(startOfDay(requestedDateInTz), today)) {
    return NextResponse.json(
      { error: "DATE_IN_PAST", message: "Das Datum liegt in der Vergangenheit" },
      { status: 400 }
    );
  }

  const maxDate = addDays(today, wh.max_advance_booking_days);
  if (isBefore(maxDate, requestedDate)) {
    return NextResponse.json(
      {
        error: "DATE_TOO_FAR",
        message: `Buchungen sind maximal ${wh.max_advance_booking_days} Tage im Voraus möglich`,
      },
      { status: 400 }
    );
  }

  // Fetch active docks
  const { data: docks, error: docksError } = await supabase
    .from("docks")
    .select("*")
    .eq("warehouse_id", wh.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (docksError) {
    return NextResponse.json(
      { error: "FETCH_FAILED", message: "Fehler beim Laden der Rampen" },
      { status: 500 }
    );
  }

  const activeDocks = (docks ?? []) as Dock[];

  if (activeDocks.length === 0) {
    return NextResponse.json({
      warehouse: formatWarehouse(wh),
      max_advance_booking_days: wh.max_advance_booking_days,
      docks: [],
      slots: [],
    });
  }

  const dockIds = activeDocks.map((d) => d.id);
  const dayOfWeek = requestedDate.getDay(); // 0 = Sunday

  // Fetch dock schedules for this day of week
  const { data: schedules } = await supabase
    .from("dock_schedules")
    .select("*")
    .in("dock_id", dockIds)
    .eq("day_of_week", dayOfWeek);

  const scheduleMap = new Map<string, DockSchedule>();
  for (const s of (schedules ?? []) as DockSchedule[]) {
    scheduleMap.set(s.dock_id, s);
  }

  // Fetch non-cancelled bookings that overlap the requested date across all active docks
  // Use overlap detection: slot_start < day_end AND slot_end > day_start
  // Convert day boundaries to UTC using the warehouse timezone
  const dayStartUtc = fromZonedTime(new Date(year, month - 1, day, 0, 0, 0), tz).toISOString();
  const dayEndUtc = fromZonedTime(new Date(year, month - 1, day, 23, 59, 59, 999), tz).toISOString();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .in("dock_id", dockIds)
    .neq("status", "cancelled")
    .lt("slot_start", dayEndUtc)
    .gt("slot_end", dayStartUtc);

  const existingBookings = (bookings ?? []) as Booking[];

  // Generate slots for each dock — compare UTC timestamps
  const now = new Date();
  const slots: {
    dock_id: string;
    start: string;
    end: string;
    available: boolean;
  }[] = [];

  for (const dock of activeDocks) {
    const schedule = scheduleMap.get(dock.id);

    // If schedule override says closed, skip this dock
    if (schedule?.is_closed) {
      continue;
    }

    // Determine opening/closing times and slot duration
    const openingTime = schedule?.opening_time ?? wh.opening_time;
    const closingTime = schedule?.closing_time ?? wh.closing_time;
    const slotDuration =
      schedule?.slot_duration_minutes ?? wh.default_slot_duration_minutes;

    // Parse times into Date objects for the requested date in warehouse timezone
    const [openH, openM] = openingTime.split(":").map(Number);
    const [closeH, closeM] = closingTime.split(":").map(Number);

    // Build wall-clock times in warehouse timezone, then convert to UTC
    const openingLocal = new Date(year, month - 1, day, openH, openM, 0, 0);
    let slotStart = fromZonedTime(openingLocal, tz);

    const closingLocal = new Date(year, month - 1, day, closeH, closeM, 0, 0);
    const closingDate = fromZonedTime(closingLocal, tz);

    // Generate slots in increments
    while (true) {
      const slotEnd = addMinutes(slotStart, slotDuration);

      // Stop if slot end would exceed closing time
      if (isBefore(closingDate, slotEnd)) {
        break;
      }

      // Past slots are never available
      const isInPast = isBefore(slotStart, now);

      // Count overlapping non-cancelled bookings for this dock and time window
      const overlapCount = existingBookings.filter(
        (b) =>
          b.dock_id === dock.id &&
          new Date(b.slot_start) < slotEnd &&
          new Date(b.slot_end) > slotStart
      ).length;

      const available = !isInPast && overlapCount < dock.max_concurrent;

      slots.push({
        dock_id: dock.id,
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        available,
      });

      slotStart = slotEnd;
    }
  }

  return NextResponse.json({
    warehouse: formatWarehouse(wh),
    max_advance_booking_days: wh.max_advance_booking_days,
    docks: activeDocks.map((d) => ({ id: d.id, name: d.name })),
    slots,
  });
}

/** Format warehouse info for public response */
function formatWarehouse(wh: Warehouse) {
  // Format: "Musterstraße 1, 12345 Berlin"
  const street = wh.address_street ?? "";
  const zipCity = [wh.address_zip, wh.address_city].filter(Boolean).join(" ");
  const address = [street, zipCity].filter(Boolean).join(", ");

  return {
    name: wh.name,
    address,
  };
}
