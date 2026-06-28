---
id: "2.5"
title: "Affichage dans la vue détail et le rapport PDF"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-42"]
dependencies: ["2.2", "2.4"]
baseline_commit: "175b5eb8eb8af24b499085da7e4f785078503443"
---

# Story 2.5 : Affichage dans la vue détail et le rapport PDF

## User Story

As a utilisateur,
I want voir le code-barres et les scores nutritionnels quand j'ouvre une entrée ou génère un rapport PDF,
So que je dispose du contexte nutritionnel complet dans mes documents de suivi (FR-42).

## Acceptance Criteria

**Given** qu'une entrée a été enrichie depuis OpenFoodFacts
**When** j'ouvre la vue détail / formulaire d'édition
**Then** le code-barres est affiché (éditable)
**And** les scores X·N·Y apparaissent avec la colorisation vert/orange/rouge

**Given** que je génère un rapport PDF couvrant des entrées avec et sans données OpenFoodFacts
**When** le PDF est rendu
**Then** le code-barres est affiché sur les entrées qui en ont un
**And** les scores X·N·Y apparaissent avec les couleurs correspondantes
**And** les entrées avec `ofIncomplete = true` affichent "(données manuelles)" à la place des scores

**And** aucune migration de base de données n'est requise

## Notes techniques

### Vue détail
- `EntryEditForm` affiche déjà le barcode (champ éditable) et `NutriscoreDisplay` depuis story 2.2
- Vérifier que les données OFF existantes sont bien pré-chargées à l'ouverture (déjà géré en story 2.2)
- Valider visuellement que tout est présent

### Rapport PDF (src/lib/pdf.tsx)
- Étendre le type `Entry` avec les 7 champs OFF
- Dans le composant PDF par entrée : si `barcode` → afficher le code-barres
- Si scores disponibles (`nutriscore || nova || greenscore`) → afficher X·N·Y avec couleurs via StyleSheet
- Si `ofIncomplete = true` → afficher "(données manuelles)" à la place des scores
- Couleurs via StyleSheet (pas Tailwind) : A/B → #16a34a (green-600), C → #f97316 (orange-500), D/E → #dc2626 (red-600)
- Nova : 1/2 → #16a34a, 3 → #f97316, 4 → #dc2626

## Tasks/Subtasks

- [x] T1 : Vérifier la vue détail (`EntryEditForm`) — confirmer affichage barcode + NutriscoreDisplay à l'ouverture
- [x] T2 : Étendre le type `Entry` dans `pdf.tsx` avec les 7 champs OFF
- [x] T3 : Ajouter l'affichage barcode + scores X·N·Y dans le composant PDF (avec styles couleur)
- [x] T4 : Étendre la query SQL du rapport pour inclure les colonnes OFF
- [x] T5 : Build TypeScript + vérification aucune régression

## Dev Agent Record

### Implementation Plan

T1 : Vue détail = `EntryEditForm` (story 2.2) — barcode éditable + `NutriscoreDisplay` pré-chargé depuis `entry.nutriscore/nova/greenscore`. Aucune modification nécessaire. T2 : type `Entry` dans `pdf.tsx` étendu avec 7 champs OFF. T3 : composant `OFFRow` ajouté (helpers `nutriscoreStyle`/`novaStyle` + styles `StyleSheet`) — affiche `EAN: xxx` si barcode, puis scores X·N·Y colorisés, ou "(données manuelles)" si `ofIncomplete`. T4 : route rapport fait `select()` sans filtre → toutes colonnes déjà transmises, aucune modification.

### Debug Log

Aucun incident.

### Completion Notes

- Vue détail : déjà opérationnelle via story 2.2 — aucun code à modifier.
- `pdf.tsx` : type Entry étendu, `OFFRow` composant React-PDF intégré après la description dans chaque entrée.
- Couleurs PDF via StyleSheet hex : #16a34a (vert), #f97316 (orange), #dc2626 (rouge).
- Route rapport : `select()` inclut toutes colonnes automatiquement.
- Build TypeScript : ✅ zéro erreur.

## File List

- `pacal/src/lib/pdf.tsx` (modifié — type Entry étendu, composant OFFRow, styles couleur)

## Change Log

- 2026-06-28 : Story 2.5 implémentée — affichage barcode + scores X·N·Y dans le rapport PDF, "(données manuelles)" pour fiches incomplètes.
