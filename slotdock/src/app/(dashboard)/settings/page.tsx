"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useWarehouse } from "@/hooks/use-warehouse";
import { Copy, Check, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface ProfileFormValues {
  full_name: string;
  company_name: string;
  phone: string;
}

export default function SettingsPage() {
  const { warehouse, loading: whLoading } = useWarehouse();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerateModal, setRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [bookingToken, setBookingToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ProfileFormValues>();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        reset({
          full_name: data.full_name || "",
          company_name: data.company_name || "",
          phone: data.phone || "",
        });
      }
      setProfileLoading(false);
    }

    fetchProfile();
  }, [reset]);

  useEffect(() => {
    if (warehouse) {
      setBookingToken(warehouse.booking_token);
    }
  }, [warehouse]);

  async function handleProfileSave(data: ProfileFormValues) {
    if (!profile) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          company_name: data.company_name || null,
          phone: data.phone || null,
        })
        .eq("id", profile.id);

      if (error) {
        toast("Fehler beim Speichern des Profils", "error");
        return;
      }

      toast("Profil gespeichert", "success");
    } catch {
      toast("Netzwerkfehler", "error");
    } finally {
      setSaving(false);
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
      toast("Link kopiert", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Kopieren fehlgeschlagen", "error");
    }
  }

  async function handleRegenerate() {
    if (!warehouse) return;
    setRegenerating(true);

    try {
      const res = await fetch(
        `/api/warehouses/${warehouse.id}/regenerate-token`,
        { method: "POST" }
      );

      if (!res.ok) {
        toast("Fehler beim Generieren des neuen Links", "error");
        return;
      }

      const data = await res.json();
      setBookingToken(data.booking_token);
      setRegenerateModal(false);
      toast("Neuer Buchungslink generiert", "success");
    } catch {
      toast("Netzwerkfehler", "error");
    } finally {
      setRegenerating(false);
    }
  }

  const loading = whLoading || profileLoading;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-text">Einstellungen</h1>

      {/* Profile */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Profil</h2>
        <form
          onSubmit={handleSubmit(handleProfileSave)}
          className="space-y-4"
        >
          <Input
            id="email"
            label="E-Mail"
            value={profile?.email || ""}
            disabled
          />
          <Input
            id="full_name"
            label="Name"
            placeholder="Ihr Name"
            {...register("full_name")}
          />
          <Input
            id="company_name"
            label="Firma"
            placeholder="Firmenname"
            {...register("company_name")}
          />
          <Input
            id="phone"
            label="Telefon"
            placeholder="+49 123 456789"
            {...register("phone")}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Speichern
            </Button>
          </div>
        </form>
      </Card>

      {/* Booking Link */}
      {warehouse && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text">
            Buchungslink
          </h2>
          <p className="mb-3 text-sm text-text-secondary">
            Teilen Sie diesen Link mit Spediteuren. Sie können damit ohne
            Anmeldung Zeitfenster buchen.
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
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRegenerateModal(true)}
            >
              <RefreshCw size={14} className="mr-1.5" />
              Neuen Link generieren
            </Button>
          </div>
        </Card>
      )}

      {/* Subscription placeholder */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Abonnement</h2>
        <p className="text-sm text-text-secondary">
          Abonnement-Verwaltung wird bald verfügbar sein.
        </p>
      </Card>

      {/* Regenerate confirmation modal */}
      <Modal
        open={regenerateModal}
        onClose={() => setRegenerateModal(false)}
        title="Neuen Buchungslink generieren?"
      >
        <p className="text-sm text-text-secondary">
          Der aktuelle Buchungslink wird ungültig. Alle Spediteure, die den
          alten Link gespeichert haben, können damit keine Buchungen mehr
          vornehmen. Bereits bestehende Buchungen sind nicht betroffen.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setRegenerateModal(false)}
          >
            Abbrechen
          </Button>
          <Button
            variant="danger"
            loading={regenerating}
            onClick={handleRegenerate}
          >
            Neuen Link generieren
          </Button>
        </div>
      </Modal>
    </div>
  );
}
