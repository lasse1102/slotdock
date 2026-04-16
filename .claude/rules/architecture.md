# Architektur-Entscheidungen

- **Tailwind v4:** Konfiguration ueber `@theme inline` in `globals.css`, NICHT ueber `tailwind.config.ts`
- **Supabase Client:** Browser-Client (`src/lib/supabase/client.ts`) und Server-Client (`src/lib/supabase/server.ts`) ueber `@supabase/ssr` — NICHT `@supabase/auth-helpers`
- **Middleware:** `middleware.ts` liegt im Projekt-Root (nicht in `src/`). Schuetzt alle Routen ausser: `/`, `/login`, `/signup`, `/book/*`, `/callback`
- **Fonts:** Inter + JetBrains Mono via `next/font/google` in `layout.tsx` — KEIN CSS `@import` fuer Google Fonts (bricht Tailwind v4)
- **RLS:** Row Level Security ist auf allen Tabellen aktiv. Oeffentliche Booking-Inserts laufen ueber API-Routes mit Service Role Key
- **Kein Dark Mode** in v1

## Projektstruktur

```
slotdock/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Signup, Callback
│   │   ├── (dashboard)/     # Geschuetzter Bereich mit Sidebar-Layout
│   │   ├── (public)/        # Oeffentliche Buchungsseite
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
