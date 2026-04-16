"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-[12px] border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-light">
          <AlertTriangle size={24} className="text-error" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-text">
          Etwas ist schiefgelaufen
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es
          erneut.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Seite neu laden
          </Button>
          <Button onClick={reset}>Erneut versuchen</Button>
        </div>
      </div>
    </div>
  );
}
