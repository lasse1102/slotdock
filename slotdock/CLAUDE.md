# SlotDock — Projekt-Leitfaden

@AGENTS.md

## Produkt

SlotDock ist ein webbasiertes Slot-Buchungssystem für Lager-Rampen. Lagerbetreiber konfigurieren Rampen, Kapazitäten und Zeitregeln. Spediteure buchen über einen öffentlichen Weblink verfügbare Zeitfenster — ohne Login, ohne App.

**Magic Moment:** Der Disponent öffnet morgens sein Dashboard und sieht alle Anlieferungen des Tages sauber auf Rampen verteilt — ohne einen einzigen Anruf.

## Tech-Stack

| Schicht        | Technologie                              |
|----------------|------------------------------------------|
| Frontend       | Next.js 16 (App Router, TypeScript)      |
| Styling        | Tailwind CSS v4 (CSS-basierte Config)    |
| Backend/DB     | Supabase (PostgreSQL, Auth, Realtime)    |
| Auth           | Supabase Auth (`@supabase/ssr`, Cookies) |
| Payments       | Stripe                                   |
| E-Mail         | Resend                                   |
| Hosting        | Vercel + Supabase Cloud                  |
| Icons          | Lucide React (outline, 1.5px stroke)     |
| Forms          | react-hook-form + zod                    |
| Datums-Utils   | date-fns + date-fns-tz (German locale)   |

## Architektur-Entscheidungen

- **Tailwind v4:** Konfiguration über `@theme inline` in `globals.css`, NICHT über `tailwind.config.ts`
- **Supabase Client:** Browser-Client (`src/lib/supabase/client.ts`) und Server-Client (`src/lib/supabase/server.ts`) über `@supabase/ssr` — NICHT `@supabase/auth-helpers`
- **Middleware:** `middleware.ts` liegt im Projekt-Root (nicht in `src/`). Schützt alle Routen außer: `/`, `/login`, `/signup`, `/book/*`, `/callback`
- **Fonts:** Inter + JetBrains Mono via `next/font/google` in `layout.tsx` — KEIN CSS `@import` für Google Fonts (bricht Tailwind v4)
- **RLS:** Row Level Security ist auf allen Tabellen aktiv. Öffentliche Booking-Inserts laufen über API-Routes mit Service Role Key
- **Kein Dark Mode** in v1

## Coding-Regeln

### Sprache
- **UI-Texte:** Deutsch (alle Labels, Buttons, Fehlermeldungen, Platzhalter)
- **Code:** Englisch (Variablen, Funktionen, Kommentare, Commit Messages)

### Code-Stil
- `cn()` aus `src/lib/utils.ts` für className-Merging (clsx + tailwind-merge)
- TypeScript Interfaces für DB-Entities in `src/lib/types.ts`
- Konstanten in `src/lib/constants.ts`
- Komponenten als named exports, nicht default exports (Ausnahme: Pages)
- `forwardRef` für UI-Primitives (Button, Input, Select)
- Design Tokens über Tailwind-Klassen nutzen (z.B. `text-primary`, `bg-error-light`), nicht raw Hex-Werte

### Projektstruktur
```
slotdock/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Signup, Callback
│   │   ├── (dashboard)/     # Geschützter Bereich mit Sidebar-Layout
│   │   ├── (public)/        # Öffentliche Buchungsseite
│   │   ├── api/             # API-Routes
│   │   └── dev/             # Design System Showcase (nur Dev)
│   ├── components/
│   │   ├── ui/              # Design System Primitives
│   │   ├── features/        # Feature-spezifische Komponenten
│   │   └── layout/          # Sidebar, Header, Nav
│   ├── hooks/               # Custom React Hooks
│   └── lib/                 # Utils, Types, Constants, Supabase Clients
├── supabase/migrations/     # SQL-Migrationen
├── middleware.ts             # Auth-Middleware (Projekt-Root!)
└── docs/                    # PRD, Vision, Roadmap
```

### Datenbank
- 6 Tabellen: `profiles`, `warehouses`, `docks`, `dock_schedules`, `bookings`, `subscriptions`
- `updated_at`-Trigger auf allen relevanten Tabellen
- Auto-Create Profile via Trigger bei neuem Auth User
- Booking-Token (UUID) pro Warehouse für öffentlichen Buchungslink

### Design Tokens (Kurzreferenz)
- Primary: `#2563EB` / Hover: `#1D4ED8` / Light: `#DBEAFE`
- Success: `#059669` / Warning: `#D97706` / Error: `#DC2626`
- Background: `#F9FAFB` / Surface: `#FFFFFF` / Border: `#E5E7EB`
- Text: `#111827` / Text Secondary: `#6B7280`
- Border Radius: sm=6px, md=8px, lg=12px
- Shadows: sm, md, lg (siehe globals.css)

## Git-Workflow

- Nach jeder abgeschlossenen Phase wird committed, gepusht und ein PR erstellt
- Branch-Schema: `phase-X/kurzbeschreibung` (z.B. `phase-0/foundation-and-setup`)
- Commit Messages auf Englisch
- Vor dem Push: `npx tsc --noEmit` und `npx next build` müssen fehlerfrei durchlaufen

## Roadmap-Status

Fortschritt wird in `docs/product-roadmap.md` getrackt. Tasks mit `- [x]` sind erledigt.

**Phase 0 — Foundation & Setup:** abgeschlossen (10/10 Tasks)
**Phase 1 — Warehouse & Dock Management:** abgeschlossen (6/6 Tasks)

## Referenzdokumente

- `docs/prd.md` — Product Requirements Document (Tech Architecture, Data Model, API Spec, Design System, Auth)
- `docs/product-vision.md` — Vision, Personas, Wettbewerb, Design Direction
- `docs/product-roadmap.md` — Alle Tasks nach Phasen, Checkbox-Tracking
