---
paths:
  - "src/**"
---

# Coding-Regeln

## Sprache

- **UI-Texte:** Deutsch (alle Labels, Buttons, Fehlermeldungen, Platzhalter)
- **Code:** Englisch (Variablen, Funktionen, Kommentare, Commit Messages)

## Code-Stil

- `cn()` aus `src/lib/utils.ts` fuer className-Merging (clsx + tailwind-merge)
- TypeScript Interfaces fuer DB-Entities in `src/lib/types.ts`
- Konstanten in `src/lib/constants.ts`
- Komponenten als named exports, nicht default exports (Ausnahme: Pages)
- `forwardRef` fuer UI-Primitives (Button, Input, Select)
- Design Tokens ueber Tailwind-Klassen nutzen (z.B. `text-primary`, `bg-error-light`), nicht raw Hex-Werte
