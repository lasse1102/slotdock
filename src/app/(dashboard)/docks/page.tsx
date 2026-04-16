"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWarehouse } from "@/hooks/use-warehouse";
import { useDocks } from "@/hooks/use-docks";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { DOCK_TYPES } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2, Plus, PackageOpen } from "lucide-react";
import type { Dock } from "@/lib/types";

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light",
        checked ? "bg-primary" : "bg-border",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

const dockTypeLabels: Record<string, string> = {
  general: "Allgemein",
  inbound: "Wareneingang",
  outbound: "Warenausgang",
};

const dockFormSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  dock_type: z.enum(["general", "inbound", "outbound"]),
  max_concurrent: z.coerce.number().int().min(1).max(5),
});

type DockFormValues = z.infer<typeof dockFormSchema>;

export default function DocksPage() {
  const { warehouse, loading: whLoading } = useWarehouse();
  const { docks, loading: docksLoading, refetch } = useDocks(warehouse?.id ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDock, setEditingDock] = useState<Dock | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Dock | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DockFormValues>({
    defaultValues: { name: "", dock_type: "general", max_concurrent: 1 },
  });

  function openCreate() {
    setEditingDock(null);
    reset({ name: "", dock_type: "general", max_concurrent: 1 });
    setModalOpen(true);
  }

  function openEdit(dock: Dock) {
    setEditingDock(dock);
    reset({
      name: dock.name,
      dock_type: dock.dock_type,
      max_concurrent: dock.max_concurrent,
    });
    setModalOpen(true);
  }

  async function onSubmit(data: DockFormValues) {
    if (!warehouse) return;
    setSubmitting(true);

    try {
      const url = editingDock
        ? `/api/docks/${editingDock.id}`
        : `/api/warehouses/${warehouse.id}/docks`;
      const method = editingDock ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.message || "Fehler beim Speichern", "error");
        return;
      }

      toast(
        editingDock ? "Rampe aktualisiert" : "Rampe erstellt",
        "success"
      );
      setModalOpen(false);
      refetch();
    } catch {
      toast("Netzwerkfehler", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(dock: Dock) {
    try {
      const res = await fetch(`/api/docks/${dock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !dock.is_active }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.message || "Fehler beim Aktualisieren", "error");
        return;
      }

      toast(
        dock.is_active
          ? `${dock.name} deaktiviert`
          : `${dock.name} aktiviert`,
        "success"
      );
      refetch();
    } catch {
      toast("Netzwerkfehler", "error");
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/docks/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.message || "Fehler beim Löschen", "error");
        return;
      }

      toast("Rampe gelöscht", "success");
      setDeleteConfirm(null);
      refetch();
    } catch {
      toast("Netzwerkfehler", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const loading = whLoading || docksLoading;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Rampenverwaltung</h1>
        <Button onClick={openCreate} disabled={loading}>
          <Plus size={16} className="mr-1.5" />
          Rampe hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : docks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16">
          <PackageOpen className="h-12 w-12 text-text-secondary" />
          <p className="text-text-secondary">
            Noch keine Rampen. Erste Rampe hinzufügen?
          </p>
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1.5" />
            Rampe hinzufügen
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left">
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Typ
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Max gleichzeitig
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {docks.map((dock) => (
                <tr
                  key={dock.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-text">
                    {dock.name}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {dockTypeLabels[dock.dock_type] || dock.dock_type}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {dock.max_concurrent}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={dock.is_active}
                        onChange={() => handleToggleActive(dock)}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          dock.is_active ? "text-success" : "text-text-secondary"
                        )}
                      >
                        {dock.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(dock)}
                        className="rounded-[6px] p-1.5 text-text-secondary hover:bg-bg hover:text-text transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(dock)}
                        className="rounded-[6px] p-1.5 text-text-secondary hover:bg-error-light hover:text-error transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDock ? "Rampe bearbeiten" : "Rampe hinzufügen"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="dock-name"
            label="Rampenname *"
            placeholder="z.B. Rampe 1"
            error={errors.name?.message}
            {...register("name")}
          />
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
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" loading={submitting}>
              {editingDock ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Rampe löschen"
      >
        <p className="text-sm text-text-secondary">
          Möchten Sie die Rampe <strong>{deleteConfirm?.name}</strong> wirklich
          löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Abbrechen
          </Button>
          <Button variant="danger" loading={submitting} onClick={handleDelete}>
            Löschen
          </Button>
        </div>
      </Modal>
    </div>
  );
}
