---
id: "2.bugfix5"
title: "Scanner : détection code-barres ne se déclenche jamais"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-36"]
dependencies: ["2.bugfix4"]
baseline_commit: "ebbeb1e"
---

# Story 2.bugfix5 : Scanner — détection code-barres ne se déclenche jamais

## Root Cause Analysis

`BarcodeDetector.detect(videoElement)` nécessite que la vidéo soit en
`readyState >= 2` (HAVE_CURRENT_DATA), c'est-à-dire qu'au moins une frame
soit disponible. Dans le code actuel, `requestAnimationFrame(tick)` est appelé
immédiatement après `videoRef.current.srcObject = stream`, avant que la vidéo
ait commencé à décoder des frames. `detect()` reçoit un flux sans données,
retourne `[]` silencieusement à chaque frame, et on boucle indéfiniment sans
jamais rien détecter.

**Fix :** attendre l'événement `loadeddata` sur l'élément `<video>` avant de
démarrer la boucle de détection. `loadeddata` se déclenche quand le navigateur
a décodé la première frame — garantit que `detect()` a des données à analyser.

## Acceptance Criteria

**Given** HTTPS actif, Chrome Android, permission caméra accordée
**When** je clique "📷 Scan" et présente un code EAN-13 ou EAN-8 devant la caméra
**Then** le barcode est détecté et le champ code-barres est rempli automatiquement

## Tasks/Subtasks

- [x] T1 : Modifier `BarcodeScanner.tsx` — attendre `loadeddata` avant de démarrer `tick()`

## Dev Agent Record

### Implementation Plan

Remplacer le `requestAnimationFrame(tick)` immédiat par une attente de
l'événement `loadeddata` :

```typescript
await new Promise<void>((resolve) => {
  if (!videoRef.current) { resolve(); return; }
  if (videoRef.current.readyState >= 2) { resolve(); return; }
  videoRef.current.onloadeddata = () => resolve();
});
rafRef.current = requestAnimationFrame(tick);
```

Le check `readyState >= 2` en entrée gère le cas (théorique) où la vidéo
serait déjà prête au moment de l'appel.

### Completion Notes

Ajout d'un `await new Promise<void>` sur l'événement `loadeddata` avant le
premier `requestAnimationFrame(tick)`. Le check `readyState >= 2` permet de
résoudre immédiatement si la vidéo était déjà prête (cas théorique). Build
TypeScript : ✅ zéro erreur.

## File List

- `pacal/src/components/features/entry-form/BarcodeScanner.tsx`

## Change Log

- 2026-06-29 : Story 2.bugfix5 — attente loadeddata avant démarrage tick()
