import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { data: warehouses, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "FETCH_FAILED", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ warehouses });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWarehouseSchema.safeParse(body);

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

  const { data: warehouse, error } = await supabase
    .from("warehouses")
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "CREATE_FAILED", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ warehouse }, { status: 201 });
}
