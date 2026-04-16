import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiError, unauthorized, parseJsonBody } from "@/lib/api-errors";

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
    return unauthorized();
  }

  // Fetch booking and verify ownership via warehouse
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, warehouse_id")
    .eq("id", id)
    .single();

  if (!booking) {
    return apiError("NOT_FOUND", "Buchung nicht gefunden", 404);
  }

  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", booking.warehouse_id)
    .eq("owner_id", user.id)
    .single();

  if (!warehouse) {
    return apiError("FORBIDDEN", "Keine Berechtigung", 403);
  }

  const [body, parseError] = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = statusUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Ungültige Eingabedaten", 400, {
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { status: newStatus, cancellation_reason } = parsed.data;

  // Validate status transition
  const allowedTransitions = VALID_TRANSITIONS[booking.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return apiError(
      "INVALID_TRANSITION",
      `Statuswechsel von "${booking.status}" zu "${newStatus}" ist nicht erlaubt`,
      400
    );
  }

  // Cancellation requires a reason
  if (newStatus === "cancelled" && !cancellation_reason) {
    return apiError("VALIDATION_ERROR", "Stornierungsgrund ist erforderlich", 400);
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
    return apiError("UPDATE_FAILED", error.message, 500);
  }

  return NextResponse.json({ booking: updatedBooking });
}
