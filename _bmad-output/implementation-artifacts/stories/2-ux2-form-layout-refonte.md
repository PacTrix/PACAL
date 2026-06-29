---
id: "2.ux2"
title: "Formulaire saisie : refonte layout (header, date+contexte, barcode, note, photos)"
status: "in-progress"
epic: "Epic 2 — V2"
fr: ["FR-1", "FR-3", "FR-36", "FR-38"]
dependencies: ["2.ux1"]
baseline_commit: "d741902"
---

# Story 2.ux2 : Formulaire — refonte layout

## Acceptance Criteria

**AC1 — Header** : logo.png + "PACAL" (bleu #06466D sur fond orange #F05C22) en barre supérieure. Supprimer le `<h1>PACAL</h1>` de page.tsx.

**AC2 — Date + Contexte** : même ligne. Date réduite, bouton ↺ (icône), Contexte à droite. Contexte par défaut `"chez_moi"`.

**AC3 — Ligne barcode** : champ `flex-1`, bouton Scan à droite, badges scores (NutriscoreDisplay) inline à droite du bouton — sans le bloc séparé en dessous.

**AC4 — Note** : textarea 1 ligne ; passe à 3 lignes dès que le contenu a 2+ lignes.

**AC5 — Photos** : 4 boutons compacts sur une seule ligne (📷 Photo 1 / 🖼 Galerie 1 / 📷 Photo 2 / 🖼 Galerie 2). Les previews apparaissent sous la ligne.

## Tasks/Subtasks

- [x] T1 : `Nav.tsx` — barre header orange, PACAL en bleu, logo.png
- [x] T2 : `app/page.tsx` — supprimer `<h1>PACAL</h1>`
- [x] T3 : `EntryForm.tsx` — date + ↺ + contexte sur même ligne, default chez_moi
- [x] T4 : `EntryForm.tsx` — barcode flex-1 + scores inline, supprimer bloc NutriscoreDisplay séparé
- [x] T5 : `EntryForm.tsx` — note textarea auto-expand 1→3 lignes
- [x] T6 : `EntryForm.tsx` — PhotoWidget refacto 4 boutons compacts 1 ligne

## File List

- `pacal/src/components/ui/Nav.tsx`
- `pacal/src/app/page.tsx`
- `pacal/src/components/features/entry-form/EntryForm.tsx`

## Change Log

- 2026-06-29 : Story 2.ux2 créée et implémentée
