import * as React from "react";

interface NewBookingNotificationProps {
  warehouseName: string;
  dockName: string;
  date: string;
  time: string;
  carrierCompany: string;
  referenceNumber?: string | null;
}

export function NewBookingNotificationEmail({
  warehouseName,
  dockName,
  date,
  time,
  carrierCompany,
  referenceNumber,
}: NewBookingNotificationProps) {
  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#F9FAFB",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#2563EB",
            padding: "24px 32px",
          }}
        >
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "20px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            SlotDock
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: "32px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
              margin: "0 0 8px 0",
            }}
          >
            Neue Buchung eingegangen
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
              margin: "0 0 24px 0",
              lineHeight: "1.5",
            }}
          >
            Für <strong>{warehouseName}</strong> wurde eine neue Buchung erstellt.
          </p>

          {/* Booking Details Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse" as const,
              fontSize: "14px",
            }}
          >
            <tbody>
              <DetailRow label="Firma" value={carrierCompany} />
              <DetailRow label="Rampe" value={dockName} />
              <DetailRow label="Datum" value={date} />
              <DetailRow label="Uhrzeit" value={time} />
              {referenceNumber && <DetailRow label="Referenz" value={referenceNumber} />}
            </tbody>
          </table>

          {/* CTA hint */}
          <p
            style={{
              fontSize: "13px",
              color: "#6B7280",
              margin: "24px 0 0 0",
              lineHeight: "1.5",
            }}
          >
            Öffnen Sie Ihr SlotDock-Dashboard, um die Buchung einzusehen und den Status zu verwalten.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #E5E7EB",
            padding: "20px 32px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Diese Benachrichtigung kann in den SlotDock-Einstellungen deaktiviert werden.
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td
        style={{
          padding: "8px 0",
          color: "#6B7280",
          borderBottom: "1px solid #F3F4F6",
          width: "120px",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "8px 0",
          color: "#111827",
          fontWeight: 500,
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        {value}
      </td>
    </tr>
  );
}
