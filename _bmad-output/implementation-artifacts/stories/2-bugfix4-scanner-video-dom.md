---
id: "2.bugfix4"
title: "Scanner : vidéo non affichée — videoRef null avant montage DOM"
status: "in-progress"
epic: "Epic 2 — V2"
fr: ["FR-36"]
dependencies: ["2.bugfix3"]
baseline_commit: "4018d67"
---

# Story 2.bugfix4 : Scanner — vidéo non affichée après autorisation caméra

## Root Cause Analysis

Dans `startScan()`, l'assignation `videoRef.current.srcObject = stream` s'exécute **avant** que l'élément `<video>` soit dans le DOM. En effet, la `<video>` est rendue conditionnellement avec `{scanning && <video .../>}` et `scanning` vaut encore `false` à ce moment.

Ordre réel :
1. `getUserMedia` → stream OK
2. `videoRef.current.srcObject = stream` → `videoRef.current === null` → silencieusement ignoré
3. `setScanning(true)` → React re-render → `<video>` créée dans le DOM, mais sans `srcObject`

**Fix :** rendre la `<video>` en permanence dans le DOM (avec `className hidden` quand inactif). `videoRef.current` est alors toujours disponible et reçoit correctement le stream.

## Acceptance Criteria

**Given** HTTPS actif, Chrome Android, permission caméra accordée
**When** je clique "📷 Scan"
**Then** la vidéo de la caméra arrière s'affiche immédiatement dans la vignette

## Tasks/Subtasks

- [x] T1 : Modifier `BarcodeScanner.tsx` — `<video>` toujours dans le DOM, masquée si `!scanning`

## Dev Agent Record

### Implementation Plan

Changer `{scanning && <video .../>}` par `<video ... className={scanning ? "..." : "hidden"} />`. La `<video>` est toujours montée donc `videoRef.current` est disponible dans `startScan()` dès le premier appel.

### Completion Notes

- `BarcodeScanner.tsx` : `<video>` toujours rendue, masquée via `hidden` si `!scanning`.

## File List

- `pacal/src/components/features/entry-form/BarcodeScanner.tsx`

## Change Log

- 2026-06-29 : Story 2.bugfix4 — video toujours dans le DOM pour éviter videoRef null.
