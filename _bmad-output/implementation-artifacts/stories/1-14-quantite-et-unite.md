---
id: "1.14"
title: "Remplacer 'poids' par 'quantité + unité'"
status: "done"
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

## Implémentation réelle (2026-06-28)

**Fichiers modifiés :**
- `src/server/db/schema.ts` — `weightG: d.real()` → `quantity: d.integer()` + `unit: d.varchar({ length: 10 })`
- `src/server/api/routers/entries.ts` — schémas Zod mis à jour, mutations `create` et `update` adaptées
- `src/components/features/entry-form/EntryForm.tsx` — champ Quantité (entier) + sélecteur Unité
- `src/components/features/entry-form/EntryEditForm.tsx` — idem
- `src/app/api/export/route.ts` — colonnes `quantity` et `unit` remplacent `weight_g`
- `src/lib/pdf.tsx` — affichage `X g`, `X portion`, etc.
- `drizzle/0002_v12_schema.sql` — migration SQL créée manuellement

**Migration appliquée sur le NAS :** manuellement via `psql` (drizzle-kit non disponible sur l'hôte Synology standalone). Commandes exécutées :
```sql
ALTER TABLE "pacal_entry" RENAME COLUMN "weight_g" TO "quantity";
ALTER TABLE "pacal_entry" ALTER COLUMN "quantity" TYPE integer USING round("quantity")::integer;
ALTER TABLE "pacal_entry" ADD COLUMN "unit" varchar(10);
```
Données existantes (4 entrées) converties sans perte via `round()::integer`.

**Écart par rapport au plan :** les calories ont été séparées dans leur propre champ `div` plutôt qu'intégrées dans le même bloc que quantité/unité — meilleure lisibilité sur mobile.

**Validation :** TypeScript ✓, build ✓, migration ✓, testé en production (saisie quantité+unité, export CSV vérifié).
