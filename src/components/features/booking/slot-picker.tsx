"use client";

import { cn, formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SlotPickerProps {
  docks: { id: string; name: string }[];
  slots: { dock_id: string; start: string; end: string; available: boolean }[];
  selectedSlot: { dock_id: string; start: string; end: string } | null;
  onSlotSelect: (slot: {
    dock_id: string;
    start: string;
    end: string;
  }) => void;
  loading: boolean;
}

export function SlotPicker({
  docks,
  slots,
  selectedSlot,
  onSlotSelect,
  loading,
}: SlotPickerProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (docks.length === 0 || slots.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-secondary">
        Keine Zeitfenster verfügbar für diesen Tag.
      </p>
    );
  }

  // Group slots by dock
  const slotsByDock = new Map<
    string,
    { dock_id: string; start: string; end: string; available: boolean }[]
  >();

  for (const dock of docks) {
    slotsByDock.set(dock.id, []);
  }

  for (const slot of slots) {
    const dockSlots = slotsByDock.get(slot.dock_id);
    if (dockSlots) {
      dockSlots.push(slot);
    }
  }

  const isSlotSelected = (slot: {
    dock_id: string;
    start: string;
    end: string;
  }) => {
    return (
      selectedSlot !== null &&
      selectedSlot.dock_id === slot.dock_id &&
      selectedSlot.start === slot.start &&
      selectedSlot.end === slot.end
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {docks.map((dock) => {
        const dockSlots = slotsByDock.get(dock.id) ?? [];

        return (
          <div key={dock.id}>
            <h3 className="mb-2 text-sm font-semibold text-text">
              {dock.name}
            </h3>
            <div className="space-y-1.5">
              {dockSlots.length === 0 ? (
                <p className="text-xs text-text-secondary">
                  Keine Zeitfenster
                </p>
              ) : (
                dockSlots.map((slot) => {
                  const selected = isSlotSelected(slot);

                  return (
                    <button
                      key={`${slot.dock_id}-${slot.start}`}
                      type="button"
                      disabled={!slot.available}
                      onClick={() =>
                        onSlotSelect({
                          dock_id: slot.dock_id,
                          start: slot.start,
                          end: slot.end,
                        })
                      }
                      className={cn(
                        "flex w-full items-center justify-center rounded-[6px] border px-3 py-2.5 min-h-[44px] text-sm transition-colors duration-150",
                        // Available, not selected
                        slot.available &&
                          !selected &&
                          "cursor-pointer border-primary text-text hover:bg-primary-light",
                        // Selected
                        selected &&
                          "border-primary bg-primary font-semibold text-white",
                        // Unavailable
                        !slot.available &&
                          "cursor-not-allowed border-border bg-bg text-text-secondary opacity-50"
                      )}
                    >
                      {formatTime(slot.start)} – {formatTime(slot.end)}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
