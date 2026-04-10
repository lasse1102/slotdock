import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // Verify warehouse ownership
  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!warehouse) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Lager nicht gefunden" },
      { status: 404 }
    );
  }

  const { data: docks, error } = await supabase
    .from("docks")
    .select("*")
    .eq("warehouse_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "FETCH_FAILED", message: error.message },
      { status: 500 }
    );
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
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // Verify warehouse ownership
  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!warehouse) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Lager nicht gefunden" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = createDockSchema.safeParse(body);

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

  const { data: dock, error } = await supabase
    .from("docks")
    .insert({ ...parsed.data, warehouse_id: id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "DUPLICATE_NAME",
          message: "Eine Rampe mit diesem Namen existiert bereits in diesem Lager",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "CREATE_FAILED", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ dock }, { status: 201 });
}
