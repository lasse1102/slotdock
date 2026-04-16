import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiError, unauthorized, parseJsonBody } from "@/lib/api-errors";

const createWarehouseSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(255),
  address_street: z.string().max(255).optional(),
  address_city: z.string().max(255).optional(),
  address_zip: z.string().max(20).optional(),
  opening_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format: HH:MM")
    .default("07:00"),
  closing_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format: HH:MM")
    .default("17:00"),
  default_slot_duration_minutes: z.coerce.number().int().min(15).max(240).default(45),
  max_advance_booking_days: z.coerce.number().int().min(1).max(90).default(14),
});

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  const { data: warehouses, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return apiError("FETCH_FAILED", error.message, 500);
  }

  return NextResponse.json({ warehouses });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  const [body, parseError] = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = createWarehouseSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Ungültige Eingabedaten", 400, {
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { data: warehouse, error } = await supabase
    .from("warehouses")
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single();

  if (error) {
    return apiError("CREATE_FAILED", error.message, 500);
  }

  return NextResponse.json({ warehouse }, { status: 201 });
}
