---
id: "2.bugfix2"
title: "Corrections round 2 : scanner toujours visible + calcul portions"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-36", "FR-39"]
dependencies: ["2.6"]
baseline_commit: "1899bab"
---

# Story 2.bugfix2 : Corrections round 2 — scanner et portions

## User Story

As a utilisateur,
I want que le bouton scanner soit toujours visible et que les kcal se calculent correctement pour les portions multiples,
So que je puisse scanner et calculer mes apports correctement.

## Acceptance Criteria

**Bug 1 — Scanner toujours masqué**
**Root cause :** `"BarcodeDetector" in window` renvoie `false` sur le navigateur de test → bouton masqué. Le comportement "cacher si non supporté" est contre-intuitif : l'utilisateur ne sait pas que la feature existe.
**Fix :** Le bouton "📷 Scan" est TOUJOURS affiché. Si BarcodeDetector n'est pas disponible au clic, un message d'erreur explicite s'affiche ("Scan non supporté par ce navigateur — utilisez Chrome Android").

**Bug 2 — Portions ignorent la quantité**
**Root cause :** `computeKcal` retourne `Math.floor(kcalPerPortion)` quelle que soit la quantité.
**Given** que j'ai un produit avec `kcalPerPortion = 123`
**When** je saisis `quantity = 2` et `unit = portion`
**Then** le champ kcal affiche `246` (2 × 123)
**And** si `quantity = 0.5`, kcal = `61` (floor de 0.5 × 123)
**Fix :** `Math.floor(quantity * kcalPerPortion)`

## Notes techniques

### Bug 1 — BarcodeScanner : toujours afficher le bouton
```typescript
// Supprimer la condition if (!canScan) return null
// Dans startScan(), si !canScan → setError("message") au lieu de démarrer
// Garder canScan pour adapter le message d'erreur
```

### Bug 2 — computeKcal : multiplier par la quantité
```typescript
if (unit === "portion") {
  return kcalPerPortion !== null ? Math.floor(quantity * kcalPerPortion) : null;
}
```

## Tasks/Subtasks

- [x] T1 : Corriger `computeKcal` dans `src/lib/kcal.ts` (multiplier kcalPerPortion par quantity)
- [x] T2 : Modifier `BarcodeScanner.tsx` — bouton toujours affiché, erreur au clic si non supporté
- [x] T3 : Mettre à jour `epics.md` (règle portions corrigée)
- [x] T4 : Build TypeScript + vérification aucune régression

## Dev Agent Record

### Implementation Plan

T1 : `computeKcal` — la règle "quantité ignorée pour `portion`" était incorrecte. L'utilisateur attend naturellement que 2 portions = 2 × kcalPerPortion. Fix : `Math.floor(quantity * kcalPerPortion)`. T2 : `BarcodeScanner` — supprimer `if (!canScan) return null` et ajouter un guard dans `startScan()` qui affiche un message d'erreur si BarcodeDetector n'est pas disponible. Le bouton est toujours rendu, permettant à l'utilisateur de savoir que la feature existe même sur un navigateur non supporté. T3 : `epics.md` — règle portions mise à jour.

### Debug Log

Aucun incident.

### Completion Notes

- `kcal.ts` : `Math.floor(quantity * kcalPerPortion)` — 2 portions × 123 kcal = 246.
- `BarcodeScanner` : bouton toujours visible ; si BarcodeDetector absent → message d'erreur au clic.
- `epics.md` : règle portions corrigée.
- Build TypeScript : ✅ zéro erreur.

## File List

- `pacal/src/lib/kcal.ts` (modifié — calcul portions × quantité)
- `pacal/src/components/features/entry-form/BarcodeScanner.tsx` (modifié — bouton toujours visible)
- `_bmad-output/planning-artifacts/epics.md` (modifié — règle portions)

## Change Log

- 2026-06-28 : Story 2.bugfix2 — calcul portions multiplié par quantité, bouton scanner toujours visible.
