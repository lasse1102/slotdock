import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Datenschutz — SlotDock",
};

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text"
      >
        <ArrowLeft size={16} />
        Zurück zur Startseite
      </Link>

      <div className="mb-6 inline-flex items-center rounded-full bg-warning-light px-3 py-1 text-xs font-medium text-warning">
        ENTWURF — Bitte von einem Anwalt prüfen lassen
      </div>

      <h1 className="mb-8 text-3xl font-bold text-text">Datenschutzerklärung</h1>

      <div className="space-y-8 text-text">
        <section>
          <h2 className="mb-2 text-lg font-semibold">Verantwortlicher</h2>
          <p className="text-text-secondary">
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            <br />
            [Firmenname, Anschrift — siehe Impressum]
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Erhobene Daten</h2>
          <p className="text-text-secondary">
            Wir erheben personenbezogene Daten ausschließlich im Rahmen der
            Nutzung unserer Dienste:
          </p>
          <ul className="mt-2 list-disc pl-6 text-text-secondary">
            <li>Registrierungsdaten: Name, E-Mail-Adresse</li>
            <li>
              Buchungsdaten: Firmenname, Kontaktdaten, Kennzeichen, Referenznummern
            </li>
            <li>Nutzungsdaten: Zugriffszeiten, IP-Adresse (anonymisiert)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Speicherung</h2>
          <p className="text-text-secondary">
            Alle Daten werden auf EU-basierten Servern bei Supabase (Frankfurt,
            Deutschland) gespeichert. Die Verarbeitung erfolgt nach den
            Anforderungen der DSGVO.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Zweck der Verarbeitung</h2>
          <ul className="list-disc pl-6 text-text-secondary">
            <li>Bereitstellung der Buchungsfunktionen</li>
            <li>Vertragserfüllung gegenüber Lagerbetreibern und Spediteuren</li>
            <li>E-Mail-Benachrichtigungen zu Buchungen (via Resend)</li>
            <li>Sicherheit und Missbrauchsprävention</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Speicherdauer</h2>
          <p className="text-text-secondary">
            Buchungsdaten werden für die Dauer der Vertragsbeziehung sowie die
            gesetzlichen Aufbewahrungsfristen gespeichert. Account-Daten werden
            bis zur Kontolöschung aufbewahrt.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Ihre Rechte</h2>
          <p className="text-text-secondary">
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und
            Widerspruch. Anfragen richten Sie bitte an die im Impressum
            angegebene Kontaktadresse.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Auftragsverarbeiter
          </h2>
          <ul className="list-disc pl-6 text-text-secondary">
            <li>Supabase (Datenbank, Auth) — EU-Hosting</li>
            <li>Vercel (Hosting der Web-Anwendung)</li>
            <li>Resend (Versand von Transaktions-E-Mails)</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
