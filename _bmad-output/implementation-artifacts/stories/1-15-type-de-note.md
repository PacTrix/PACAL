---
id: "1.15"
title: "Type de note"
status: "à démarrer"
epic: "Epic 1 — V1.2"
fr: ["FR-31"]
dependencies: []
migration: true
---

# Story 1.15 : Type de note

## User Story

As a utilisateur,
I want qualifier ma note avec un type (aliment, médicament, sommeil, autre),
So que je puisse catégoriser mes entrées sans ambiguïté dans le rapport (FR-31).

## Contexte

**Ajout de champ :** colonne `note_type` varchar nullable sur `entries`. Ce champ est **distinct** du champ *contexte* (condition de prise, FR-4) qui reste inchangé.

**Valeurs acceptées :** `aliment`, `médicament`, `sommeil`, `autre`.

## Acceptance Criteria

**Given** la migration Drizzle exécutée (colonne `note_type` varchar nullable)
**When** je saisis ou modifie une entrée
**Then** un sélecteur "Type de note" optionnel est disponible, avec les valeurs : aliment, médicament, sommeil, autre
**And** le champ peut rester vide sans erreur de validation
**And** le sélecteur est visuellement associé au champ note (positionné à côté ou en dessous)

**Given** que j'exporte mes données
**When** j'ouvre le fichier CSV
**Then** je vois la colonne `note_type` (vide si non renseigné)

**Given** que je génère un rapport PDF
**When** une entrée a un type de note renseigné
**Then** le type de note apparaît dans la section note de l'entrée

## Notes d'implémentation

### Migration Drizzle
```sql
ALTER TABLE entries ADD COLUMN note_type varchar(20);
```

### Schéma Drizzle
- Ajouter `noteType: varchar({ length: 20 })`

### Validation Zod
- `noteType: z.enum(['aliment', 'médicament', 'sommeil', 'autre']).optional()`

### Export CSV
- Ajouter la colonne `note_type`.

### Rapport PDF
- Afficher le type de note entre parenthèses ou en label à côté du texte de la note : ex. `[médicament] Doliprane 1g`.
