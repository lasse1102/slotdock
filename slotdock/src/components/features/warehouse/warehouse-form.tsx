"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_OPENING_TIME,
  DEFAULT_CLOSING_TIME,
  DEFAULT_SLOT_DURATION,
  SLOT_DURATIONS,
} from "@/lib/constants";
import { Select } from "@/components/ui/select";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_zip: z.string().optional(),
  opening_time: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  closing_time: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  default_slot_duration_minutes: z.coerce.number().int().min(15).max(240),
  max_advance_booking_days: z.coerce.number().int().min(1).max(90),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  onSubmit: (data: WarehouseFormValues) => void;
  loading?: boolean;
  defaultValues?: Partial<WarehouseFormValues>;
}

export function WarehouseForm({
  onSubmit,
  loading = false,
  defaultValues,
}: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    defaultValues: {
      name: "",
      address_street: "",
      address_city: "",
      address_zip: "",
      opening_time: DEFAULT_OPENING_TIME,
      closing_time: DEFAULT_CLOSING_TIME,
      default_slot_duration_minutes: DEFAULT_SLOT_DURATION,
      max_advance_booking_days: 14,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        label="Lagername *"
        placeholder="z.B. Hauptlager Nord"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="address_street"
          label="Straße"
          placeholder="Industriestr. 42"
          {...register("address_street")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="address_zip"
            label="PLZ"
            placeholder="12345"
            {...register("address_zip")}
          />
          <Input
            id="address_city"
            label="Stadt"
            placeholder="Berlin"
            {...register("address_city")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="opening_time"
          label="Öffnungszeit *"
          type="time"
          error={errors.opening_time?.message}
          {...register("opening_time")}
        />
        <Input
          id="closing_time"
          label="Schließzeit *"
          type="time"
          error={errors.closing_time?.message}
          {...register("closing_time")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="default_slot_duration_minutes"
          label="Standard-Slotlänge *"
          options={SLOT_DURATIONS.map((d) => ({
            value: String(d),
            label: `${d} Minuten`,
          }))}
          error={errors.default_slot_duration_minutes?.message}
          {...register("default_slot_duration_minutes")}
        />
        <Input
          id="max_advance_booking_days"
          label="Max. Vorausbuchung (Tage) *"
          type="number"
          min={1}
          max={90}
          error={errors.max_advance_booking_days?.message}
          {...register("max_advance_booking_days")}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          Weiter
        </Button>
      </div>
    </form>
  );
}
