"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

const variantBorderStyles: Record<ToastVariant, string> = {
  success: "border-l-4 border-l-success",
  error: "border-l-4 border-l-error",
  info: "border-l-4 border-l-info",
};

let addToastFn: ((message: string, variant: ToastVariant) => void) | null =
  null;

export function toast(message: string, variant: ToastVariant = "info") {
  addToastFn?.(message, variant);
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-[8px] bg-surface px-4 py-3 text-sm text-text shadow-lg",
            variantBorderStyles[t.variant]
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export { ToastContainer, type ToastVariant };
