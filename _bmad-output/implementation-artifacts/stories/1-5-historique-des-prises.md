---
story_key: 1-5-historique-des-prises
status: review
baseline_commit: NO_VCS
---

# Story 1.5 : Consulter l'historique des prises

## Story

**As a** utilisateur,
**I want** voir la liste de mes prises passées,
**So that** je peux les retrouver pour les corriger ou les consulter (FR8).

## Acceptance Criteria

- **AC1** — J'ouvre la vue historique et je vois mes entrées triées de la plus récente à la plus ancienne.
- **AC2** — Je peux sélectionner une entrée de la liste pour ouvrir son détail (lien vers `/entrees/[id]`).

## Tasks / Subtasks

- [x] **T1** — tRPC `entries.list`
  - [x] T1.1 — `entries.list` ajouté dans `routers/entries.ts` (query, `SELECT * ORDER BY timestamp DESC` via `desc(entries.timestamp)`)

- [x] **T2** — Composant `EntryList`
  - [x] T2.1 — Créé `src/components/features/entry-history/EntryList.tsx`
  - [x] T2.2 — Chaque item : date/heure (`Intl.DateTimeFormat fr-FR`), condition label, description (tronquée), calories, indicateur 📷
  - [x] T2.3 — Chaque item = `<Link href="/entrees/[id]">`
  - [x] T2.4 — États isPending / isError / liste vide gérés

- [x] **T3** — Page `/historique`
  - [x] T3.1 — `src/app/historique/page.tsx` remplacé, utilise `EntryList`

- [x] **T4** — Navigation
  - [x] T4.1 — `src/components/ui/Nav.tsx` créé (liens Saisie / Historique, lien actif mis en évidence via `usePathname`)
  - [x] T4.2 — `Nav` intégré dans `src/app/layout.tsx`

- [x] **T5** — Validation
  - [x] T5.1 — `pnpm typecheck` : ✅ 0 erreur
  - [x] T5.2 — `pnpm build` : ✅ 9 routes, 0 erreur

## Dev Notes

- `entries.list` : import `desc` depuis `drizzle-orm` pour le tri
- `EntryList` : client component — `usePathname` dans Nav exige aussi `"use client"`
- Formatage date : `Intl.DateTimeFormat("fr-FR", {...})` — natif, zéro dépendance
- La page `/entrees/[id]` pointe vers le stub existant (Story 1.6 l'implémente)

## Dev Agent Record

### Implementation Plan

1. `entries.list` query avec `desc(entries.timestamp)` (import Drizzle)
2. `EntryList` : client component avec états loading/error/empty + items cliquables
3. `/historique/page.tsx` : server component qui rend `EntryList`
4. `Nav` : client component (besoin de `usePathname`), rendu dans le layout root

### Debug Log

_(aucun problème)_

### Completion Notes

- ✅ `entries.list` query antéchronologique opérationnelle
- ✅ `EntryList` : 4 états (loading, error, vide, données), items complets avec lien
- ✅ `Nav` persistant dans toutes les pages via `layout.tsx`, lien actif distinct
- ✅ TypeScript strict, build 9 routes sans erreur

## File List

### Nouveaux fichiers
- `pacal/src/components/features/entry-history/EntryList.tsx`
- `pacal/src/components/ui/Nav.tsx`

### Fichiers modifiés
- `pacal/src/server/api/routers/entries.ts` (ajout `list` query)
- `pacal/src/app/historique/page.tsx` (stub → page réelle)
- `pacal/src/app/layout.tsx` (ajout `Nav`)

## Change Log

- **2026-06-19** — Story 1.5 implémentée : `entries.list`, `EntryList`, page historique, nav globale — build ✅

## Status

review
