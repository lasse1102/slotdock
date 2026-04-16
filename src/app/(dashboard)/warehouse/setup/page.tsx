"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  WarehouseForm,
  type WarehouseFormValues,
} from "@/components/features/warehouse/warehouse-form";
import { DockForm, type DockEntry } from "@/components/features/warehouse/dock-form";
import { toast } from "@/components/ui/toast";
import { Check, Copy } from "lucide-react";

const STEPS = ["Lager-Details", "Rampen hinzufügen", "Buchungslink"];

export default function WarehouseSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [warehouseData, setWarehouseData] =
    useState<WarehouseFormValues | null>(null);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [bookingToken, setBookingToken] = useState<string | null>(null);
  const [docks, setDocks] = useState<DockEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function handleWarehouseSubmit(data: WarehouseFormValues) {
    setWarehouseData(data);
    setLoading(true);

    try {
      // If warehouse already created (user went back), update instead of create
      const url = warehouseId
        ? `/api/warehouses/${warehouseId}`
        : "/api/warehouses";
      const method = warehouseId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.message || "Fehler beim Erstellen des Lagers", "error");
        return;
      }

      const { warehouse } = await res.json();
      setWarehouseId(warehouse.id);
      setBookingToken(warehouse.booking_token);
      setStep(1);
    } catch {
      toast("Netzwerkfehler. Bitte versuchen Sie es erneut.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDocksNext() {
    if (!warehouseId || docks.length === 0) return;
    setLoading(true);

    try {
      for (const dock of docks) {
        const res = await fetch(`/api/warehouses/${warehouseId}/docks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dock),
        });

        if (!res.ok) {
          const err = await res.json();
          toast(
            err.message || `Fehler beim Erstellen der Rampe "${dock.name}"`,
            "error"
          );
          return;
        }
      }

      setStep(2);
    } catch {
      toast("Netzwerkfehler. Bitte versuchen Sie es erneut.", "error");
    } finally {
      setLoading(false);
    }
  }

  function getBookingUrl() {
    if (!origin || !bookingToken) return "";
    return `${origin}/book/${bookingToken}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getBookingUrl());
      setCopied(true);
      toast("Link in die Zwischenablage kopiert", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Kopieren fehlgeschlagen", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  i < step
                    ? "bg-success text-white"
                    : i === step
                      ? "bg-primary text-white"
                      : "bg-border text-text-secondary"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  i === step
                    ? "font-medium text-text"
                    : "text-text-secondary"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 sm:w-12 ${
                  i < step ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <h1 className="mb-6 text-xl font-bold text-text">
          {step === 0 && "Lager einrichten"}
          {step === 1 && "Rampen hinzufügen"}
          {step === 2 && "Ihr Buchungslink"}
        </h1>

        {step === 0 && (
          <WarehouseForm
            onSubmit={handleWarehouseSubmit}
            loading={loading}
            defaultValues={warehouseData || undefined}
          />
        )}

        {step === 1 && (
          <DockForm
            docks={docks}
            onAdd={(dock) => setDocks((prev) => [...prev, dock])}
            onRemove={(i) => setDocks((prev) => prev.filter((_, idx) => idx !== i))}
            onNext={handleDocksNext}
            onBack={() => setStep(0)}
            loading={loading}
          />
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-text-secondary">
              Teilen Sie diesen Link mit Ihren Spediteuren, damit diese
              verfügbare Zeitfenster buchen können. Es ist keine Registrierung
              erforderlich.
            </p>

            <div className="flex items-center gap-2 rounded-[8px] border border-border bg-bg p-3">
              <code className="flex-1 truncate text-sm text-text">
                {getBookingUrl()}
              </code>
              <Button
                size="sm"
                variant={copied ? "secondary" : "primary"}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-1" />
                    Kopiert
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" />
                    Kopieren
                  </>
                )}
              </Button>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => router.push("/dashboard")}>Zum Dashboard</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
