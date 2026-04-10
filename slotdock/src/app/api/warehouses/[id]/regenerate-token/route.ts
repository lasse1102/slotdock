import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

  const { data: warehouse, error } = await supabase
    .from("warehouses")
    .update({ booking_token: crypto.randomUUID() })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("booking_token")
    .single();

  if (error || !warehouse) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Lager nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ booking_token: warehouse.booking_token });
}
