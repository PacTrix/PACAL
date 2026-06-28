---
id: "1.17"
title: "Deux photos par fiche"
status: "à démarrer"
epic: "Epic 1 — V1.2"
fr: ["FR-33"]
dependencies: []
migration: true
---

# Story 1.17 : Deux photos par fiche

## User Story

As a utilisateur,
I want pouvoir attacher jusqu'à deux photos indépendantes à une entrée,
So que je puisse photographier à la fois le plat et sa fiche descriptive (FR-33).

## Contexte

**Changement de schéma :** remplacement de la colonne unique `photo_path` par deux colonnes indépendantes `photo_path_1` et `photo_path_2` (toutes deux nullable).

**Aucune contrainte sur le contenu des photos** — l'utilisateur choisit librement. Pas de troisième slot.

**Impact :** formulaire de saisie, formulaire d'édition, route `/api/photos`, export ZIP, rapport PDF, suppression d'entrée.

## Acceptance Criteria

**Given** la migration Drizzle exécutée
**When** je saisis ou modifie une entrée
**Then** deux zones de capture indépendantes sont disponibles (chacune : bouton caméra/galerie, preview de la photo sélectionnée, bouton de suppression de la photo)
**And** chaque zone est optionnelle — zéro, une ou deux photos sont toutes valides
**And** les deux zones fonctionnent indépendamment (choisir photo 2 ne nécessite pas d'avoir photo 1)

**Given** que j'exporte mes données
**When** j'ouvre le fichier ZIP
**Then** les photos sont présentes (nommées distinctement pour éviter les collisions : ex. `{timestamp}_1.jpg` et `{timestamp}_2.jpg`)
**And** le CSV contient les colonnes `photo_path_1` et `photo_path_2`

**Given** que je génère un rapport PDF
**When** une entrée a une ou deux photos
**Then** les vignettes correspondantes apparaissent dans la colonne photo de l'entrée
**And** une entrée avec une seule photo dans le slot 2 affiche uniquement cette photo

**Given** que je supprime une entrée depuis l'historique
**When** la suppression est confirmée
**Then** les deux fichiers photos (si existants) sont supprimés du stockage `/data/photos/`

## Notes d'implémentation

### Migration Drizzle
```sql
ALTER TABLE entries RENAME COLUMN photo_path TO photo_path_1;
ALTER TABLE entries ADD COLUMN photo_path_2 varchar(500);
```

### Schéma Drizzle (`schema.ts`)
- `photoPath` → `photoPath1: varchar({ length: 500 })`
- Ajouter `photoPath2: varchar({ length: 500 })`

### Route upload photos (`/api/photos`)
La route existante gère déjà un fichier unique. Il faut la faire accepter un paramètre `slot` (1 ou 2) pour distinguer les deux slots, ou créer deux endpoints distincts (`/api/photos/1` et `/api/photos/2`). Recommandation : conserver une seule route avec un query param `?slot=1|2`.

### Composants EntryForm / EntryEditForm
- Dupliquer le bloc camera/gallery/preview pour créer deux zones indépendantes.
- Gérer deux états locaux `photo1` et `photo2`.

### Export ZIP
- Inclure `photo_path_1` et `photo_path_2` si définis.
- Nommage fichiers : `{timestamp}_1.jpg` / `{timestamp}_2.jpg` pour éviter les collisions.

### Rapport PDF
- La colonne droite peut afficher jusqu'à deux vignettes empilées verticalement.
- Hauteur par vignette : ~2 cm (comme Story 1.11), à ajuster si les deux sont présentes.

### Suppression
- Dans le routeur `entries.delete`, supprimer les deux fichiers (`photo_path_1` et `photo_path_2`).
