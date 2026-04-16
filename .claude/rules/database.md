---
paths:
  - "supabase/**"
  - "src/lib/types.ts"
  - "src/app/api/**"
---

# Datenbank

- 6 Tabellen: `profiles`, `warehouses`, `docks`, `dock_schedules`, `bookings`, `subscriptions`
- `updated_at`-Trigger auf allen relevanten Tabellen
- Auto-Create Profile via Trigger bei neuem Auth User
- Booking-Token (UUID) pro Warehouse fuer oeffentlichen Buchungslink
