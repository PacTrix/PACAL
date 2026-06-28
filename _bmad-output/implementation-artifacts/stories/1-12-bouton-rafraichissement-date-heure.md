---
id: "1.12"
title: "Bouton de rafraîchissement de la date/heure"
status: "done"
epic: "Epic 1 — V1.2"
fr: ["FR-28"]
dependencies: []
---

# Story 1.12 : Bouton de rafraîchissement de la date/heure

## User Story

As a utilisateur,
I want pouvoir remettre la date/heure à l'instant courant d'un clic,
So that je peux saisir une deuxième fiche sans me soucier de la date obsolète dans le formulaire (FR-28).

## Contexte

**Besoin :** le formulaire de saisie pré-remplit la date/heure au chargement de la page. Si l'utilisateur laisse la page ouverte et revient plus tard pour saisir une deuxième fiche, la date affichée est celle du chargement initial — pas l'heure réelle de la saisie. Ce bouton corrige ce cas sans modifier le fonctionnement existant.

**Scope :** formulaire de nouvelle saisie (`/`) **et** formulaire d'édition (`/entrees/[id]`).

## Acceptance Criteria

**Given** que je suis sur le formulaire de saisie ou d'édition
**When** je clique sur le bouton "Actualiser la date/heure"
**Then** le champ date/heure se met à jour à l'instant courant (à la seconde près)
**And** le formulaire n'est pas soumis

## Notes d'implémentation

- Le bouton est positionné à proximité immédiate du champ `datetime-local` (icône horloge ou texte "Maintenant").
- Comportement : `setValue('datetime', new Date().toISOString().slice(0, 16))` (ou équivalent selon le contrôleur de formulaire utilisé — actuellement react-hook-form).
- Composants concernés : `EntryForm` (saisie) et `EntryEditForm` (édition) dans `pacal/src/`.
- Aucune migration de base de données.
- Aucun appel tRPC supplémentaire.

## Implémentation réelle (2026-06-28)

**Composants modifiés :**
- `src/components/features/entry-form/EntryForm.tsx` — bouton `↺ Maintenant` ajouté à côté du champ `datetime-local`
- `src/components/features/entry-form/EntryEditForm.tsx` — même bouton, même comportement

**Décision prise :** texte "↺ Maintenant" plutôt qu'une icône seule — plus explicite sur mobile sans nécessiter une bibliothèque d'icônes.

**Implémentation effective :** `setTimestamp(formatDatetimeLocal(new Date()))` au clic. La fonction `formatDatetimeLocal` existait déjà dans les deux composants — réutilisée sans modification.

**Écart par rapport au plan :** la note d'implémentation mentionnait `react-hook-form`, mais le projet utilise du state React natif (`useState`). L'implémentation s'est adaptée sans difficulté.

**Validation :** TypeScript ✓, build ✓, testé en production sur NAS (bouton visible et fonctionnel sur mobile Chrome).
