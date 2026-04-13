import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Truck,
  ShieldCheck,
  LayoutDashboard,
  Check,
  ArrowRight,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-lg font-bold text-text">
            SlotDock
          </Link>
          <nav className="flex items-center gap-1 md:gap-3">
            <Link
              href="#features"
              className="hidden rounded-[6px] px-3 py-2 text-sm text-text-secondary hover:text-text sm:inline-flex"
            >
              Funktionen
            </Link>
            <Link
              href="#pricing"
              className="hidden rounded-[6px] px-3 py-2 text-sm text-text-secondary hover:text-text sm:inline-flex"
            >
              Preise
            </Link>
            <Link
              href="/login"
              className="rounded-[6px] px-3 py-2 text-sm text-text-secondary hover:text-text"
            >
              Anmelden
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-[6px] bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Kostenlos testen
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-light/50 via-bg to-bg" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-warning-light px-3 py-1 text-xs font-medium text-warning">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
            </span>
            Während Beta kostenlos
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text md:text-6xl">
            Schluss mit Excel und Telefonaten.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary md:text-xl">
            SlotDock ist die Online-Rampenbuchung für
            Fulfillment-Unternehmen. Spediteure reservieren selbst, Ihr Lager
            plant stressfrei.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-[8px] bg-primary px-6 text-base font-medium text-white shadow-md transition-colors hover:bg-primary-hover"
            >
              Jetzt kostenlos testen
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-[8px] border border-border bg-surface px-6 text-base font-medium text-text hover:bg-bg"
            >
              Funktionen ansehen
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Keine Kreditkarte erforderlich. In 2 Minuten einsatzbereit.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-text md:text-4xl">
            Alles für reibungslose Anlieferungen.
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Drei einfache Bausteine ersetzen Ihre bisherige Disposition.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Truck size={24} strokeWidth={1.5} />}
            title="Spediteure buchen selbst"
            description="Ein Buchungslink, kein Login nötig. Fahrer reservieren verfügbare Zeitfenster in Sekunden — per Handy."
          />
          <FeatureCard
            icon={<ShieldCheck size={24} strokeWidth={1.5} />}
            title="Keine Überbuchungen"
            description="Kapazitätslogik pro Rampe, atomare Slot-Reservierung. Doppelbuchungen sind technisch ausgeschlossen."
          />
          <FeatureCard
            icon={<LayoutDashboard size={24} strokeWidth={1.5} />}
            title="Volle Übersicht"
            description="Tages-Dashboard in Echtzeit. Alle Anlieferungen sauber auf Rampen verteilt — ohne einen einzigen Anruf."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-text md:text-4xl">
            Während Beta kostenlos.
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Alle Funktionen ohne Limit. Bezahlpläne folgen später — Sie
            bestimmen, ob Sie dabei bleiben.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            name="Starter"
            price="—"
            description="Für kleine Lager mit bis zu 3 Rampen."
            features={[
              "Bis zu 3 Rampen",
              "Unbegrenzte Buchungen",
              "E-Mail-Benachrichtigungen",
            ]}
          />
          <PricingCard
            name="Pro"
            price="—"
            description="Für wachsende Fulfillment-Betriebe."
            features={[
              "Unbegrenzte Rampen",
              "Erweiterte Statistiken",
              "Priorisierter Support",
            ]}
            highlighted
          />
          <PricingCard
            name="Business"
            price="—"
            description="Für Standort-Verbünde mit mehreren Lagern."
            features={[
              "Mehrere Lagerstandorte",
              "Team-Accounts",
              "SLA & individuelle Betreuung",
            ]}
          />
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-[8px] bg-primary px-6 text-base font-medium text-white shadow-md transition-colors hover:bg-primary-hover"
          >
            Jetzt kostenlos starten
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} SlotDock
          </p>
          <nav className="flex gap-6 text-sm">
            <Link
              href="/impressum"
              className="text-text-secondary hover:text-text"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="text-text-secondary hover:text-text"
            >
              Datenschutz
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-surface p-8 shadow-sm">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[10px] bg-primary-light text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-[12px] border bg-surface p-8 ${
        highlighted
          ? "border-primary shadow-lg ring-1 ring-primary"
          : "border-border shadow-sm"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">{name}</h3>
        <span className="inline-flex items-center rounded-full bg-warning-light px-2 py-0.5 text-xs font-medium text-warning">
          Geplant
        </span>
      </div>
      <p className="mb-6 text-sm text-text-secondary">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-text">{price}</span>
        <span className="ml-1 text-sm text-text-secondary">/ Monat</span>
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-text"
          >
            <Check
              size={18}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-success"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled
        className="mt-auto inline-flex h-10 cursor-not-allowed items-center justify-center rounded-[6px] border border-border bg-bg px-4 text-sm font-medium text-text-secondary"
      >
        Bald verfügbar
      </button>
    </div>
  );
}
