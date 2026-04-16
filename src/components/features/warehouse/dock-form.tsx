"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DOCK_TYPES } from "@/lib/constants";
import { Trash2 } from "lucide-react";

const dockSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  dock_type: z.enum(["general", "inbound", "outbound"]),
  max_concurrent: z.coerce.number().int().min(1).max(5),
});

type DockFormValues = z.infer<typeof dockSchema>;

export interface DockEntry {
  name: string;
  dock_type: string;
  max_concurrent: number;
}

const dockTypeLabels: Record<string, string> = {
  general: "Allgemein",
  inbound: "Wareneingang",
  outbound: "Warenausgang",
};

interface DockFormProps {
  docks: DockEntry[];
  onAdd: (dock: DockEntry) => void;
  onRemove: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function DockForm({
  docks,
  onAdd,
  onRemove,
  onNext,
  onBack,
  loading = false,
}: DockFormProps) {
  const [showForm, setShowForm] = useState(docks.length === 0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DockFormValues>({
    defaultValues: {
      name: "",
      dock_type: "general",
      max_concurrent: 1,
    },
  });

  function handleAdd(data: DockFormValues) {
    onAdd(data);
    reset();
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {docks.length > 0 && (
        <div className="divide-y divide-border rounded-[8px] border border-border">
          {docks.map((dock, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <span className="font-medium text-text">{dock.name}</span>
                <span className="ml-2 text-sm text-text-secondary">
                  {dockTypeLabels[dock.dock_type] || dock.dock_type}
                </span>
                {dock.max_concurrent > 1 && (
                  <span className="ml-2 text-sm text-text-secondary">
                    (max. {dock.max_concurrent} gleichzeitig)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="rounded-[6px] p-1.5 text-text-secondary transition-colors hover:bg-error-light hover:text-error"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={handleSubmit(handleAdd)}
          className="space-y-3 rounded-[8px] border border-border bg-bg p-4"
        >
          <Input
            id="dock-name"
            label="Rampenname *"
            placeholder="z.B. Rampe 1"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="dock-type"
              label="Typ"
              options={DOCK_TYPES.map((t) => ({
                value: t,
                label: dockTypeLabels[t] || t,
              }))}
              {...register("dock_type")}
            />
            <Input
              id="dock-max-concurrent"
              label="Max. gleichzeitig"
              type="number"
              min={1}
              max={5}
              error={errors.max_concurrent?.message}
              {...register("max_concurrent")}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Hinzufügen
            </Button>
            {docks.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Abbrechen
              </Button>
            )}
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowForm(true)}
        >
          Rampe hinzufügen
        </Button>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Zurück
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={docks.length === 0}
          loading={loading}
        >
          Weiter
        </Button>
      </div>

      {docks.length === 0 && (
        <p className="text-sm text-text-secondary">
          Fügen Sie mindestens eine Rampe hinzu, um fortzufahren.
        </p>
      )}
    </div>
  );
}
