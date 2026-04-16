import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiError, unauthorized, parseJsonBody } from "@/lib/api-errors";

const updateDockSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  dock_type: z.enum(["general", "inbound", "outbound"]).optional(),
  max_concurrent: z.coerce.number().int().min(1).max(5).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.coerce.number().int().optional(),
});

async function verifyDockOwnership(supabase: Awaited<ReturnType<typeof createClient>>, dockId: string, userId: string) {
  const { data: dock } = await supabase
    .from("docks")
    .select("id, warehouse_id, warehouses!inner(owner_id)")
    .eq("id", dockId)
    .single();

  if (!dock) return null;

  const warehouse = dock.warehouses as unknown as { owner_id: string };
  if (warehouse.owner_id !== userId) return null;

  return dock;
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

  const dock = await verifyDockOwnership(supabase, id, user.id);
  if (!dock) {
    return apiError("NOT_FOUND", "Rampe nicht gefunden", 404);
  }

  const [body, parseError] = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = updateDockSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Ungültige Eingabedaten", 400, {
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { data: updatedDock, error } = await supabase
    .from("docks")
    .update(parsed.data)
    .eq("id", id)
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
    return apiError("UPDATE_FAILED", error.message, 500);
  }

  return NextResponse.json({ dock: updatedDock });
}

export async function DELETE(
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

  const dock = await verifyDockOwnership(supabase, id, user.id);
  if (!dock) {
    return apiError("NOT_FOUND", "Rampe nicht gefunden", 404);
  }

  // Check for active bookings
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("dock_id", id)
    .neq("status", "cancelled");

  if (count && count > 0) {
    return apiError(
      "DOCK_HAS_BOOKINGS",
      "Rampe hat aktive Buchungen und kann nicht gelöscht werden",
      409
    );
  }

  const { error } = await supabase.from("docks").delete().eq("id", id);

  if (error) {
    return apiError("DELETE_FAILED", error.message, 500);
  }

  return NextResponse.json({ success: true });
}
