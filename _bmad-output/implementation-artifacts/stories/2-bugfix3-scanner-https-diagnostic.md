---
id: "2.bugfix3"
title: "Scanner : diagnostic HTTPS vs navigateur non supporté"
status: "review"
epic: "Epic 2 — V2"
fr: ["FR-36"]
dependencies: ["2.bugfix2"]
baseline_commit: "9d04e7e"
---

# Story 2.bugfix3 : Scanner — diagnostic HTTPS vs navigateur non supporté

## Root Cause Analysis

BarcodeDetector API est une API de "secure context" : Chrome la masque si la page n'est pas servie en HTTPS (`window.isSecureContext === false`). Sur le NAS via Tailscale, si l'app est en HTTP, `"BarcodeDetector" in window` retourne `false` même sur Chrome Android 149.

**Distinction à faire :**
- `!window.isSecureContext` → le problème est l'infrastructure (HTTPS requis)
- `isSecureContext && !"BarcodeDetector" in window` → le navigateur ne supporte pas l'API

## Acceptance Criteria

**Given** que la page est servie en HTTP (non-HTTPS)
**When** je clique sur le bouton "📷 Scan"
**Then** le message est : "Le scan nécessite HTTPS. Activez HTTPS sur le NAS (Tailscale cert ou reverse proxy)."

**Given** que la page est en HTTPS mais le navigateur ne supporte pas BarcodeDetector
**When** je clique sur le bouton "📷 Scan"
**Then** le message est : "Scan non supporté par ce navigateur. Utilisez Chrome sur Android."

**Given** que la page est en HTTPS et Chrome Android supporte BarcodeDetector
**When** je clique sur le bouton "📷 Scan"
**Then** la caméra s'active normalement

## Notes techniques

### Fix BarcodeScanner.tsx

```typescript
const startScan = async () => {
  setError(null);
  if (!window.isSecureContext) {
    setError("Le scan nécessite HTTPS. Activez HTTPS sur le NAS (Tailscale cert ou reverse proxy).");
    return;
  }
  if (!canScan) {
    setError("Scan non supporté par ce navigateur. Utilisez Chrome sur Android.");
    return;
  }
  // ... suite inchangée
};
```

### Note infrastructure (hors scope code)
Pour activer HTTPS sur le NAS Synology via Tailscale :
```bash
tailscale cert <hostname>.ts.net
# Puis configurer le reverse proxy Synology pour utiliser ce certificat
```
Ou utiliser le reverse proxy Synology (Control Panel → Login Portal → Advanced) avec un certificat Let's Encrypt.

## Tasks/Subtasks

- [x] T1 : Corriger `BarcodeScanner.tsx` — distinguer `!isSecureContext` vs `!canScan`
- [x] T2 : Build TypeScript + vérification aucune régression

## Dev Agent Record

### Implementation Plan

Guard `window.isSecureContext` ajouté avant le guard `canScan` dans `startScan()`. Chrome masque BarcodeDetector sur HTTP → `canScan` serait `false` sur HTTP, mais le message "navigateur non supporté" serait trompeur. Le message HTTPS donne la vraie cause et la marche à suivre (Tailscale cert ou reverse proxy Synology).

### Debug Log

Aucun incident.

### Completion Notes

- `BarcodeScanner.tsx` : deux guards distincts avec messages différenciés.
- Le bouton reste toujours visible (story 2.bugfix2), mais les erreurs sont maintenant précises.
- La vraie solution pour le scan est d'activer HTTPS sur le NAS (hors scope code).

## File List

- `pacal/src/components/features/entry-form/BarcodeScanner.tsx` (modifié — diagnostic HTTPS)

## Change Log

- 2026-06-28 : Story 2.bugfix3 — message d'erreur HTTPS vs navigateur non supporté.
