---
id: "2.4"
title: "Persistance des données OpenFoodFacts et signalement des fiches incomplètes"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-40", "FR-41"]
dependencies: ["2.2"]
baseline_commit: "175b5eb8eb8af24b499085da7e4f785078503443"
---

# Story 2.4 : Persistance des données OpenFoodFacts et signalement des fiches incomplètes

## User Story

As a utilisateur,
I want que les données OpenFoodFacts soient sauvegardées avec chaque entrée et que les fiches dont l'enrichissement a échoué soient signalées dans mon historique,
So que je puisse les identifier et les corriger ultérieurement (FR-40, FR-41).

## Acceptance Criteria

**Given** qu'un enrichissement OpenFoodFacts réussi a été appliqué au formulaire
**When** j'enregistre l'entrée
**Then** les champs `barcode`, `nutriscore`, `nova`, `greenscore`, `kcalPer100g`, `kcalPerPortion` sont persistés en base
**And** `ofIncomplete` est `false` (ou null)
**And** ces champs apparaissent dans l'export CSV

**Given** qu'un scan a été lancé mais OpenFoodFacts a échoué (`ofIncomplete = true`)
**When** l'entrée apparaît dans la liste historique
**Then** un triangle orange ⚠ est visible sur cette ligne (non intrusif, inline)
**And** le triangle disparaît une fois que l'édition de l'entrée aboutit à un enrichissement réussi

**Given** qu'une entrée n'a pas de code-barres
**When** elle apparaît dans l'historique
**Then** aucun triangle ⚠ n'est affiché

**And** la migration `0004` cumule les 7 colonnes V2 (déjà créée en story 2.1)
**And** les champs DB sont déjà déclarés dans schema.ts (story 2.1) et les routes tRPC les reçoivent (story 2.2)

## Notes techniques

### Persistance (déjà faite en stories 2.1/2.2)
- Les colonnes DB existent (migration 0004)
- Les champs Drizzle existent dans schema.ts
- Les schémas Zod create/update dans entries.ts incluent les 6 champs OFF
- Les formulaires transmettent offData dans mutateAsync

### Signalement dans l'historique (à implémenter)
- Dans le composant liste des entrées, pour chaque entrée où `ofIncomplete === true` ET `barcode` non null : afficher un `⚠` orange inline
- Composant : `src/app/_components/EntryList.tsx` ou équivalent
- Badge : `<span title="Enrichissement OFF incomplet">⚠</span>` avec `text-orange-500 text-xs`

### Export CSV (à vérifier)
- Vérifier que les colonnes OFF sont incluses dans l'export CSV existant
- Fichier probable : `src/app/api/export/route.ts` ou `src/server/api/routers/entries.ts`

### ⚠️ Mapping Drizzle → SQL rappel
- `kcalPer100g` → `kcal_per100g` (migration 0004 déjà correcte)

## Tasks/Subtasks

- [x] T1 : Vérifier que la persistance fonctionne end-to-end (lire schema, routes, mutations — confirmer aucune lacune)
- [x] T2 : Ajouter le badge ⚠ orange dans la liste historique pour les entrées `ofIncomplete = true`
- [x] T3 : Vérifier/compléter l'export CSV avec les colonnes OFF
- [x] T4 : Build TypeScript + vérification aucune régression

## Dev Agent Record

### Implementation Plan

T1 : Audit de la persistance — colonnes DB (migration 0004), champs Drizzle (schema.ts), schémas Zod (entries.ts), mutations create/update. Tout était déjà en place grâce aux stories 2.1/2.2. T2 : Badge ⚠ orange dans `EntryList.tsx` — condition `ofIncomplete && barcode` (le triangle ne s'affiche que pour les scans échoués, pas l'absence de barcode). T3 : Export CSV — ajout de 7 colonnes OFF dans le header et les lignes de données (barcode, nutriscore, nova, greenscore, kcal_per100g, kcal_per_portion, of_incomplete).

### Debug Log

Aucun incident.

### Completion Notes

- Persistance DB : déjà complète via stories 2.1/2.2 — aucune modification de schema ou routes nécessaire.
- Badge ⚠ : `EntryList.tsx` — affiché uniquement si `ofIncomplete === true` ET `barcode` non null.
- Export CSV : `route.ts` — 7 nouvelles colonnes OFF ajoutées, of_incomplete exporté en 0/1.
- Build TypeScript : ✅ zéro erreur.

## File List

- `pacal/src/components/features/entry-history/EntryList.tsx` (modifié — badge ⚠)
- `pacal/src/app/api/export/route.ts` (modifié — colonnes OFF dans CSV)

## Change Log

- 2026-06-28 : Story 2.4 implémentée — badge ⚠ dans l'historique pour fiches OFF incomplètes, export CSV enrichi avec 7 colonnes V2.
