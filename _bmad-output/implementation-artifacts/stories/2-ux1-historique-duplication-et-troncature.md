---
id: "2.ux1"
title: "Historique : duplication barcode + scores, troncature libellé"
status: "in-progress"
epic: "Epic 2 — V2"
fr: ["FR-36", "FR-40"]
dependencies: ["2.bugfix5"]
baseline_commit: "d741902"
---

# Story 2.ux1 : Historique — duplication barcode + scores, troncature libellé

## Acceptance Criteria

**AC1 — Duplication barcode + qualité**
Given une entrée avec barcode et scores nutriscore/nova/greenscore
When je clique "Dupliquer"
Then le formulaire de saisie est pré-rempli avec le barcode + les scores (offData reconstruit)

**AC2 — Troncature libellé**
Given une entrée avec un libellé très long
When je consulte l'historique
Then le libellé est tronqué et les boutons Dupliquer/Supprimer restent visibles dans leur colonne

## Notes techniques

### AC1 — handleDuplicate (EntryList.tsx)
Ajouter barcode, nutriscore, nova, greenscore, kcalPer100g, kcalPerPortion aux URL params.

### AC1 — EntryForm.tsx
Lire ces params et reconstruire offData :
```typescript
const dupBarcode = searchParams.get("barcode") ?? "";
// reconstruire offData si nutriscore/nova/greenscore présents
const dupNutriscore = searchParams.get("nutriscore");
const dupNova = searchParams.get("nova");
// ...
const initialOffData = (dupNutriscore || dupNova || dupGreenscore)
  ? { name: null, nutriscore: dupNutriscore, nova: dupNova ? parseInt(dupNova) : null, greenscore: dupGreenscore, kcalPer100g: dupKcalPer100g ? parseFloat(dupKcalPer100g) : null, kcalPerPortion: dupKcalPerPortion ? parseFloat(dupKcalPerPortion) : null }
  : null;
```

### AC2 — EntryList.tsx
Ajouter `min-w-0` sur le `<Link>` flex-1 pour permettre la troncature du texte enfant.

## Tasks/Subtasks

- [x] T1 : `EntryList.tsx` — handleDuplicate passe barcode + scores en params
- [x] T2 : `EntryForm.tsx` — lire params barcode + scores, reconstruire offData initial
- [x] T3 : `EntryList.tsx` — min-w-0 sur Link pour fix troncature

## File List

- `pacal/src/components/features/entry-history/EntryList.tsx`
- `pacal/src/components/features/entry-form/EntryForm.tsx`

## Change Log

- 2026-06-29 : Story 2.ux1 créée et implémentée
