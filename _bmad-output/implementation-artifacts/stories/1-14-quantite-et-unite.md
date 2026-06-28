---
id: "1.14"
title: "Remplacer 'poids' par 'quantité + unité'"
status: "à démarrer"
epic: "Epic 1 — V1.2"
fr: ["FR-30"]
dependencies: []
migration: true
---

# Story 1.14 : Remplacer "poids" par "quantité + unité"

## User Story

As a utilisateur,
I want saisir une quantité entière avec son unité (g, kg, dl, l, portion),
So que le suivi soit plus précis et pertinent selon ce que je consomme (FR-30).

## Contexte

**Changement de schéma :** remplacement du champ `weight` (decimal/float) par deux champs :
- `quantity` : entier positif nullable
- `unit` : varchar nullable, valeurs acceptées : `g`, `kg`, `dl`, `l`, `portion`

**Impact :** formulaire de saisie, formulaire d'édition, export CSV, rapport PDF.

## Acceptance Criteria

**Given** la migration Drizzle exécutée
**When** je saisis ou modifie une entrée
**Then** le champ "Poids estimé" a disparu, remplacé par "Quantité" (entier positif) et un sélecteur "Unité" (g / kg / dl / l / portion)
**And** les deux champs sont optionnels — une entrée sans quantité ni unité est valide
**And** une valeur non entière ou négative dans "Quantité" est rejetée par validation côté client

**Given** que j'exporte mes données
**When** j'ouvre le fichier CSV
**Then** je vois les colonnes `quantity` et `unit` (la colonne `weight` n'existe plus)

**Given** que je génère un rapport PDF
**When** une entrée a une quantité et/ou une unité
**Then** le rapport affiche "X g", "X portion", "X dl", etc.
**And** si aucune unité n'est renseignée, seule la valeur numérique est affichée
**And** si ni quantité ni unité, la cellule est vide (même comportement qu'aujourd'hui pour "poids")

## Notes d'implémentation

### Migration Drizzle
```sql
-- Migration à générer via drizzle-kit
ALTER TABLE entries RENAME COLUMN weight TO quantity;
ALTER TABLE entries ALTER COLUMN quantity TYPE integer USING quantity::integer;
ALTER TABLE entries ADD COLUMN unit varchar(10);
```
Générer via `pnpm drizzle-kit generate` et appliquer via `pnpm drizzle-kit migrate`.

### Schéma Drizzle (`src/server/db/schema.ts`)
- `weight: decimal(...)` → `quantity: integer()`
- Ajouter `unit: varchar({ length: 10 })`

### Validation Zod (schéma partagé)
- `quantity: z.number().int().positive().optional()`
- `unit: z.enum(['g', 'kg', 'dl', 'l', 'portion']).optional()`

### Export (`/api/export`)
- Remplacer la colonne `weight` par `quantity` et `unit` dans le CSV.

### Rapport PDF (`RapportPDF`)
- Logique d'affichage : `quantity && unit ? \`${quantity} ${unit}\` : quantity ? \`${quantity}\` : ''`

### Rétrocompatibilité données existantes
- Les entrées existantes auront `quantity = null` et `unit = null` après migration — comportement identique à "pas de quantité saisie". Acceptable.
