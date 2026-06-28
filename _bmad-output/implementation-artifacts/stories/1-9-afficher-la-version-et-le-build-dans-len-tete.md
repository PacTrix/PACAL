# Story 1.9: Afficher la version et le build dans l'en-tête

---
baseline_commit: b735961c5c33596cfb6dca85503f2d20b0f86195
---

Status: review

## Story

As a utilisateur,
I want voir immédiatement quelle version de PACAL tourne sur mon NAS,
so that je peux identifier sans chercher dans les logs si l'application est à jour (FR-24).

## Acceptance Criteria

1. **Given** que le conteneur Docker est démarré avec les variables `NEXT_PUBLIC_APP_VERSION` et `NEXT_PUBLIC_BUILD_DATE`  
   **When** j'ouvre n'importe quelle page de l'application  
   **Then** le titre "PACAL" est visible dans l'en-tête de navigation

2. **And** sous ce titre, le numéro de version et la date de build sont affichés en plus petit et en italique

3. **And** ces informations sont cohérentes avec les variables d'environnement injectées au build

4. **And** en l'absence des variables (développement local), l'en-tête s'affiche sans erreur (valeurs optionnelles — pas de crash, texte simplement absent)

## Tasks / Subtasks

- [x] Task 1 : Déclarer les variables dans `src/env.js` (AC: 3, 4)
  - [x] Ajouter `NEXT_PUBLIC_APP_VERSION: z.string().optional()` dans le bloc `client`
  - [x] Ajouter `NEXT_PUBLIC_BUILD_DATE: z.string().optional()` dans le bloc `client`
  - [x] Ajouter les deux entrées correspondantes dans `runtimeEnv`

- [x] Task 2 : Modifier `Nav.tsx` pour afficher titre + version (AC: 1, 2, 4)
  - [x] Importer `env` depuis `~/env`
  - [x] Ajouter le titre "PACAL" au-dessus des liens de navigation
  - [x] Ajouter sous le titre la version et la date en plus petit italique, conditionnellement (si `env.NEXT_PUBLIC_APP_VERSION` est défini)

- [x] Task 3 : Mettre à jour `docker-compose.yml` (AC: 3)
  - [x] Ajouter les deux `build-args` dans la section `build` du service `pacal`
  - [x] Ajouter les deux variables dans la section `environment` du service `pacal`
  - [x] Documenter dans un commentaire que ces valeurs doivent être passées à `docker compose build`

## Dev Notes

### Contexte V1.1

Cette story est la première des trois stories de maintenance V1.1. Elle n'a aucune dépendance sur 1.10 ni 1.11 — elle peut être implémentée et déployée indépendamment.

### Fichiers à modifier (UPDATE uniquement — pas de nouveaux fichiers)

| Fichier | Rôle actuel | Modification |
|---------|-------------|--------------|
| `pacal/src/env.js` | Validation des variables d'environnement via `@t3-oss/env-nextjs` | Ajout de 2 variables `NEXT_PUBLIC_*` dans le bloc `client` |
| `pacal/src/components/ui/Nav.tsx` | Navigation globale affichant les 4 liens | Ajout du titre PACAL + ligne version/date |
| `pacal/docker-compose.yml` | Déploiement sur NAS | Ajout des 2 variables dans `build.args` et `environment` |

### État actuel de Nav.tsx

`Nav.tsx` est un composant `"use client"`. Il affiche uniquement les 4 liens de navigation (`Saisie`, `Historique`, `Export`, `Rapport`) dans une `<nav>` avec `max-w-md`. Il n'y a **aucun titre "PACAL" visible** dans la nav — le seul titre présent dans le code est dans les métadonnées `layout.tsx` (`export const metadata`), qui ne s'affiche pas dans l'UI.

La modification ajoute un bloc titre au-dessus du `<div>` des liens, dans le même `<nav>`.

### État actuel de env.js

Le bloc `client` est vide (seul commentaire). Les variables `NEXT_PUBLIC_*` doivent être déclarées dans `client` (pas `server`) pour être accessibles côté client via le bundle Next.js. Les deux variables sont optionnelles (`z.string().optional()`) pour ne pas bloquer `pnpm dev` sans ces variables.

### Pattern d'affichage conditionnel

```tsx
{env.NEXT_PUBLIC_APP_VERSION && (
  <p className="text-xs italic text-gray-400">
    v{env.NEXT_PUBLIC_APP_VERSION}
    {env.NEXT_PUBLIC_BUILD_DATE && ` — ${env.NEXT_PUBLIC_BUILD_DATE}`}
  </p>
)}
```

### Mise à jour docker-compose.yml

Le `docker-compose.yml` actuel ne passe aucun `build-arg`. La structure cible :

```yaml
services:
  pacal:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        # Injecter au build : docker compose build --build-arg APP_VERSION=1.1.0 --build-arg BUILD_DATE=$(date +%Y-%m-%d)
        APP_VERSION: ${APP_VERSION:-}
        BUILD_DATE: ${BUILD_DATE:-}
    environment:
      NEXT_PUBLIC_APP_VERSION: ${APP_VERSION:-}
      NEXT_PUBLIC_BUILD_DATE: ${BUILD_DATE:-}
      # ... variables existantes inchangées
```

**Note importante :** `NEXT_PUBLIC_*` sont des variables inlinées au moment du `next build` (build-time), pas au runtime. Elles doivent donc être disponibles pendant `docker build`, pas seulement au `docker run`. Le `docker-compose.yml` doit les passer comme `build.args` ET comme `environment` (pour cohérence si jamais utilisées côté serveur, mais la valeur effective est celle du build).

### Règles de style à respecter (conventions V1.0)

- Pas d'ajout de dépendance
- Tailwind CSS uniquement pour le style
- Le composant reste `"use client"` (déjà le cas)
- `max-w-md` sur le conteneur principal — à conserver

### Ce qui NE doit PAS changer

- La logique de navigation (liens actifs, `usePathname`) reste identique
- Le layout de `layout.tsx` reste inchangé
- Aucune autre page ni composant n'est modifié

### Project Structure Notes

- `src/env.js` : point d'entrée unique pour toutes les variables d'environnement validées — règle d'architecture, ne jamais lire `process.env` directement dans les composants
- `src/components/ui/Nav.tsx` : composant UI global, importé dans `layout.tsx`
- `docker-compose.yml` : à la racine de `pacal/`, pas à la racine du dépôt

### References

- [Source: architecture.md — Addendum V1.1 — FR-24] Décision d'injecter via `NEXT_PUBLIC_APP_VERSION` / `NEXT_PUBLIC_BUILD_DATE`, variables optionnelles dans `env.js`
- [Source: prd.md §11.1 — FR-24] Exigences testables : visible sans navigation, cohérent avec le build déployé
- [Source: pacal/src/env.js] Structure actuelle à étendre
- [Source: pacal/src/components/ui/Nav.tsx] Composant cible à modifier
- [Source: pacal/docker-compose.yml] Fichier de déploiement à mettre à jour

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Amelia — bmad-dev-story, 2026-06-26)

### Debug Log References

### Completion Notes List

- ✅ `src/env.js` : NEXT_PUBLIC_APP_VERSION et NEXT_PUBLIC_BUILD_DATE déclarées en optionnelles dans le bloc client et runtimeEnv
- ✅ `Nav.tsx` : titre PACAL ajouté, version/date affichés en italique conditionnel sous le titre
- ✅ `docker-compose.yml` : build.args APP_VERSION/BUILD_DATE + environment NEXT_PUBLIC_* ajoutés avec commentaire de commande
- ✅ TypeScript clean (pnpm typecheck sans erreur)
- ✅ Pas de framework de test configuré (architecture V1.0 — différé explicitement)

### File List

- pacal/src/env.js (modifié)
- pacal/src/components/ui/Nav.tsx (modifié)
- pacal/docker-compose.yml (modifié)
