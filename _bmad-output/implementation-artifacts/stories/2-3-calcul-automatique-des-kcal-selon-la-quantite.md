---
id: "2.3"
title: "Calcul automatique des kcal selon la quantité"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-39"]
dependencies: ["2.2"]
baseline_commit: "175b5eb8eb8af24b499085da7e4f785078503443"
---

# Story 2.3 : Calcul automatique des kcal selon la quantité

## User Story

As a utilisateur,
I want que les kcal se recalculent automatiquement quand je change la quantité ou l'unité (si des données OpenFoodFacts sont disponibles),
So que je n'aie pas à faire le calcul moi-même (FR-39).

## Acceptance Criteria

**Given** que des données OpenFoodFacts sont présentes dans le formulaire (`kcalPer100g` ou `kcalPerPortion`)
**When** je modifie le champ Quantité ou l'unité
**Then** le champ kcal se met à jour automatiquement selon la règle :
- `g` : `floor(quantité × kcalPer100g / 100)`
- `kg` : `floor(quantité × 1000 × kcalPer100g / 100)`
- `dl` : `floor(quantité × 100 × kcalPer100g / 100)`
- `l` : `floor(quantité × 1000 × kcalPer100g / 100)`
- `portion` : `floor(kcalPerPortion)` (valeur fixe, quantité ignorée)

**Given** que l'unité est `portion` mais `kcalPerPortion` est absent
**When** je saisis une quantité
**Then** le champ kcal est visuellement grisé et affiche `---`
**And** il reste éditable manuellement

**Given** que le champ kcal a été recalculé automatiquement
**When** je modifie manuellement la valeur des kcal
**Then** le recalcul automatique est suspendu pour cette session (valeur verrouillée)
**And** un indicateur visuel léger signale que la valeur est saisie manuellement

**And** aucune migration de base de données n'est requise pour cette story (calcul purement frontend)

## Notes techniques

### Règles de calcul kcal

```typescript
function computeKcal(
  quantity: number,
  unit: string,
  kcalPer100g: number | null,
  kcalPerPortion: number | null
): number | null {
  if (unit === "portion") {
    return kcalPerPortion !== null ? Math.floor(kcalPerPortion) : null;
  }
  if (kcalPer100g === null) return null;
  const grams = unit === "g" ? quantity
    : unit === "kg" ? quantity * 1000
    : unit === "dl" ? quantity * 100
    : unit === "l" ? quantity * 1000
    : null;
  if (grams === null) return null;
  return Math.floor(grams * kcalPer100g / 100);
}
```

### État du formulaire
- Nouveau state : `kcalManual: boolean` (false = auto-calculé, true = saisi manuellement)
- Quand `offData` présent ET `kcalManual === false` : recalcul déclenché à chaque changement de `quantity` ou `unit`
- Si l'utilisateur tape dans le champ kcal → `kcalManual = true`
- Indicateur : texte grisé `(saisie manuelle)` à côté du champ kcal quand `kcalManual === true`
- Reset de `kcalManual` lors du reset complet du formulaire

### Champ kcal grisé pour portion sans kcalPerPortion
- Si `unit === "portion"` ET `offData?.kcalPerPortion === null` ET `offData !== null` :
  - Afficher placeholder `---` dans le champ kcal
  - Griser visuellement (`opacity-50` ou fond gris)
  - Valeur kcal = null (pas de valeur à enregistrer)

### Pas de migration
Cette story est 100% frontend — aucune colonne DB nouvelle.

## Tasks/Subtasks

- [x] T1 : Extraire la fonction `computeKcal` dans `src/lib/kcal.ts` (logique pure testable)
- [x] T2 : Intégrer le calcul auto dans `EntryForm.tsx` (states `kcalManual`, effet sur quantity/unit/offData)
- [x] T3 : Intégrer le calcul auto dans `EntryEditForm.tsx` (même logique)
- [x] T4 : Gérer le cas `portion` sans `kcalPerPortion` (champ grisé + placeholder `---`)
- [x] T5 : Build TypeScript + vérification aucune régression

## Dev Agent Record

### Implementation Plan

Logique extraite dans `src/lib/kcal.ts` : `computeKcal` (calcul selon l'unité + règle `portion`) et `isKcalUnavailable` (cas grisé). Dans les formulaires : state `kcalManual` (false = auto, true = saisi manuellement). `useEffect` sur `[quantity, unit, offData, kcalManual]` déclenche le recalcul. En mode édition, `kcalManual` démarre à `true` pour préserver la valeur existante ; un nouveau lookup passe `kcalManual = false` pour repermettre le calcul auto. Le champ calories bascule sur un `div` grisé quand `isKcalUnavailable`.

### Debug Log

Aucun incident.

### Completion Notes

- `src/lib/kcal.ts` : `computeKcal` (g/kg/dl/l/portion) + `isKcalUnavailable`.
- `EntryForm` : `kcalManual` state, effet auto, champ kcal conditionnel (grisé ou input), indicateur "(saisie manuelle)".
- `EntryEditForm` : même logique, `kcalManual=true` par défaut pour ne pas écraser la valeur chargée ; reset à `false` lors d'un nouveau lookup.
- Build TypeScript : ✅ zéro erreur.

## File List

- `pacal/src/lib/kcal.ts` (nouveau)
- `pacal/src/components/features/entry-form/EntryForm.tsx` (modifié — calcul auto kcal)
- `pacal/src/components/features/entry-form/EntryEditForm.tsx` (modifié — calcul auto kcal)

## Change Log

- 2026-06-28 : Story 2.3 implémentée — calcul automatique des kcal selon quantité/unité/données OFF, gestion saisie manuelle et cas portion inconnue.
