"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge, variantLabels } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ToastContainer, toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import type { BadgeVariant } from "@/components/ui/badge";

export default function DevPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg p-8">
      <h1 className="mb-8 text-3xl font-bold text-text">
        SlotDock Design System
      </h1>

      {/* Buttons */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" loading>
            Loading
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Inputs</h2>
        <div className="max-w-md space-y-3">
          <Input label="Standard" placeholder="Eingabe..." />
          <Input
            label="Mit Fehler"
            error="Dieses Feld ist erforderlich"
            placeholder="Fehler..."
          />
          <Input label="Deaktiviert" disabled placeholder="Nicht editierbar" />
        </div>
      </section>

      {/* Select */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Select</h2>
        <div className="max-w-md">
          <Select
            label="Rampentyp"
            placeholder="Typ auswählen..."
            options={[
              { value: "general", label: "Allgemein" },
              { value: "inbound", label: "Wareneingang" },
              { value: "outbound", label: "Warenausgang" },
            ]}
          />
        </div>
      </section>

      {/* Cards */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Cards</h2>
        <div className="grid max-w-2xl grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold text-text">Standard Card</h3>
            <p className="mt-1 text-sm text-text-secondary">Inhalt hier</p>
          </Card>
          <Card clickable>
            <h3 className="font-semibold text-text">Clickable Card</h3>
            <p className="mt-1 text-sm text-text-secondary">Hover mich</p>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {(
            Object.keys(variantLabels) as BadgeVariant[]
          ).map((variant) => (
            <Badge key={variant} variant={variant}>
              {variantLabels[variant]}
            </Badge>
          ))}
        </div>
      </section>

      {/* Skeleton */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Skeleton</h2>
        <div className="max-w-md space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>

      {/* Modal */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Modal öffnen</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Beispiel Modal"
        >
          <p className="text-sm text-text-secondary">
            Das ist ein Beispiel-Modal mit Inhalt.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={() => setModalOpen(false)}>Bestätigen</Button>
          </div>
        </Modal>
      </section>

      {/* Toast */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">Toast</h2>
        <div className="flex gap-3">
          <Button onClick={() => toast("Erfolgreich gespeichert!", "success")}>
            Success Toast
          </Button>
          <Button
            variant="danger"
            onClick={() => toast("Ein Fehler ist aufgetreten", "error")}
          >
            Error Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast("Hinweis: Neue Buchung eingegangen", "info")}
          >
            Info Toast
          </Button>
        </div>
      </section>

      <ToastContainer />
    </div>
  );
}
