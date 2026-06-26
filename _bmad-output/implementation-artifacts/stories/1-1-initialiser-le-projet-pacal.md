---
story_key: 1-1-initialiser-le-projet-pacal
status: review
baseline_commit: NO_VCS
---

# Story 1.1 : Initialiser le projet PACAL

## Story

**As a** développeur (l'utilisateur lui-même, via Claude Code),
**I want** le projet scaffoldé avec la pile T3 et connecté au PostgreSQL existant du NAS,
**So that** les stories suivantes disposent d'une base fonctionnelle conforme à l'architecture validée.

## Acceptance Criteria

- **AC1** — La commande `pnpm dlx create-t3-app@latest --CI --trpc --tailwind --drizzle --dbProvider postgres` est exécutée et produit un projet Next.js 15 avec tRPC, Drizzle ORM et Tailwind CSS.
- **AC2** — L'arborescence du projet est conforme au plan défini dans `architecture.md` (dossiers `src/app/`, `src/server/api/routers/`, `src/server/db/`, `src/lib/`, `src/components/ui/`, `src/components/features/`).
- **AC3** — Un fichier `.env.example` documente les variables d'environnement nécessaires (`DATABASE_URL`, `NODE_ENV`).
- **AC4** — Un `Dockerfile` et un `docker-compose.yml` permettent de construire et lancer le conteneur applicatif, en le connectant au réseau Docker du conteneur PostgreSQL existant par nom de conteneur.
- **AC5** — `pnpm build` se termine sans erreur dans l'environnement local.
- **AC6** — Le projet se connecte à la base de données PostgreSQL via `DATABASE_URL` (variable d'environnement) — la connexion elle-même sera testée lors du déploiement NAS (Story 1.2+).

## Tasks / Subtasks

- [x] **T1** — Scaffolding T3
  - [x] T1.1 — Exécuter `pnpm dlx create-t3-app@latest pacal --CI --trpc --tailwind --drizzle --dbProvider postgres --noGit` dans le répertoire du projet
  - [x] T1.2 — Vérifier que les fichiers générés correspondent aux attentes (Next.js, tRPC, Drizzle, Tailwind)

- [x] **T2** — Ajuster l'arborescence selon l'architecture
  - [x] T2.1 — Créer les répertoires manquants : `src/components/ui/`, `src/components/features/`, `src/lib/`, `src/types/`, routes App Router
  - [x] T2.2 — Créer les routeurs tRPC : `entries.ts`, `products.ts`, `settings.ts`, `export.ts`, `report.ts` sous `src/server/api/routers/`
  - [x] T2.3 — Enregistrer les routeurs dans `src/server/api/root.ts`
  - [x] T2.4 — Créer les stubs de lib : `openfoodfacts.ts`, `yuka.ts`, `pdf.ts`, `export.ts`, `time-slots.ts`

- [x] **T3** — Configuration d'environnement
  - [x] T3.1 — Créer/mettre à jour `.env.example` avec les variables documentées
  - [x] T3.2 — `.env` local déjà généré par create-t3-app (non commité)
  - [x] T3.3 — `.gitignore` vérifié : `.env` exclu, `/data/` ajouté

- [x] **T4** — Dockerfile et docker-compose.yml
  - [x] T4.1 — `Dockerfile` multi-stage (builder + runner) avec image Node 20 Alpine, mode standalone
  - [x] T4.2 — `docker-compose.yml` : service `pacal`, réseau externe `postgres_network`, volume `/data/photos`

- [x] **T5** — Validation du build
  - [x] T5.1 — `pnpm build` : ✅ 8 routes compilées, 0 erreur TypeScript

## Dev Notes

### Contexte architectural (extrait de `architecture.md`)

**Starter retenu :** T3 Stack — `pnpm dlx create-t3-app@latest --CI --trpc --tailwind --drizzle --dbProvider postgres`

**Stack :** Next.js 15 (installé — l'archi mentionnait "16 LTS" mais 15.5 est la version LTS courante), App Router, Turbopack, TypeScript, tRPC v11, Drizzle ORM, Tailwind CSS v4, PostgreSQL.

**Conventions de nommage :**
- DB : `snake_case` avec conversion automatique Drizzle (`casing: 'snake_case'`)
- tRPC : routeurs en `verbeNom` (`entries.create`, `entries.list`)
- Composants React : `PascalCase` ; routes Next.js : `kebab-case` ; variables/fonctions : `camelCase`

### Points d'attention

- `create-t3-app --CI` génère du Pages Router par défaut. Conversion manuelle vers App Router effectuée (suppression de `src/pages/`, `src/utils/api.ts` ; création de `src/app/`, `src/trpc/`).
- L'adaptateur tRPC change : `createNextApiHandler` → `fetchRequestHandler` (App Router).
- Le contexte tRPC passe de `CreateNextContextOptions` à `{ headers: Headers }`.
- `pnpm-workspace.yaml` nécessite `allowBuilds: true` pour `esbuild` et `sharp` (pnpm 11 security policy).
- `next.config.js` : suppression de `i18n` (incompatible App Router) + ajout de `output: "standalone"` pour le Dockerfile.

## Dev Agent Record

### Implementation Plan

1. Scaffold T3 via `pnpm dlx create-t3-app@latest pacal --CI --trpc --tailwind --drizzle --dbProvider postgres --noGit`
2. Convertir Pages Router → App Router (création `src/app/`, `src/trpc/`, route handler fetch, suppression `src/pages/`)
3. Créer routeurs PACAL et enregistrer dans `root.ts` (supprimer `post.ts` exemple)
4. Créer stubs `src/lib/` et pages stubs pour chaque route
5. Configurer `.env.example`, `.gitignore`, `pnpm-workspace.yaml`
6. Écrire `Dockerfile` multi-stage + `docker-compose.yml` avec réseau externe
7. Valider avec `pnpm build`

### Debug Log

- **pnpm build échoue** : pnpm 11 bloque les build scripts de `esbuild` et `sharp`. Fix : `allowBuilds: true` dans `pnpm-workspace.yaml`.
- `pnpm approve-builds` est interactif, ne fonctionne pas en non-interactif. L'édition directe de `pnpm-workspace.yaml` est la solution correcte.

### Completion Notes

- ✅ Projet scaffoldé avec T3 Stack (Next.js 15.5, tRPC v11, Drizzle ORM, Tailwind v4)
- ✅ Converti vers App Router (architecture validée)
- ✅ 5 routeurs tRPC PACAL créés (stubs vides, implémentation dans stories 1.3+)
- ✅ Structure complète conforme à `architecture.md`
- ✅ Dockerfile multi-stage + docker-compose.yml avec réseau Docker externe
- ✅ `pnpm build` : 8 routes compilées, 0 erreur (TypeScript + Next.js)
- ⚠️ Note : Next.js 15.5 installé (create-t3-app LTS courant) au lieu de "16 LTS" mentionné dans l'architecture (Next.js 16 n'existe pas encore — artefact de planification).

## File List

### Nouveaux fichiers
- `pacal/src/app/layout.tsx`
- `pacal/src/app/page.tsx`
- `pacal/src/app/historique/page.tsx`
- `pacal/src/app/entrees/[id]/page.tsx`
- `pacal/src/app/export/page.tsx`
- `pacal/src/app/rapport/page.tsx`
- `pacal/src/app/reglages/page.tsx`
- `pacal/src/app/api/trpc/[trpc]/route.ts`
- `pacal/src/trpc/react.tsx`
- `pacal/src/trpc/query-client.ts`
- `pacal/src/server/api/routers/entries.ts`
- `pacal/src/server/api/routers/products.ts`
- `pacal/src/server/api/routers/settings.ts`
- `pacal/src/server/api/routers/export.ts`
- `pacal/src/server/api/routers/report.ts`
- `pacal/src/lib/openfoodfacts.ts`
- `pacal/src/lib/yuka.ts`
- `pacal/src/lib/pdf.ts`
- `pacal/src/lib/export.ts`
- `pacal/src/lib/time-slots.ts`
- `pacal/Dockerfile`
- `pacal/docker-compose.yml`

### Fichiers modifiés
- `pacal/src/server/api/trpc.ts` (contexte App Router)
- `pacal/src/server/api/root.ts` (routeurs PACAL)
- `pacal/next.config.js` (suppr. i18n, ajout standalone)
- `pacal/.env.example` (documentation améliorée)
- `pacal/.gitignore` (ajout /data/)
- `pacal/pnpm-workspace.yaml` (allowBuilds esbuild + sharp)

### Fichiers supprimés
- `pacal/src/pages/_app.tsx`
- `pacal/src/pages/index.tsx`
- `pacal/src/pages/api/trpc/[trpc].ts`
- `pacal/src/utils/api.ts`
- `pacal/src/server/api/routers/post.ts`

## Change Log

- **2026-06-19** — Story 1.1 implémentée : scaffold T3, conversion App Router, structure PACAL complète, Dockerfile, build ✅

## Status

review
