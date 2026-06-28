---
id: "1.13"
title: "Pré-remplir le dernier contexte saisi"
status: "done"
epic: "Epic 1 — V1.2"
fr: ["FR-29"]
dependencies: []
---

# Story 1.13 : Pré-remplir le dernier contexte saisi

## User Story

As a utilisateur,
I want que le champ "contexte" soit pré-rempli avec ma dernière valeur utilisée,
So que je n'aie pas à le resélectionner systématiquement (FR-29).

## Contexte

**Champ concerné :** le champ *contexte* (condition de prise), liste fermée à 5 valeurs (chez moi, au bureau, au restaurant, en déplacement, autre — ou valeurs réelles dans le code). Ce champ est **obligatoire** (FR-4).

**Approche recommandée :** persister la dernière valeur en `localStorage` côté client, plutôt qu'en base de données — la valeur n'a pas besoin d'être synchronisée entre appareils, et cela évite un aller-retour serveur.

## Acceptance Criteria

**Given** que j'ai déjà enregistré au moins une entrée
**When** j'ouvre le formulaire de nouvelle saisie (`/`)
**Then** le champ contexte affiche la dernière valeur que j'avais sélectionnée lors d'une saisie précédente
**And** si aucune entrée n'a jamais été saisie (ou si le localStorage est vide), le comportement actuel est conservé (premier choix ou valeur vide)

**Given** que je modifie une entrée existante (`/entrees/[id]`)
**When** le formulaire d'édition se charge
**Then** le champ contexte affiche la valeur de l'entrée source (pas la "dernière valeur") — comportement inchangé

## Notes d'implémentation

- Stocker la valeur sélectionnée dans `localStorage` à chaque soumission réussie du formulaire de saisie (clé suggérée : `pacal_last_context`).
- Lire cette valeur au montage du composant `EntryForm` pour pré-remplir le champ.
- `EntryEditForm` n'est pas concerné.
- Aucune migration de base de données.
- Aucun appel tRPC supplémentaire.

## Implémentation réelle (2026-06-28)

**Composant modifié :** `src/components/features/entry-form/EntryForm.tsx`

**Décisions prises :**
- Clé localStorage : `pacal_last_context` (comme suggéré)
- La valeur est persistée dans `localStorage.setItem` après chaque soumission réussie, dans le `handleSubmit` (après `mutateAsync`) — pas dans le `onSuccess` du mutation hook, pour éviter une closure stale
- Le contexte est conservé après soumission (le champ n'est pas remis à vide après enregistrement — seuls description, quantité, note, photos sont réinitialisés)
- En cas de pré-remplissage par duplication (query params), le paramètre `condition` de l'URL prend la priorité sur le localStorage

**Subtilité SSR :** `localStorage` n'est pas disponible côté serveur. Utilisation de `typeof window !== 'undefined'` pour la lecture initiale, et `useEffect` pour la synchronisation post-montage.

**Validation :** TypeScript ✓, build ✓, testé en production (le contexte "Chez moi" persiste d'une saisie à l'autre).
- Aucune migration de base de données.
- Aucun appel tRPC supplémentaire.
