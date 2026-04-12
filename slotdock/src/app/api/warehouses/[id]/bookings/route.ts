import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fromZonedTime } from "date-fns-tz";
import { addDays } from "date-fns";
import { BOOKING_STATUSES } from "@/lib/constants";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const dateRangeSchema = z.object({
  date_from: dateSchema,
  date_to: dateSchema,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // Verify warehouse ownership
  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id, timezone")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!warehouse) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Lager nicht gefunden" },
      { status: 404 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const dockId = searchParams.get("dock_id");
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("per_page") || "50", 10))
  );

  const tz = warehouse.timezone || "Europe/Berlin";

  let dayStartUtc: Date;
  let dayEndUtc: Date;

  if (date) {
    const parsed = dateSchema.safeParse(date);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Ungültiges Datumsformat (YYYY-MM-DD)" },
        { status: 400 }
      );
    }
    dayStartUtc = fromZonedTime(`${date}T00:00:00`, tz);
    dayEndUtc = fromZonedTime(
      `${addDays(new Date(`${date}T00:00:00`), 1).toISOString().slice(0, 10)}T00:00:00`,
      tz
    );
  } else if (dateFrom && dateTo) {
    const parsed = dateRangeSchema.safeParse({ date_from: dateFrom, date_to: dateTo });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Ungültiges Datumsformat (YYYY-MM-DD)" },
        { status: 400 }
      );
    }
    dayStartUtc = fromZonedTime(`${dateFrom}T00:00:00`, tz);
    dayEndUtc = fromZonedTime(
      `${addDays(new Date(`${dateTo}T00:00:00`), 1).toISOString().slice(0, 10)}T00:00:00`,
      tz
    );
  } else {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "date oder date_from/date_to ist erforderlich" },
      { status: 400 }
    );
  }

  if (status && !BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Ungültiger Status" },
      { status: 400 }
    );
  }

  let query = supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .eq("warehouse_id", id)
    .gte("slot_start", dayStartUtc.toISOString())
    .lt("slot_start", dayEndUtc.toISOString());

  if (dockId) {
    query = query.eq("dock_id", dockId);
  }
  if (status) {
    query = query.eq("status", status);
  }

  // For date range queries, sort descending; for single date, ascending
  const ascending = !!date;
  query = query.order("slot_start", { ascending });

  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data: bookings, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "FETCH_FAILED", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    bookings: bookings || [],
    total: count || 0,
    page,
    per_page: perPage,
  });
}
