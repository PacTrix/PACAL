---
story_key: 1-8-rapport-pdf
status: review
baseline_commit: NO_VCS
---

# Story 1.8 : Générer un rapport PDF pour une consultation

## Story

**As a** utilisateur,
**I want** générer un rapport PDF de mes prises sur une période,
**So that** je peux le présenter à mon diététicien sans reconstitution manuelle (FR10, FR11, FR12).

## Acceptance Criteria

- **AC1** — Je peux choisir une période et générer un rapport PDF depuis la page `/rapport`.
- **AC2** — Le PDF regroupe les entrées jour par jour.
- **AC3** — Les entrées sans valeurs nutritionnelles apparaissent au même titre que les autres (FR11).
- **AC4** — Une journée sans entrée alimentaire riche produit une section lisible, pas une section vide ou cassée.
- **AC5** — Chaque valeur poids/calories est visuellement marquée comme estimée ou mesurée (FR12).

## Tasks / Subtasks

- [x] **T1** — Installer `@react-pdf/renderer`

- [x] **T2** — `src/lib/pdf.tsx` — composant PDF
  - [x] T2.1 — `RapportPDF` component : titre, sous-titre période, sections par jour
  - [x] T2.2 — Chaque entrée : heure, contexte, description, poids+calories avec badge E/M, note, indicateur photo
  - [x] T2.3 — Badge vert "M" (mesuré) vs gris "E" (estimé)

- [x] **T3** — Route Handler `GET /api/rapport`
  - [x] T3.1 — Query params `from` et `to` (ISO dates)
  - [x] T3.2 — Requête DB, tri par timestamp asc
  - [x] T3.3 — `renderRapport()` → `Uint8Array` → `NextResponse` PDF avec `Content-Disposition`

- [x] **T4** — Page `/rapport`
  - [x] T4.1 — Sélecteurs `from` / `to` (datetime-local), bouton "Générer le rapport"
  - [x] T4.2 — `window.location.href` vers `/api/rapport?from=...&to=...`

- [x] **T5** — Ajouter "Rapport" dans la Nav

- [x] **T6** — `next.config.js` : `serverExternalPackages: ["@react-pdf/renderer"]`

- [x] **T7** — Validation
  - [x] T7.1 — `pnpm typecheck` sans erreur
  - [x] T7.2 — `pnpm build` réussi

## Dev Notes

### Architecture

- `@react-pdf/renderer` : bibliothèque JSX→PDF server-side (pas de headless Chrome)
- `serverExternalPackages: ["@react-pdf/renderer"]` requis dans `next.config.js` pour éviter le bundling Next.js
- `renderToBuffer()` retourne un `Buffer` Node.js → converti en `Uint8Array` pour `NextResponse`
- JSX dans `pdf.tsx` uniquement — `renderRapport(items, from, to)` exporté pour que le route handler `.ts` reste sans JSX
- Groupement par jour : `toLocaleDateString("fr-FR", { weekday:"long", ... })` sur le timestamp
- FR12 : badge "M" vert (`#059669`) pour mesuré, badge "E" gris (`#9ca3af`) pour estimé
- Conflit `pdf.ts` vs `pdf.tsx` : TypeScript résout `.ts` avant `.tsx` → stub `pdf.ts` supprimé

## Dev Agent Record

### Implementation Plan

1. T1 : `pnpm add @react-pdf/renderer`
2. T6 : Ajout de `serverExternalPackages: ["@react-pdf/renderer"]` dans `next.config.js`
3. T2 : `src/lib/pdf.tsx` — composant `RapportPDF` + fonction `renderRapport()` (JSX isolé dans `.tsx`)
4. T3 : `src/app/api/rapport/route.ts` — appel `renderRapport()`, `new Uint8Array(buffer)` pour `NextResponse`
5. T4 : `src/app/rapport/page.tsx` — client component, datetime-local, `window.location.href`
6. T5 : Ajout du lien "Rapport" dans `Nav.tsx`
7. T7 : `pnpm typecheck` → 0 erreur, `pnpm build` → succès

### Debug Log

- **Conflit `pdf.ts` vs `pdf.tsx`** : TypeScript résolvait `~/lib/pdf` vers le stub vide `pdf.ts`. Fix : suppression de `pdf.ts`.
- **Type JSX dans route handler `.ts`** : `React.createElement(RapportPDF, ...)` retourne `CElement` incompatible avec le type attendu par `renderToBuffer`. Fix : export de `renderRapport()` depuis `pdf.tsx` (JSX dans le `.tsx`, handler sans JSX).
- **`Buffer` non assignable à `BodyInit`** : Fix : `new Uint8Array(buffer)` pour la réponse.

### Completion Notes

- Tous les ACs sont satisfaits.
- Le PDF est généré entièrement côté serveur sans headless browser.
- Toutes les entrées apparaissent (avec ou sans nutrition), groupées par jour.
- Badge "M" vert / "E" gris sur chaque valeur poids/calories.
- `pnpm typecheck` : 0 erreur. `pnpm build` : succès.

## File List

- `src/lib/pdf.tsx` — nouveau (remplace le stub `pdf.ts`) — composant `RapportPDF` + `renderRapport()`
- `src/lib/pdf.ts` — supprimé (stub vide)
- `src/app/api/rapport/route.ts` — nouveau (GET Route Handler rapport PDF)
- `src/app/rapport/page.tsx` — remplacé (page rapport avec sélecteur période)
- `src/components/ui/Nav.tsx` — mis à jour (ajout lien Rapport)
- `next.config.js` — mis à jour (`serverExternalPackages`)
- `package.json` / `pnpm-lock.yaml` — `@react-pdf/renderer` ajouté

## Change Log

- 2026-06-19 : Implémentation complète de la story 1.8 — T1 à T7 validés

## Status

review
