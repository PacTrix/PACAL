---
id: "1.17"
title: "Deux photos par fiche"
status: "done"
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

## Implémentation réelle (2026-06-28)

**Fichiers modifiés :**
- `src/server/db/schema.ts` — `photoPath: d.text()` → `photoPath1: d.text()` + `photoPath2: d.text()`
- `src/server/api/routers/entries.ts` — schémas Zod, mutations create/update/delete
- `src/components/features/entry-form/EntryForm.tsx` — composant `PhotoWidget` réutilisable, instancié deux fois
- `src/components/features/entry-form/EntryEditForm.tsx` — idem + gestion état `SlotState`
- `src/app/api/export/route.ts` — deux colonnes photo dans le CSV, nommage `{timestamp}_1.jpg` / `_2.jpg`
- `src/lib/pdf.tsx` — boucle sur `[photoPath1, photoPath2]` pour afficher jusqu'à deux vignettes
- `drizzle/0002_v12_schema.sql` — migration SQL créée manuellement

**Migration appliquée sur le NAS :**
```sql
ALTER TABLE "pacal_entry" RENAME COLUMN "photo_path" TO "photo_path_1";
ALTER TABLE "pacal_entry" ADD COLUMN "photo_path_2" text;
```

**Architecture du composant photo :** un composant `PhotoWidget` a été extrait pour éviter la duplication. Il encapsule les deux inputs (`capture` + galerie), la preview, et les boutons Changer/Retirer. L'`EntryEditForm` utilise un type `SlotState` plus riche (gestion de la photo existante + nouvelle photo).

---

## ⚠️ Incident post-déploiement (2026-06-28)

**Symptôme :** "Erreur lors de l'enregistrement" à chaque tentative de création d'entrée. L'application refusait d'enregistrer toute nouvelle saisie après déploiement V1.2.

**Diagnostic :** les logs conteneur montraient `[TRPC] entries.create took 39ms` sans stack trace d'erreur. La cause n'était pas dans les logs mais dans un mismatch silencieux entre le nom de colonne en base et le nom généré par Drizzle ORM.

**Cause racine :** Drizzle ORM avec `casing: 'snake_case'` convertit les noms camelCase en snake_case en n'insérant un underscore **que devant les lettres majuscules** (pas devant les chiffres). Conséquence :
- `photoPath1` → Drizzle génère `photo_path1` (sans underscore avant `1`)
- La migration SQL avait créé la colonne `photo_path_1` (avec underscore avant `1`)
- L'INSERT échouait avec "column photo_path1 does not exist" — erreur catchée en prod sans stack trace visible

**Correctif :** migration 0003 renommant les colonnes pour correspondre à ce que Drizzle génère réellement :
```sql
ALTER TABLE "pacal_entry" RENAME COLUMN "photo_path_1" TO "photo_path1";
ALTER TABLE "pacal_entry" RENAME COLUMN "photo_path_2" TO "photo_path2";
```

**Leçon documentée dans `architecture.md` :** ne jamais terminer un nom de champ Drizzle par un chiffre si on s'attend à un underscore avant ce chiffre dans le nom de colonne SQL. Utiliser un suffixe alphabétique ou nommer explicitement la colonne via `d.text("photo_path_1")`.
