---
id: "2.ux3"
title: "Scanner : overlay visuel (cadre + ligne verte)"
status: "in-progress"
epic: "Epic 2 — V2"
fr: ["FR-36"]
dependencies: ["2.ux2"]
baseline_commit: "d741902"
---

# Story 2.ux3 : Scanner — overlay visuel cadre + ligne verte

## Acceptance Criteria

Given la caméra est active (scanning = true)
When la vidéo s'affiche
Then un cadre blanc semi-transparent et une ligne verte horizontale centrée sont superposés à la vidéo
And un texte guide "Pointez un code-barres EAN" apparaît en haut de la zone

## Notes techniques

Overlay CSS par-dessus la `<video>` via `position: absolute`. Pas de canvas nécessaire.
- Wrapper `relative` sur le conteneur vidéo
- `<div>` cadre : `inset-4 border-2 border-white/60 rounded-md absolute`
- `<div>` ligne : `absolute left-4 right-4 top-1/2 h-0.5 bg-green-500`
- `<p>` guide : `absolute top-2 text-center text-white/80 text-xs`

## Tasks/Subtasks

- [x] T1 : `BarcodeScanner.tsx` — overlay cadre + ligne verte quand scanning = true

## File List

- `pacal/src/components/features/entry-form/BarcodeScanner.tsx`

## Change Log

- 2026-06-29 : Story 2.ux3 créée et implémentée
