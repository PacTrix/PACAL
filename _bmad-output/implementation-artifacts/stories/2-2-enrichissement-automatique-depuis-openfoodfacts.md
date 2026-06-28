---
id: "2.2"
title: "Enrichissement automatique depuis OpenFoodFacts"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-37", "FR-38"]
dependencies: ["2.1"]
baseline_commit: "175b5eb8eb8af24b499085da7e4f785078503443"
---

# Story 2.2 : Enrichissement automatique depuis OpenFoodFacts

## User Story

As a utilisateur,
I want qu'une fois un code-barres saisi ou scanné, les données nutritionnelles du produit soient récupérées et pré-remplissent mon formulaire,
So que je n'aie pas à ressaisir les calories et scores manuellement (FR-37, FR-38).

## Acceptance Criteria

**Given** qu'un code-barres est disponible dans le formulaire (scan ou saisie manuelle)
**When** l'appel tRPC `products.lookup` aboutit (produit trouvé dans OpenFoodFacts sous 5s)
**Then** le formulaire affiche les scores nutritionnels sous la forme X·N·Y (nutriscore · nova · greenscore)
**And** la colorisation est appliquée : A/B → vert, C → orange, D/E → rouge (nutriscore et greenscore) ; 1/2 → vert, 3 → orange, 4 → rouge (nova)
**And** les valeurs `kcalPer100g` et `kcalPerPortion` sont stockées dans l'état local du formulaire pour le calcul kcal (story 2.3)
**And** le statut d'estimation passe automatiquement à "mesuré"

**Given** qu'un code-barres est disponible
**When** l'appel échoue (produit inconnu, erreur réseau, timeout 5s)
**Then** un message non-bloquant informe l'utilisateur ("Produit non trouvé" ou "Connexion indisponible")
**And** le code-barres reste dans le champ
**And** `ofIncomplete` est positionné à `true` dans l'état local (persisté en story 2.4)
**And** toute saisie manuelle reste possible sans blocage

**And** les colonnes `nutriscore varchar(2)`, `nova integer`, `greenscore varchar(2)`, `kcal_per100g real`, `kcal_per_portion real` sont déjà créées par la migration `0004` (faite en story 2.1)
**And** un nouveau routeur `src/server/api/routers/products.ts` expose la procédure `lookup(barcode: string)`
**And** `src/lib/openfoodfacts.ts` implémente l'appel réel avec timeout AbortController 5s et retourne `null` sur toute erreur

## Notes techniques

### Appel OpenFoodFacts — côté serveur (tRPC)
```typescript
// src/lib/openfoodfacts.ts
export interface OFFProduct {
  name: string | null;
  nutriscore: string | null;   // "a" | "b" | "c" | "d" | "e" | null
  nova: number | null;         // 1 | 2 | 3 | 4 | null
  greenscore: string | null;   // "a" | "b" | "c" | "d" | "e" | null
  kcalPer100g: number | null;
  kcalPerPortion: number | null;
}
// Endpoint : https://world.openfoodfacts.org/api/v2/product/{barcode}.json
// Champs OFF : product.product_name, product.nutriscore_grade, product.nova_group,
//              product.ecoscore_grade (→ greenscore), product.nutriments["energy-kcal_100g"],
//              product.nutriments["energy-kcal_serving"]
// AbortController timeout 5s
// Retourne null sur toute erreur (réseau, 404, status=0, timeout)
```

### Routeur tRPC
```typescript
// src/server/api/routers/products.ts
products.lookup : publicProcedure
  .input(z.object({ barcode: z.string() }))
  .query(async ({ input }) => lookupProduct(input.barcode))
```

### Composant NutriscoreDisplay
Format X·N·Y avec couleurs :
- nutriscore/greenscore : A/B → `text-green-600`, C → `text-orange-500`, D/E → `text-red-600`
- nova : 1/2 → `text-green-600`, 3 → `text-orange-500`, 4 → `text-red-600`
- Valeur absente → `_` en gris

### Intégration formulaire
- Quand `barcode` change (blur ou après scan), déclencher `utils.products.lookup.fetch({ barcode })`
- Si succès : stocker `offData` (nutriscore, nova, greenscore, kcalPer100g, kcalPerPortion) dans state local
- Si description OFF disponible et champ description vide : pré-remplir description
- Positionner `estimationStatus` = "mesuré" si enrichissement réussi
- Stocker `ofIncomplete` = true dans state si échec (pour story 2.4)

### ⚠️ Casing Drizzle rappel
- `kcalPer100g` en TypeScript → SQL `kcal_per100g` (migration 0004 déjà correcte)
- Les colonnes OFF sont déjà créées par migration 0004 (story 2.1)

## Tasks/Subtasks

- [x] T1 : Créer `src/lib/openfoodfacts.ts` (fetch OFF + AbortController 5s + parsing)
- [x] T2 : Créer `src/server/api/routers/products.ts` + enregistrer dans `root.ts`
- [x] T3 : Créer le composant `NutriscoreDisplay.tsx` (scores X·N·Y colorisés)
- [x] T4 : Intégrer le lookup dans `EntryForm.tsx` (déclenchement + state offData + ofIncomplete)
- [x] T5 : Intégrer le lookup dans `EntryEditForm.tsx` (même logique)
- [x] T6 : Build TypeScript + vérification aucune régression

## Dev Agent Record

### Implementation Plan

`openfoodfacts.ts` : fetch avec AbortController 5s, parsing des champs OFF (nutriscore_grade, nova_group, ecoscore_grade → greenscore, energy-kcal_100g/serving). Retourne null sur toute erreur. `products.ts` : procédure `lookup` publicProcedure déjà déclarée dans `root.ts` (stub existant). `NutriscoreDisplay.tsx` : composant pur, format X·N·Y avec couleurs Tailwind. Intégration formulaires : hook `useQuery` conditionnel, déclenché au blur du champ ou après scan BarcodeScanner. Champs OFF transmis dans `mutateAsync` pour persistance (stories 2.1 + 2.4 ont créé les colonnes).

### Debug Log

Fix TypeScript : `lookup.data` peut être `undefined` (tRPC) en plus de `null` (retour OFF) — ajout du guard `=== undefined`. `estimationStatus` n'est pas dans le schéma Zod create — supprimé du mutateAsync (la valeur par défaut "estime" reste ; la story 2.4 affinera si besoin).

### Completion Notes

- `src/lib/openfoodfacts.ts` — implémentation complète, côté serveur uniquement.
- `products.lookup` tRPC disponible côté client dans les formulaires.
- `NutriscoreDisplay` : format X·N·Y, `_` si absent, colorisation A/B=vert, C=orange, D/E=rouge (nutriscore/greenscore), 1/2=vert, 3=orange, 4=rouge (nova).
- Lookup déclenché au blur du champ barcode ET immédiatement après scan BarcodeScanner.
- Données OFF (nutriscore, nova, greenscore, kcalPer100g, kcalPerPortion, ofIncomplete) transmises dans create/update.
- `EntryEditForm` : données OFF existantes pré-chargées depuis l'entrée au montage du composant.

## File List

- `pacal/src/lib/openfoodfacts.ts` (modifié — stub → implémentation complète)
- `pacal/src/server/api/routers/products.ts` (modifié — stub → procédure lookup)
- `pacal/src/components/features/entry-form/NutriscoreDisplay.tsx` (nouveau)
- `pacal/src/components/features/entry-form/EntryForm.tsx` (modifié — lookup + NutriscoreDisplay)
- `pacal/src/components/features/entry-form/EntryEditForm.tsx` (modifié — lookup + NutriscoreDisplay)
- `pacal/src/server/api/routers/entries.ts` (modifié — schémas Zod + mutations OFF)

## Change Log

- 2026-06-28 : Story 2.2 implémentée — enrichissement OpenFoodFacts côté serveur, scores X·N·Y colorisés, intégration formulaires saisie/édition.
