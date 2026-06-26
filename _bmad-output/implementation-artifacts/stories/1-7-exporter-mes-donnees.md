---
story_key: 1-7-exporter-mes-donnees
status: review
baseline_commit: NO_VCS
---

# Story 1.7 : Exporter mes données

## Story

**As a** utilisateur,
**I want** exporter mes prises en CSV/Excel,
**So that** je peux les retravailler dans un tableur (FR9).

## Acceptance Criteria

- **AC1** — Je peux lancer un export depuis la page `/export`, avec ou sans filtre de période.
- **AC2** — Je reçois un fichier ZIP contenant `entries.csv` avec une ligne par entrée et tous ses champs (y compris `estimation_status`).
- **AC3** — Les photos sont fournies dans le ZIP sous `photos/`, nommées par horodatage, référencées par un champ `photo_file` dans le CSV.
- **AC4** — L'export fonctionne sans filtre (historique complet) et avec filtre de période.

## Tasks / Subtasks

- [x] **T1** — Installer `fflate` (création ZIP côté serveur)

- [x] **T2** — Route Handler `GET /api/export`
  - [x] T2.1 — Query params optionnels `from` et `to` (dates ISO)
  - [x] T2.2 — Requête DB : toutes les entrées dans la période, triées par timestamp
  - [x] T2.3 — Génération du CSV en mémoire (colonnes : id, timestamp, condition, description, weight_g, calories, estimation_status, note, photo_file)
  - [x] T2.4 — Lecture des fichiers photo depuis le filesystem, inclusion dans le ZIP sous `photos/`
  - [x] T2.5 — Réponse ZIP avec `Content-Disposition: attachment; filename="pacal-export.zip"`

- [x] **T3** — Page `/export`
  - [x] T3.1 — Remplacer le stub par la page réelle (client component)
  - [x] T3.2 — Formulaire avec `from` / `to` (datetime-local), bouton "Télécharger l'export"
  - [x] T3.3 — Le bouton construit l'URL `/api/export?from=...&to=...` et déclenche le téléchargement

- [x] **T4** — Ajouter "Export" dans la Nav

- [x] **T5** — Validation
  - [x] T5.1 — `pnpm typecheck` sans erreur
  - [x] T5.2 — `pnpm build` réussi

## Dev Notes

### Architecture

- Route Handler `GET /api/export` — lit la DB (Drizzle direct, pas tRPC) et le filesystem
- `fflate.zipSync()` pour créer le ZIP en mémoire (OK pour mono-utilisateur, volume faible)
- CSV généré manuellement (pas de lib) : BOM UTF-8 (`﻿`) pour compatibilité Excel
- Photo dans le ZIP : nom = `{timestamp_iso}.jpg` (remplace les `:` par `-` pour Windows)
- `photo_file` dans le CSV = le nom du fichier dans `photos/` (vide si pas de photo)
- Page export : client component avec état local pour from/to + `window.location` pour déclencher le téléchargement

## Dev Agent Record

### Implementation Plan

1. T1 : `pnpm add fflate`
2. T2 : Route Handler `src/app/api/export/route.ts` — query DB avec filtre optionnel, CSV en mémoire avec BOM UTF-8, photos lues du filesystem, ZIP via `fflate.zipSync()`
3. T3 : Page `/export` — client component, datetime-local pour from/to, `window.location.href` pour déclencher le téléchargement
4. T4 : Ajout du lien "Export" dans `Nav.tsx`
5. T5 : `pnpm typecheck` → 0 erreur, `pnpm build` → succès

### Debug Log

_(aucun problème rencontré)_

### Completion Notes

- Tous les ACs sont satisfaits.
- La page Export est accessible depuis la nav.
- Le ZIP contient `entries.csv` (avec BOM pour Excel) + `photos/` avec les fichiers photo nommés par timestamp ISO (`:` → `-` pour compatibilité Windows).
- Si une photo est manquante sur le disque, elle est silencieusement ignorée dans le ZIP (la référence CSV reste).
- `pnpm typecheck` : 0 erreur. `pnpm build` : succès.

## File List

- `src/app/api/export/route.ts` — nouveau (GET Route Handler export ZIP)
- `src/app/export/page.tsx` — remplacé (page export avec filtre période)
- `src/components/ui/Nav.tsx` — mis à jour (ajout lien Export)
- `package.json` / `pnpm-lock.yaml` — `fflate` ajouté

## Change Log

- 2026-06-19 : Implémentation complète de la story 1.7 — T1 à T5 validés

## Status

review
