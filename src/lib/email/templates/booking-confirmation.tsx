import * as React from "react";

interface BookingConfirmationProps {
  warehouseName: string;
  dockName: string;
  date: string;
  time: string;
  confirmationCode: string;
  carrierCompany: string;
  contactName?: string | null;
  licensePlate?: string | null;
  referenceNumber?: string | null;
}

export function BookingConfirmationEmail({
  warehouseName,
  dockName,
  date,
  time,
  confirmationCode,
  carrierCompany,
  contactName,
  licensePlate,
  referenceNumber,
}: BookingConfirmationProps) {
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
            Buchungsbestätigung
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
              margin: "0 0 24px 0",
              lineHeight: "1.5",
            }}
          >
            Ihre Buchung bei <strong>{warehouseName}</strong> wurde erfolgreich erstellt.
          </p>

          {/* Confirmation Code */}
          <div
            style={{
              backgroundColor: "#DBEAFE",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center" as const,
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6B7280",
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              Bestätigungscode
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#2563EB",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
              }}
            >
              {confirmationCode}
            </div>
          </div>

          {/* Booking Details Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse" as const,
              fontSize: "14px",
            }}
          >
            <tbody>
              <DetailRow label="Lager" value={warehouseName} />
              <DetailRow label="Rampe" value={dockName} />
              <DetailRow label="Datum" value={date} />
              <DetailRow label="Uhrzeit" value={time} />
              <DetailRow label="Firma" value={carrierCompany} />
              {contactName && <DetailRow label="Kontakt" value={contactName} />}
              {licensePlate && <DetailRow label="Kennzeichen" value={licensePlate} />}
              {referenceNumber && <DetailRow label="Referenz" value={referenceNumber} />}
            </tbody>
          </table>
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
            Diese E-Mail wurde automatisch von SlotDock versendet. Bitte bewahren Sie den Bestätigungscode für Ihre Unterlagen auf.
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
