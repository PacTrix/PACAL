---
story_key: 1-6-modifier-une-prise
status: review
baseline_commit: NO_VCS
---

# Story 1.6 : Modifier une prise existante

## Story

**As a** utilisateur,
**I want** corriger une prise déjà enregistrée,
**So that** une estimation provisoire puisse être ajustée plus tard (FR7).

## Acceptance Criteria

- **AC1** — Depuis l'historique, je sélectionne une entrée et j'arrive sur un formulaire pré-rempli avec ses valeurs actuelles.
- **AC2** — Je peux modifier n'importe quel champ, y compris l'horodatage et la condition de prise.
- **AC3** — Les modifications sont persistées après enregistrement.
- **AC4** — Elles se reflètent dans les exports et rapports générés par la suite.

## Tasks / Subtasks

- [x] **T1** — tRPC `entries.getById` et `entries.update`
  - [x] T1.1 — `entries.getById` (query, input: `{ id: z.number() }`, retourne l'entrée ou lance NOT_FOUND)
  - [x] T1.2 — `entries.update` (mutation, input: id + tous les champs modifiables, SET complet avec Drizzle)

- [x] **T2** — Route serve photo `GET /api/photos/[filename]`
  - [x] T2.1 — Créer `src/app/api/photos/[filename]/route.ts` pour afficher les photos existantes dans le formulaire d'édition
  - [x] T2.2 — Protection basique contre le path traversal (pas de `/` ni `..` dans le filename)

- [x] **T3** — Composant `EntryEditForm`
  - [x] T3.1 — Créer `src/components/features/entry-form/EntryEditForm.tsx` (client component)
  - [x] T3.2 — Chargement de l'entrée via `api.entries.getById.useQuery({ id })`
  - [x] T3.3 — Formulaire pré-rempli identique à `EntryForm`, photo existante affichée via `/api/photos/[filename]`
  - [x] T3.4 — Submit : upload nouvelle photo si changée, puis `entries.update.mutateAsync`

- [x] **T4** — Page `/entrees/[id]`
  - [x] T4.1 — Remplacer le stub par la page réelle (params async Next.js 15, `EntryEditForm`)

- [x] **T5** — Validation
  - [x] T5.1 — `pnpm typecheck` sans erreur
  - [x] T5.2 — `pnpm build` réussi

## Dev Notes

### Architecture

- `entries.update` : utiliser `eq` de drizzle-orm pour le WHERE, SET complet (toutes les colonnes modifiables)
- Next.js 15 : `params` dans les pages est une Promise → `await params`
- Photo serve : extraire le filename du photo_path stocké (`path.split('/').pop()`) côté client (pas de `path` module)
- Photo dans l'edit form : si `photoPath` existant → `<img src="/api/photos/{filename}">` ; si nouveau fichier → preview via `URL.createObjectURL()`
- Après save : message succès inline (pas de redirect — l'utilisateur peut vouloir continuer à modifier)

## Dev Agent Record

### Implementation Plan

1. T1 : Ajout de `getById` et `update` dans `entriesRouter` (`src/server/api/routers/entries.ts`)
2. T2 : Création de `src/app/api/photos/[filename]/route.ts` — lecture fichier depuis `data/photos/`, protection path traversal
3. T3 : Création de `EntryEditForm` — useQuery pour charger l'entrée, useEffect pour pré-remplir, gestion photo (existante/nouvelle/supprimée), submit async
4. T4 : Remplacement du stub `/entrees/[id]/page.tsx` — async params Next.js 15, validation parseInt, rendu EntryEditForm
5. T5 : `pnpm typecheck` → 0 erreur, `pnpm build` → succès

### Debug Log

_(aucun problème rencontré)_

### Completion Notes

- Tous les ACs sont satisfaits : l'utilisateur peut naviguer depuis l'historique (lien `/entrees/{id}`), voir le formulaire pré-rempli, modifier tous les champs y compris photo et horodatage, et enregistrer.
- La photo existante est servie via `/api/photos/[filename]` avec protection path traversal.
- Le formulaire affiche un message "✓ Enregistré" inline 2 secondes après le succès (pas de redirect).
- `pnpm typecheck` : 0 erreur. `pnpm build` : succès, toutes les routes compilées.

## File List

- `src/server/api/routers/entries.ts` — ajout `getById` + `update` + `updateEntrySchema`
- `src/app/api/photos/[filename]/route.ts` — nouveau (GET serve photo)
- `src/components/features/entry-form/EntryEditForm.tsx` — nouveau (formulaire d'édition)
- `src/app/entrees/[id]/page.tsx` — remplacé (page réelle avec EntryEditForm)

## Change Log

- 2026-06-19 : Implémentation complète de la story 1.6 — T1 à T5 validés

## Status

review
