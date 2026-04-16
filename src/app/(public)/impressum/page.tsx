import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Impressum — SlotDock",
};

export default function ImpressumPage() {
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

      <h1 className="mb-8 text-3xl font-bold text-text">Impressum</h1>

      <div className="space-y-8 text-text">
        <section>
          <h2 className="mb-2 text-lg font-semibold">Anbieter</h2>
          <p className="text-text-secondary">
            [Firmenname]
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ Stadt]
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Kontakt</h2>
          <p className="text-text-secondary">
            E-Mail: [kontakt@example.de]
            <br />
            Telefon: [+49 ...]
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Vertretungsberechtigter</h2>
          <p className="text-text-secondary">[Name des Geschäftsführers]</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Umsatzsteuer-ID</h2>
          <p className="text-text-secondary">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            [DE...]
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p className="text-text-secondary">
            [Name]
            <br />
            [Anschrift]
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Haftungshinweis</h2>
          <p className="text-text-secondary">
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine
            Haftung für die Inhalte externer Links. Für den Inhalt der
            verlinkten Seiten sind ausschließlich deren Betreiber
            verantwortlich.
          </p>
        </section>
      </div>
    </main>
  );
}
