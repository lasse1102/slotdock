import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const VALID_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["arrived", "cancelled", "no_show"],
  arrived: ["completed", "cancelled"],
};

const statusUpdateSchema = z.object({
  status: z.enum(["arrived", "completed", "cancelled", "no_show"]),
  cancellation_reason: z.string().min(1).max(2000).optional(),
});

export async function PATCH(
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

  // Fetch booking and verify ownership via warehouse
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, warehouse_id")
    .eq("id", id)
    .single();

  if (!booking) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Buchung nicht gefunden" },
      { status: 404 }
    );
  }

  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", booking.warehouse_id)
    .eq("owner_id", user.id)
    .single();

  if (!warehouse) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Keine Berechtigung" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Ungültiger Request-Body" },
      { status: 400 }
    );
  }

  const parsed = statusUpdateSchema.safeParse(body);

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

  const { status: newStatus, cancellation_reason } = parsed.data;

  // Validate status transition
  const allowedTransitions = VALID_TRANSITIONS[booking.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return NextResponse.json(
      {
        error: "INVALID_TRANSITION",
        message: `Statuswechsel von "${booking.status}" zu "${newStatus}" ist nicht erlaubt`,
      },
      { status: 400 }
    );
  }

  // Cancellation requires a reason
  if (newStatus === "cancelled" && !cancellation_reason) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Stornierungsgrund ist erforderlich",
      },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === "cancelled") {
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancellation_reason = cancellation_reason;
  }

  const { data: updatedBooking, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "UPDATE_FAILED", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ booking: updatedBooking });
}
