import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fromZonedTime } from "date-fns-tz";
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

  // Helper: parse "YYYY-MM-DD" into [year, month, day] to avoid
  // timezone-dependent Date constructor pitfalls
  function parseDateParts(d: string): [number, number, number] {
    const [y, m, dd] = d.split("-").map(Number);
    return [y, m, dd];
  }

  if (date) {
    const parsed = dateSchema.safeParse(date);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Ungültiges Datumsformat (YYYY-MM-DD)" },
        { status: 400 }
      );
    }
    const [y, m, d] = parseDateParts(date);
    dayStartUtc = fromZonedTime(new Date(y, m - 1, d, 0, 0, 0), tz);
    dayEndUtc = fromZonedTime(new Date(y, m - 1, d + 1, 0, 0, 0), tz);
  } else if (dateFrom && dateTo) {
    const parsed = dateRangeSchema.safeParse({ date_from: dateFrom, date_to: dateTo });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Ungültiges Datumsformat (YYYY-MM-DD)" },
        { status: 400 }
      );
    }
    const [yf, mf, df] = parseDateParts(dateFrom);
    const [yt, mt, dt] = parseDateParts(dateTo);
    dayStartUtc = fromZonedTime(new Date(yf, mf - 1, df, 0, 0, 0), tz);
    dayEndUtc = fromZonedTime(new Date(yt, mt - 1, dt + 1, 0, 0, 0), tz);
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
