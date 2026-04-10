"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWarehouse } from "@/hooks/use-warehouse";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { warehouse, loading } = useWarehouse();

  useEffect(() => {
    if (!loading && !warehouse) {
      router.replace("/warehouse/setup");
    }
  }, [loading, warehouse, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="mt-6 h-48 w-full" />
      </div>
    );
  }

  if (!warehouse) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Dashboard</h1>
      <p className="mt-2 text-text-secondary">
        Willkommen bei SlotDock. Hier sehen Sie Ihre Tagesübersicht für{" "}
        <strong>{warehouse.name}</strong>.
      </p>
    </div>
  );
}
