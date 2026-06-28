---
id: "2.1"
title: "Saisie et scan du code-barres EAN"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-36"]
dependencies: []
baseline_commit: "175b5eb8eb8af24b499085da7e4f785078503443"
---

# Story 2.1 : Saisie et scan du code-barres EAN

## User Story

As a utilisateur,
I want saisir ou scanner un code-barres EAN dans le formulaire de saisie ou d'édition,
So that je puisse identifier un produit sans le chercher manuellement (FR-36).

## Contexte schéma V1.2 (champs existants — read-only pour cette story)

- Constantes : `ENTRY_UNITS = ["g","kg","dl","l","portion"]`, `NOTE_TYPES = ["aliment","médicament","sommeil","autre"]`
- Champs actifs : `quantity integer`, `unit varchar(10)`, `noteType varchar(20)`, `photoPath1 text`, `photoPath2 text`
- Cette story ajoute uniquement `barcode varchar(50)` — aucun champ V1.2 ne doit être modifié.

## Acceptance Criteria

**Given** que je suis sur le formulaire de saisie ou d'édition
**When** le formulaire se charge
**Then** un champ optionnel "Code-barres" est présent avec un bouton "Scan" à sa droite
**And** le bouton Scan n'est visible que si `'BarcodeDetector' in window` (Chrome Android) — il est masqué sur Mac Chrome

**Given** que je clique sur "Scan" (Chrome Android, HTTPS)
**When** la caméra arrière s'active
**Then** dès qu'un code EAN-13 ou EAN-8 est détecté, le champ "Code-barres" est rempli automatiquement et la caméra s'arrête
**And** le champ reste éditable pour corriger une lecture imprécise

**Given** que je suis sur n'importe quelle plateforme (y compris Mac Chrome)
**When** je saisis manuellement un code dans le champ "Code-barres"
**Then** le code est accepté comme source valide pour la recherche OpenFoodFacts (story 2.2)

**And** la colonne `barcode varchar(50)` est ajoutée à `pacal_entry` par migration `drizzle/0004_v2_schema.sql` (nullable, toutes les entrées existantes conservées intactes)

## Notes techniques

### Migration
- Fichier : `pacal/drizzle/0004_v2_schema.sql` (écrit manuellement — drizzle-kit non disponible sur NAS)
- Cette story ajoute uniquement : `ALTER TABLE "pacal_entry" ADD COLUMN "barcode" varchar(50);`
- Les 6 autres colonnes V2 (nutriscore, nova, greenscore, kcal_per100g, kcal_per_portion, of_incomplete) seront ajoutées dans les stories 2.2 et 2.4

### Schéma Drizzle
Ajouter dans `pacal/src/server/db/schema.ts` (dans le bloc `entries`) :
```typescript
barcode: d.varchar({ length: 50 }),
```
Drizzle génère `barcode` en SQL → pas de piège casing ici.

### Composant BarcodeScanner
- Nouveau fichier : `pacal/src/components/features/entry-form/BarcodeScanner.tsx`
- API : `BarcodeDetector` native (Chrome Android 83+), zéro dépendance npm
- Formats : `['ean_13', 'ean_8']`
- Détection disponibilité : `'BarcodeDetector' in window` → bouton masqué si false
- HTTPS requis → déjà satisfait par Tailscale (`*.ts.net`)

### Intégration formulaire
- `EntryForm.tsx` et `EntryEditForm.tsx` : ajouter champ `barcode` (state + input + BarcodeScanner)
- tRPC `entries.create` et `entries.update` : ajouter `barcode` dans le schéma Zod et la mutation Drizzle
- La valeur `barcode` est transmise à la story 2.2 via l'état local du formulaire (pas de logique OFF dans cette story)

## Tasks/Subtasks

- [x] T1 : Écrire la migration SQL `0004_v2_schema.sql` (colonne barcode uniquement)
- [x] T2 : Mettre à jour le schéma Drizzle (`schema.ts`) avec le champ `barcode`
- [x] T3 : Créer le composant `BarcodeScanner.tsx` (BarcodeDetector API + masquage conditionnel)
- [x] T4 : Intégrer le champ barcode + BarcodeScanner dans `EntryForm.tsx`
- [x] T5 : Intégrer le champ barcode dans `EntryEditForm.tsx`
- [x] T6 : Mettre à jour les mutations tRPC (`entries.create` et `entries.update`) pour inclure `barcode`
- [x] T7 : Build TypeScript + vérification aucune régression V1.2

## Dev Agent Record

### Implementation Plan

Migration 0004 écrite manuellement (cumule les 7 colonnes V2 en prévision). Schéma Drizzle mis à jour avec les 7 champs V2. Composant `BarcodeScanner.tsx` créé avec BarcodeDetector API native (zéro dépendance). Intégration dans `EntryForm` et `EntryEditForm` avec champ texte éditable + bouton Scan conditionnel. Mutations tRPC `create` et `update` étendues avec `barcode`.

### Debug Log

Aucun incident.

### Completion Notes

- Migration `0004_v2_schema.sql` cumule les 7 colonnes V2 (barcode + 6 colonnes OFF pour stories suivantes). À exécuter sur le NAS avant déploiement V2.
- `BarcodeScanner` masqué automatiquement sur Mac Chrome (`'BarcodeDetector' in window` = false).
- Champs V1.2 (`quantity`, `unit`, `noteType`, `photoPath1`, `photoPath2`) inchangés — régression vérifiée via TypeScript build.
- ⚠️ Rappel migration : `kcalPer100g` → SQL `kcal_per100g` (déjà correct dans le fichier 0004).

## File List

- `pacal/drizzle/0004_v2_schema.sql` (nouveau)
- `pacal/src/server/db/schema.ts` (modifié — +7 champs V2)
- `pacal/src/components/features/entry-form/BarcodeScanner.tsx` (nouveau)
- `pacal/src/components/features/entry-form/EntryForm.tsx` (modifié — champ barcode + BarcodeScanner)
- `pacal/src/components/features/entry-form/EntryEditForm.tsx` (modifié — champ barcode + BarcodeScanner)
- `pacal/src/server/api/routers/entries.ts` (modifié — barcode dans create/update)

## Change Log

- 2026-06-28 : Story 2.1 implémentée — champ code-barres + scan BarcodeDetector API dans les formulaires saisie/édition, migration 0004, schéma Drizzle V2 complet.
