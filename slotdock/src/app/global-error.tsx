"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="de">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9FAFB",
          color: "#111827",
          margin: 0,
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem" }}>
            Etwas ist schiefgelaufen
          </h2>
          <p style={{ margin: "0 0 1.5rem", color: "#6B7280", fontSize: 14 }}>
            Ein kritischer Fehler ist aufgetreten. Bitte laden Sie die Seite
            neu.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
