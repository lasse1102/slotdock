# SlotDock — Online-Rampenbuchung für Fulfillment-Unternehmen

> **"Der Disponent öffnet morgens sein Dashboard und sieht alle Anlieferungen des Tages sauber auf Rampen verteilt — ohne einen einzigen Anruf gemacht zu haben."**

SlotDock ist ein webbasiertes Slot-Buchungssystem für Lager-Rampen. Lagerbetreiber konfigurieren Rampen, Kapazitäten und Zeitregeln. Spediteure buchen verfügbare Zeitfenster über einen öffentlichen Weblink — ohne Login, ohne App-Installation.

---

## Was ist SlotDock?

Kleine und mittelgroße Fulfillment-Unternehmen koordinieren Lkw-Anlieferungen heute per Telefon und Excel. Das kostet täglich Stunden, führt zu Überschneidungen an Rampen und lässt Disponenten und Fahrer frustriert zurück.

SlotDock löst dieses Problem mit einem einfachen Prinzip: Der Lagerbetreiber richtet sein Lager einmal in unter 5 Minuten ein und erhält einen Buchungslink. Diesen Link schickt er seinen Spediteurpartnern. Die Spediteure buchen selbstständig — der Disponent sieht alles in Echtzeit im Dashboard.

**Kernvorteile:**
- Keine Überbuchungen durch datenbankbasierte Sperren auf Transaktionsebene
- Kein Login für Spediteure — öffentlicher Link reicht
- Echtzeit-Dashboard über Supabase Realtime
- E-Mail-Benachrichtigungen für Spediteure und Disponenten
- Setup unter 5 Minuten, Buchung unter 60 Sekunden

---

## Screenshots

### Dashboard — Tagesansicht
Das Dashboard zeigt alle Anlieferungen des Tages als Rampen-Zeitleiste. Status-Updates (angekommen, abgefertigt, nicht erschienen) sind per Klick möglich.

### Öffentliche Buchungsseite
Spediteure öffnen den Link, wählen einen Tag, sehen freie und belegte Slots und buchen in unter 60 Sekunden — ohne Account.

---

## Tech Stack

| Schicht | Technologie |
|---------|-------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (CSS-basierte Konfiguration) |
| Backend & Datenbank | [Supabase](https://supabase.com) (PostgreSQL, Auth, Realtime) |
| Authentifizierung | Supabase Auth via `@supabase/ssr` (Cookie-basiert) |
| E-Mail | [Resend](https://resend.com) |
| Payments | [Stripe](https://stripe.com) (Subscriptions) |
| Hosting | [Vercel](https://vercel.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Formulare | react-hook-form + zod |
| Datums-Utils | date-fns + date-fns-tz (DE-Locale) |

---

## Features

### Lager-Management
- Lager anlegen mit Name, Adresse, Öffnungszeiten und Standard-Slotdauer
- Bis zu beliebig viele Rampen pro Lager (Typ: Standard, Kühlware, Sperrgut)
- Rampen-Sonderpläne — einzelne Rampen können abweichende Öffnungszeiten oder geschlossene Tage haben
- Buchungslink jederzeit regenerierbar (alter Link wird sofort ungültig)

### Slot-Buchung (öffentlich, ohne Login)
- Token-basierter Buchungslink — kein Spediteur-Account notwendig
- Kalenderansicht mit verfügbaren und belegten Slots pro Rampe
- Race-Condition-Schutz: `SELECT ... FOR UPDATE` auf Datenbankebene verhindert Doppelbuchungen bei gleichzeitigen Anfragen
- Buchungsbestätigung per E-Mail mit Confirmation Code

### Echtzeit-Dashboard
- Rampen-Zeitleiste für den gewählten Tag
- Live-Updates über Supabase Realtime — neue Buchungen erscheinen ohne Reload
- Statusmanagement: `confirmed → arrived → completed`, `confirmed → cancelled`, `confirmed → no_show`
- Buchungsdetail-Seitenleiste mit allen Spediteur-Informationen

### Buchungsübersicht
- Filterable Tabelle über alle Buchungen (nach Datum, Rampe, Status)
- Schnellzugriff auf Statusänderungen direkt aus der Liste

### E-Mail-Benachrichtigungen
- Buchungsbestätigung an den Spediteur (mit allen Details und Confirmation Code)
- Neue-Buchung-Benachrichtigung an den Lagerbetreiber (abschaltbar)

### Einstellungen & Subscription
- Profilpflege (Name, Firma, Telefon, E-Mail)
- Buchungslink verwalten und regenerieren
- Benachrichtigungs-Toggles
- Stripe-Subscription-Verwaltung (Starter / Professional / Business)

---

## Projektstruktur

```
slotdock/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Signup, Auth-Callback
│   │   ├── (dashboard)/         # Geschützter Bereich mit Sidebar-Layout
│   │   │   ├── dashboard/       # Tages-Dashboard (Einstiegsseite)
│   │   │   ├── docks/           # Rampenverwaltung
│   │   │   ├── bookings/        # Buchungsübersicht
│   │   │   └── settings/        # Kontoeinstellungen
│   │   ├── (public)/            # Öffentliche Bereiche
│   │   │   ├── book/[token]/    # Öffentliche Buchungsseite
│   │   │   ├── impressum/       # Impressum
│   │   │   └── datenschutz/     # Datenschutzerklärung
│   │   ├── api/                 # REST API Routes
│   │   │   ├── bookings/        # Buchungs-Statusänderung
│   │   │   ├── docks/           # Rampen-CRUD
│   │   │   ├── public/book/     # Öffentliche Buchungs-API (Token-Auth)
│   │   │   └── warehouses/      # Lager-CRUD
│   │   ├── page.tsx             # Landing Page
│   │   └── layout.tsx           # Root Layout (Fonts, Metadata)
│   ├── components/
│   │   ├── ui/                  # Design System Primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toast.tsx
│   │   ├── features/            # Feature-spezifische Komponenten
│   │   │   ├── dashboard/       # DayView, DockTimeline, BookingDetail
│   │   │   ├── booking/         # PublicCalendar, SlotPicker, BookingForm
│   │   │   ├── warehouse/       # WarehouseForm, DockForm
│   │   │   └── auth/            # LoginForm, SignupForm
│   │   └── layout/              # Sidebar, Header, NavItem
│   ├── hooks/                   # Custom React Hooks
│   │   ├── use-bookings.ts      # Buchungsdaten mit Echtzeit-Subscription
│   │   ├── use-bookings-list.ts # Buchungsliste für Übersichtsseite
│   │   ├── use-docks.ts         # Rampendaten
│   │   ├── use-warehouse.ts     # Lagerdaten
│   │   └── use-realtime-bookings.ts  # Supabase Realtime Integration
│   └── lib/                     # Utilities, Types, Clients
│       ├── supabase/            # Browser- und Server-Client
│       ├── email/               # Resend-Client und E-Mail-Templates
│       ├── types.ts             # Alle TypeScript-Interfaces
│       ├── utils.ts             # Hilfsfunktionen (cn, Datumsformatierung)
│       ├── constants.ts         # App-weite Konstanten
│       ├── booking-utils.ts     # Slot-Generierungslogik
│       ├── api-errors.ts        # Standardisierte API-Fehlerformate
│       └── rate-limit.ts        # IP-basiertes Rate Limiting
├── supabase/
│   └── migrations/              # SQL-Migrationen (001–010)
├── middleware.ts                 # Auth-Middleware (Projekt-Root)
├── next.config.ts
└── package.json
```

---

## Datenmodell

Das Schema besteht aus sechs Tabellen. Alle Tabellen haben Row Level Security (RLS) aktiviert.

```
profiles ─── warehouses ─── docks ─── dock_schedules
                  │
                  └────── bookings
profiles ─── subscriptions
```

| Tabelle | Beschreibung |
|---------|-------------|
| `profiles` | Erweitert Supabase Auth — Firmenname, Telefon |
| `warehouses` | Lager mit Adresse, Öffnungszeiten, Booking-Token |
| `docks` | Rampen mit Typ (general, refrigerated, oversized) |
| `dock_schedules` | Rampen-Sonderpläne (abweichende Zeiten, geschlossene Tage) |
| `bookings` | Buchungen mit Status, Spediteur-Infos, Confirmation Code |
| `subscriptions` | Stripe-Subscription je Profil |

---

## Lokale Entwicklung

### Voraussetzungen

- [Node.js](https://nodejs.org) 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (für Migrationen)
- Ein Supabase-Projekt ([supabase.com](https://supabase.com))
- Resend-Account für E-Mails ([resend.com](https://resend.com))

### 1. Repository klonen

```bash
git clone https://github.com/lasse1102/slotdock.git
cd slotdock
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.local.example .env.local
```

`.env.local` befüllen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RESEND_API_KEY=re_...
FROM_EMAIL=noreply@deinedomain.de

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Datenbankmigrationen ausführen

```bash
supabase db push
```

Oder manuell im Supabase SQL Editor die Dateien aus `supabase/migrations/` in aufsteigender Reihenfolge ausführen.

**Demo-Daten (optional):** `supabase/migrations/010_seed_demo_data.sql` befüllt den Account `demo@slotdock.de` mit 3 Wochen realistischer Buchungshistorie — nützlich für Demos und Tests.

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die App ist erreichbar unter [http://localhost:3000](http://localhost:3000).

### 5. Design System ansehen

Unter [http://localhost:3000/dev](http://localhost:3000/dev) ist eine Übersichtsseite mit allen UI-Komponenten in allen Varianten verfügbar.

---

## Deployment

### Vercel (empfohlen)

1. Repository auf GitHub verbinden
2. Neues Vercel-Projekt erstellen
3. Alle Umgebungsvariablen aus `.env.local.example` in Vercel hinterlegen
4. Deploy — fertig

Vercel erkennt Next.js automatisch. Die Middleware für Auth-Schutz läuft als Edge Function.

### Supabase-Konfiguration für Produktion

- **Auth-Redirect-URL** in Supabase einstellen: `https://deine-domain.de/callback`
- **RLS aktiv** auf allen Tabellen (standardmäßig durch die Migrationen gesetzt)
- **SMTP konfigurieren** für Supabase Auth-E-Mails (Bestätigungsmail bei Registrierung)
- Supabase-Projekt idealerweise in **EU-Region (Frankfurt)** für DSGVO-Konformität

---

## Sicherheit

- **Row Level Security (RLS)** auf allen Tabellen — Lagerbetreiber sehen ausschließlich eigene Daten
- **Token-basierter Buchungszugang** — UUID v4, nicht erratbar, jederzeit regenerierbar
- **Datenbankebene-Transaktionssperren** — `SELECT ... FOR UPDATE` verhindert Doppelbuchungen bei gleichzeitigen Anfragen
- **Rate Limiting** — 60 Anfragen/Minute pro IP auf öffentlichen Endpunkten
- **Input-Validierung** — doppelt abgesichert (Client: zod, Server: API Routes + DB Constraints)
- **HTTP-only Cookies** für Auth-Sessions via `@supabase/ssr`
- **Service Role Key** wird nur serverseitig in API Routes verwendet — nie im Client-Bundle

---

## Roadmap-Status

| Phase | Beschreibung | Status |
|-------|-------------|--------|
| Phase 0 | Foundation & Setup | Abgeschlossen |
| Phase 1 | Lager- & Rampenverwaltung | Abgeschlossen |
| Phase 2 | Öffentliche Slot-Buchung | Abgeschlossen |
| Phase 3 | Dashboard & Echtzeit-Updates | Abgeschlossen |
| Phase 4 | E-Mail-Benachrichtigungen | Abgeschlossen |
| Phase 5 | Fehlerbehandlung & Edge Cases | Abgeschlossen |
| Phase 6 | Polish & Launch-Vorbereitung | Abgeschlossen |

**47 von 62 Tasks abgeschlossen.** Das MVP ist funktional und produktionsreif.

---

## Bewusst nicht umgesetzt (Out of Scope für MVP)

- ETA-Tracking und Verspätungsmanagement
- Automatische Slot-Umplanung
- GPS-Integration
- Analytics und Auslastungsprognosen
- Multi-Standort-Verwaltung (Datenmodell ist vorbereitet, UI folgt)
- Öffentliche API / WMS-Integration
- Native Mobile App
- Dark Mode
- Mehrsprachigkeit (aktuell: Deutsch)
- Wiederkehrende Buchungen

---

## Lizenz

Dieses Projekt ist ein Portfolio-Prototyp und nicht zur kommerziellen Nutzung freigegeben.
