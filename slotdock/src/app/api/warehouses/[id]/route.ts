import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiError, unauthorized, parseJsonBody } from "@/lib/api-errors";

const updateWarehouseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address_street: z.string().max(255).optional(),
  address_city: z.string().max(255).optional(),
  address_zip: z.string().max(20).optional(),
  address_country: z.string().max(100).optional(),
  opening_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format: HH:MM")
    .optional(),
  closing_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format: HH:MM")
    .optional(),
  default_slot_duration_minutes: z.coerce.number().int().min(15).max(240).optional(),
  max_advance_booking_days: z.coerce.number().int().min(1).max(90).optional(),
});

export async function GET(
  _request: NextRequest,
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

  const { data: warehouse, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !warehouse) {
    return apiError("NOT_FOUND", "Lager nicht gefunden", 404);
  }

  return NextResponse.json({ warehouse });
}

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

  const [body, parseError] = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = updateWarehouseSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Ungültige Eingabedaten", 400, {
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { data: warehouse, error } = await supabase
    .from("warehouses")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error || !warehouse) {
    return apiError(
      "UPDATE_FAILED",
      "Lager nicht gefunden oder Fehler beim Aktualisieren",
      404
    );
  }

  return NextResponse.json({ warehouse });
}
