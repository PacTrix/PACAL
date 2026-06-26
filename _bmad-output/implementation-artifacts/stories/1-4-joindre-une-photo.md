---
story_key: 1-4-joindre-une-photo
status: review
baseline_commit: NO_VCS
---

# Story 1.4 : Joindre une photo à une prise

## Story

**As a** utilisateur,
**I want** attacher une photo à une prise, en la prenant sur le moment ou en choisissant une photo existante,
**So that** je garde un souvenir visuel de la prise (FR5).

## Acceptance Criteria

- **AC1** — Sur le formulaire de saisie, je peux déclencher la caméra pour prendre une photo et l'attacher à l'entrée.
- **AC2** — Je peux alternativement choisir une photo existante depuis la galerie, avec le même résultat.
- **AC3** — Une entrée sans photo reste valide (photo optionnelle).
- **AC4** — Attacher une nouvelle photo à une entrée en cours de saisie remplace la précédente (pas d'ajout multiple).
- **AC5** — La colonne `photo_path` est ajoutée à la table `entries` par une migration Drizzle dédiée à cette story.

## Tasks / Subtasks

- [x] **T1** — Migration Drizzle `photo_path`
  - [x] T1.1 — Ajouter `photoPath: d.text()` (nullable) à `entries` dans `schema.ts`
  - [x] T1.2 — Générer la migration `drizzle/0001_luxuriant_lady_ursula.sql` (`ALTER TABLE ... ADD COLUMN "photo_path" text`)

- [x] **T2** — Route API upload photo
  - [x] T2.1 — Créer `src/app/api/photos/route.ts` (POST multipart/form-data)
  - [x] T2.2 — Sauvegarde dans `data/photos/` (dev) / `/data/photos/` (prod), nommé `{ISO-ts}_{random}.{ext}`
  - [x] T2.3 — Retourne `{ path: string }` (chemin absolu)

- [x] **T3** — Mise à jour routeur `entries`
  - [x] T3.1 — `photoPath: z.string().optional()` ajouté au `createEntrySchema`
  - [x] T3.2 — `photoPath` passé à l'insert Drizzle

- [x] **T4** — Mise à jour `EntryForm`
  - [x] T4.1 — Deux `<input type="file">` cachés : `capture="environment"` (caméra) + sans capture (galerie)
  - [x] T4.2 — Prévisualisation avec `URL.createObjectURL()`, boutons "Changer" / "Retirer"
  - [x] T4.3 — `handlePhotoChange` révoque l'URL précédente avant d'en créer une nouvelle
  - [x] T4.4 — Submit async : upload via `POST /api/photos`, puis `mutateAsync` avec `photoPath`

- [x] **T5** — Validation
  - [x] T5.1 — `pnpm typecheck` : ✅ 0 erreur TypeScript
  - [x] T5.2 — `pnpm build` : ✅ 9 routes, 0 erreur

## Dev Notes

### Architecture

- tRPC ne gère pas multipart → route Next.js séparée `POST /api/photos` (stdlib `fs/promises`, `path`)
- Aucune dépendance nouvelle
- Photos : `{cwd}/data/photos/` (dev, NODE_ENV≠production) / `/data/photos/` (prod Docker)
- `photo_path` stocke le chemin absolu (route de serving à implémenter si besoin en Story 1.5/1.6)
- Preview côté client uniquement via `URL.createObjectURL()` — pas de round-trip serveur pour la preview

## Dev Agent Record

### Implementation Plan

1. Ajout `photoPath` au schéma Drizzle → migration `ALTER TABLE ADD COLUMN`
2. Route `POST /api/photos` : validation type MIME, nommage `{ISO-timestamp}_{random}.{ext}`, `mkdir -p`, `writeFile`
3. `createEntrySchema` : ajout `photoPath: z.string().optional()`
4. `EntryForm` : deux inputs cachés (refs), handlePhotoChange avec révocation URL, submit async (upload puis mutateAsync)

### Debug Log

_(aucun problème rencontré)_

### Completion Notes

- ✅ Migration `0001_luxuriant_lady_ursula.sql` : `ALTER TABLE "pacal_entry" ADD COLUMN "photo_path" text`
- ✅ Route `/api/photos` : valide le type MIME, génère un nom unique, sauvegarde en stdlib pure
- ✅ `createEntrySchema` étendu avec `photoPath`
- ✅ `EntryForm` : deux boutons distincts (caméra / galerie), preview inline, remplacement propre avec révocation URL objet
- ✅ Pas de fuite mémoire : URL révoquées au changement et au reset post-submit
- ✅ TypeScript strict sans erreur, build production 9 routes

## File List

### Nouveaux fichiers
- `pacal/src/app/api/photos/route.ts`
- `pacal/drizzle/0001_luxuriant_lady_ursula.sql`
- `pacal/drizzle/meta/0001_snapshot.json` (généré par drizzle-kit)

### Fichiers modifiés
- `pacal/src/server/db/schema.ts` (ajout `photoPath`)
- `pacal/src/server/api/routers/entries.ts` (ajout `photoPath` dans schema + insert)
- `pacal/src/components/features/entry-form/EntryForm.tsx` (section photo complète)
- `pacal/drizzle/meta/_journal.json` (mis à jour par drizzle-kit)

## Change Log

- **2026-06-19** — Story 1.4 implémentée : migration `photo_path`, route upload `/api/photos`, EntryForm avec caméra + galerie + preview — build ✅

## Status

review
