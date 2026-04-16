import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiError, unauthorized, parseJsonBody } from "@/lib/api-errors";

const createDockSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
  dock_type: z.enum(["general", "inbound", "outbound"]).default("general"),
  max_concurrent: z.coerce.number().int().min(1).max(5).default(1),
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

  // Verify warehouse ownership
  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!warehouse) {
    return apiError("NOT_FOUND", "Lager nicht gefunden", 404);
  }

  const { data: docks, error } = await supabase
    .from("docks")
    .select("id, warehouse_id, name, dock_type, max_concurrent, is_active, sort_order, created_at, updated_at")
    .eq("warehouse_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    return apiError("FETCH_FAILED", error.message, 500);
  }

  return NextResponse.json({ docks });
}

export async function POST(
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

  // Verify warehouse ownership
  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!warehouse) {
    return apiError("NOT_FOUND", "Lager nicht gefunden", 404);
  }

  const [body, parseError] = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = createDockSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Ungültige Eingabedaten", 400, {
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { data: dock, error } = await supabase
    .from("docks")
    .insert({ ...parsed.data, warehouse_id: id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return apiError(
        "DUPLICATE_NAME",
        "Eine Rampe mit diesem Namen existiert bereits in diesem Lager",
        400
      );
    }
    return apiError("CREATE_FAILED", error.message, 500);
  }

  return NextResponse.json({ dock }, { status: 201 });
}
