"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { cn, formatDate, formatSlotTime } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";

export interface BookingConfirmation {
  id: string;
  dock_id: string;
  slot_start: string;
  slot_end: string;
  carrier_company: string;
  carrier_contact_name: string | null;
  carrier_email: string | null;
  carrier_phone: string | null;
  license_plate: string | null;
  reference_number: string | null;
  notes: string | null;
  confirmation_code: string | null;
  status: string;
  created_at: string;
}

interface BookingFormProps {
  token: string;
  selectedSlot: { dock_id: string; start: string; end: string };
  dockName: string;
  onSuccess: (booking: BookingConfirmation) => void;
  onSlotUnavailable: () => void;
  onCancel?: () => void;
}

const bookingFormSchema = z.object({
  carrier_company: z.string().min(1, "Firmenname ist erforderlich").max(255),
  carrier_contact_name: z.string().max(255).optional().or(z.literal("")),
  carrier_email: z
    .string()
    .email("Ungültige E-Mail-Adresse")
    .max(255)
    .optional()
    .or(z.literal("")),
  carrier_phone: z.string().max(50).optional().or(z.literal("")),
  license_plate: z.string().max(50).optional().or(z.literal("")),
  reference_number: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function BookingForm({
  token,
  selectedSlot,
  dockName,
  onSuccess,
  onSlotUnavailable,
  onCancel,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      carrier_company: "",
      carrier_contact_name: "",
      carrier_email: "",
      carrier_phone: "",
      license_plate: "",
      reference_number: "",
      notes: "",
    },
  });

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);

    // Clean optional empty strings to undefined
    const payload = {
      dock_id: selectedSlot.dock_id,
      slot_start: selectedSlot.start,
      carrier_company: data.carrier_company,
      ...(data.carrier_contact_name && {
        carrier_contact_name: data.carrier_contact_name,
      }),
      ...(data.carrier_email && { carrier_email: data.carrier_email }),
      ...(data.carrier_phone && { carrier_phone: data.carrier_phone }),
      ...(data.license_plate && {
        license_plate: data.license_plate.toUpperCase(),
      }),
      ...(data.reference_number && {
        reference_number: data.reference_number,
      }),
      ...(data.notes && { notes: data.notes }),
    };

    try {
      const response = await fetch(`/api/public/book/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const result = await response.json();
        onSuccess(result.booking as BookingConfirmation);
        return;
      }

      if (response.status === 409) {
        toast("Zeitfenster nicht mehr verfügbar", "error");
        onSlotUnavailable();
        return;
      }

      // Other errors
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message ?? "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";
      toast(message, "error");
    } catch {
      toast("Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      {/* Slot info header */}
      <div className="mb-6 rounded-[8px] bg-primary-light p-4">
        <p className="text-sm font-medium text-primary mb-2">{dockName}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-text-secondary" />
            {formatDate(selectedSlot.start)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-text-secondary" />
            {formatSlotTime(selectedSlot.start, selectedSlot.end)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Firma *"
          id="carrier_company"
          placeholder="Firmenname"
          error={errors.carrier_company?.message}
          {...register("carrier_company")}
        />

        <Input
          label="Kontaktname"
          id="carrier_contact_name"
          placeholder="Vor- und Nachname"
          error={errors.carrier_contact_name?.message}
          {...register("carrier_contact_name")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="E-Mail"
            id="carrier_email"
            type="email"
            placeholder="email@beispiel.de"
            error={errors.carrier_email?.message}
            {...register("carrier_email")}
          />

          <Input
            label="Telefon"
            id="carrier_phone"
            type="tel"
            placeholder="+49 123 456789"
            error={errors.carrier_phone?.message}
            {...register("carrier_phone")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Kennzeichen"
            id="license_plate"
            placeholder="z.B. B-AB 1234"
            className="uppercase"
            error={errors.license_plate?.message}
            {...register("license_plate")}
          />

          <Input
            label="Referenznummer"
            id="reference_number"
            placeholder="z.B. PO-12345"
            error={errors.reference_number?.message}
            {...register("reference_number")}
          />
        </div>

        {/* Notes textarea — styled to match Input */}
        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-text"
          >
            Notizen
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Besondere Hinweise zur Anlieferung"
            className={cn(
              "w-full rounded-[6px] border px-3 py-2 text-sm transition-colors duration-150 focus:ring-2 focus:outline-none resize-none",
              errors.notes
                ? "border-error focus:border-error focus:ring-error-light"
                : "border-border focus:border-primary focus:ring-primary-light"
            )}
            {...register("notes")}
          />
          {errors.notes && (
            <p className="mt-1 text-xs text-error">{errors.notes.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="flex-1"
          >
            Buchen
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
