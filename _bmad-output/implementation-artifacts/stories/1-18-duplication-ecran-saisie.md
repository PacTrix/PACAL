---
id: "1.18"
title: "Duplication → écran de saisie prérempli"
status: "à démarrer"
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
