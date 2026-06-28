---
id: "2.6"
title: "Corrections post-déploiement V2 (bugs constatés en test)"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-36", "FR-37"]
dependencies: ["2.1", "2.2"]
baseline_commit: "175b5eb8eb8af24b499085da7e4f785078503443"
---

# Story 2.6 : Corrections post-déploiement V2

## User Story

As a utilisateur,
I want que les bugs constatés lors du test V2 soient corrigés,
So que je puisse utiliser le scan et l'enrichissement comme prévu.

## Acceptance Criteria

**Bug 1 — Changelog À propos non à jour**
**Given** que j'ouvre le menu À propos
**Then** la version V2 apparaît en tête du changelog avec ses fonctionnalités

**Bug 2 — Position du champ code-barres**
**Given** que j'ouvre le formulaire de saisie
**Then** le champ code-barres se trouve ENTRE la description et les champs quantité/unité

**Bug 3 — Bouton scanner invisible**
**Given** que je suis sur Chrome Android (ou autre navigateur supportant BarcodeDetector)
**Then** le bouton "📷 Scan" est visible
**Root cause** : `canScan` calculé comme constante au render → hydration mismatch SSR/client → bouton absent. Fix : `useState(false)` + `useEffect` pour vérifier côté client après mount.

**Bug 4 — Champ code-barres s'efface au blur**
**Given** que je saisis un code-barres manuellement
**When** je quitte le champ (blur)
**Then** le code-barres reste affiché ET l'enrichissement OFF se déclenche
**Root cause** : le hook `useQuery` avec `enabled: lookupBarcode.length > 0` déclenche un re-render au moment où `lookupBarcode` change. Le setter `setLookupBarcode` dans `triggerLookup` provoque un re-render, mais le barcode state est stable. Cause réelle probable : `onBlur` appelle `triggerLookup(e.target.value)` mais la valeur lue au blur peut être vide si la gestion des événements React sur mobile diffère. Fix : toujours lire `barcode` (state) dans `triggerLookup`, pas `e.target.value`.

## Notes techniques

### Bug 3 — Fix BarcodeScanner hydration
```typescript
// Remplacer :
const canScan = typeof window !== "undefined" && "BarcodeDetector" in window;
// Par :
const [canScan, setCanScan] = useState(false);
useEffect(() => {
  setCanScan("BarcodeDetector" in window);
}, []);
```

### Bug 4 — Fix onBlur barcode
```tsx
// Remplacer :
onBlur={(e) => triggerLookup(e.target.value)}
// Par :
onBlur={() => triggerLookup(barcode)}
```

### Bug 2 — Réordonnancement JSX EntryForm
Ordre cible :
1. timestamp
2. condition
3. description
4. **barcode + scanner** ← ici
5. quantité + unité
6. calories
7. note + type de note
8. photo 1 + photo 2

## Tasks/Subtasks

- [x] T1 : Ajouter V2 dans CHANGELOG de `a-propos/page.tsx`
- [x] T2 : Déplacer le bloc code-barres dans `EntryForm.tsx` (entre description et quantité)
- [x] T3 : Corriger `BarcodeScanner.tsx` (hydration — useState + useEffect)
- [x] T4 : Corriger `onBlur` dans `EntryForm.tsx` (lire `barcode` state, pas `e.target.value`)
- [x] T5 : Appliquer les mêmes corrections T2/T4 dans `EntryEditForm.tsx`
- [x] T6 : Build TypeScript + vérification aucune régression

## Dev Agent Record

### Implementation Plan

T1 : Ajout entrée V2 en tête du tableau `CHANGELOG` dans `a-propos/page.tsx`. T2/T5 : Le bloc JSX code-barres extrait et replacé entre description et quantité/unité dans `EntryForm` et `EntryEditForm` ; ancien emplacement (après note) supprimé. T3 : `BarcodeScanner` — remplacement de la constante `canScan` par `useState(false)` + `useEffect(() => setCanScan("BarcodeDetector" in window), [])` pour éviter le mismatch d'hydratation SSR/client (la constante calculée pendant SSR = false ne se mettait pas à jour côté client). T4/T5 : `onBlur={() => triggerLookup(barcode)}` — utilisation du state React au lieu de `e.target.value` pour garantir la valeur correcte sur mobile.

### Debug Log

Aucun incident.

### Completion Notes

- CHANGELOG : V2 ajouté en tête.
- Position barcode : entre description et quantité dans les deux formulaires.
- BarcodeScanner hydration : bouton désormais affiché sur les navigateurs supportant BarcodeDetector (Chrome Android).
- onBlur fix : lecture du state `barcode` (pas `e.target.value`) pour éviter la valeur vide sur mobile.
- Build TypeScript : ✅ zéro erreur.

## File List

- `pacal/src/app/a-propos/page.tsx` (modifié — V2 dans CHANGELOG)
- `pacal/src/components/features/entry-form/BarcodeScanner.tsx` (modifié — hydration fix)
- `pacal/src/components/features/entry-form/EntryForm.tsx` (modifié — position barcode + onBlur fix)
- `pacal/src/components/features/entry-form/EntryEditForm.tsx` (modifié — position barcode + onBlur fix)

## Change Log

- 2026-06-28 : Story 2.6 — corrections post-déploiement V2 (changelog, position barcode, hydration scanner, onBlur).
