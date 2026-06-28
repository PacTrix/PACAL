---
id: "1.18"
title: "Duplication → écran de saisie prérempli"
status: "done"
epic: "Epic 1 — V1.2"
fr: ["FR-34"]
dependencies: ["1.14", "1.15", "1.17"]
---

# Story 1.18 : Duplication → écran de saisie prérempli

## User Story

As a utilisateur,
I want que la duplication ouvre un formulaire pré-rempli plutôt que de créer directement,
So que je puisse ajuster les champs avant d'enregistrer (FR-34).

## Contexte

**Comportement actuel (Story 1.10) :** cliquer "Dupliquer" crée immédiatement une nouvelle entrée en base, avec horodatage courant et sans photo.

**Nouveau comportement :** cliquer "Dupliquer" navigue vers le formulaire de saisie (`/`) pré-rempli avec les valeurs de l'entrée source. Aucune entrée n'est créée avant que l'utilisateur soumette le formulaire.

**Dépendance :** cette story doit être implémentée après 1.14 (quantité/unité), 1.15 (type de note) et 1.17 (deux photos), car le formulaire pré-rempli doit inclure les nouveaux champs.

## Acceptance Criteria

**Given** que je suis sur la vue historique
**When** je clique sur "Dupliquer" pour une entrée
**Then** je suis redirigé vers le formulaire de saisie (`/`)
**And** les champs suivants sont pré-remplis depuis l'entrée source : description, quantité, unité, calories, statut d'estimation, contexte, note, type de note
**And** la date/heure est celle de l'instant courant (pas de l'entrée source)
**And** les deux zones photo sont vides

**Given** que j'ai rempli ou modifié le formulaire pré-rempli
**When** je soumet le formulaire
**Then** une nouvelle entrée est créée avec les valeurs affichées
**And** l'entrée source reste inchangée

**Given** que le formulaire est pré-rempli
**When** j'annule (navigation arrière ou bouton annuler)
**Then** aucune entrée n'est créée

## Notes d'implémentation

### Approche recommandée : query params dans l'URL
Passer les valeurs de l'entrée source en query params lors de la navigation vers `/` :
```
/?duplicate=true&description=...&quantity=...&unit=...&calories=...&context=...&note=...&noteType=...
```
Le composant `EntryForm` lit ces query params (via `useSearchParams`) pour pré-remplir ses champs.

**Avantages :** pas de state global (Zustand, Context) à introduire ; URL partageable (peu utile ici mais cohérent avec Next.js App Router) ; pas de stockage intermédiaire.

**Inconvénient :** longueur de l'URL si les champs sont longs. Acceptable pour un usage mono-utilisateur.

### Suppression du comportement actuel
- Dans le routeur tRPC ou le composant historique, supprimer l'appel direct à `entries.create` lors de la duplication.
- Remplacer par un `router.push('/?' + params.toString())`.

### EntryForm
- Lire les query params au montage et pré-remplir les champs correspondants.
- Ne pas affecter le comportement normal (formulaire vierge) si aucun query param n'est présent.

## Implémentation réelle (2026-06-28)

**Fichiers modifiés :**
- `src/components/features/entry-history/EntryList.tsx` — `handleDuplicate` remplacé : plus de `mutate`, navigation via `router.push('/?...')`
- `src/components/features/entry-form/EntryForm.tsx` — `useSearchParams()` ajouté pour lire les query params de duplication
- `src/app/page.tsx` — `EntryForm` enveloppé dans `<Suspense>` (requis par Next.js 15 quand `useSearchParams` est utilisé dans un composant enfant)

**Obstacle rencontré :** Next.js 15 exige que tout composant utilisant `useSearchParams()` soit enveloppé dans un `<Suspense>` côté page, sinon le build échoue avec :
```
useSearchParams() should be wrapped in a suspense boundary at page "/"
```
Corrigé en ajoutant `<Suspense>` dans `src/app/page.tsx`.

**Décision d'implémentation :** l'approche query params (URL) a été retenue comme prévu. Avantages confirmés : pas de state global, pas de contexte React, pas de localStorage intermédiaire. La longueur de l'URL n'a pas posé de problème en pratique.

**Champs transmis par query params :** `condition`, `description`, `quantity`, `unit`, `calories`, `note`, `noteType` (les photos ne sont jamais transmises — conforme au FR-34).

**Validation :** TypeScript ✓, build ✓ (après ajout Suspense), testé en production (la duplication ouvre bien le formulaire pré-rempli).
