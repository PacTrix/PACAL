---
id: "1.16"
title: "Menu 'À propos'"
status: "done"
epic: "Epic 1 — V1.2"
fr: ["FR-32"]
dependencies: []
---

# Story 1.16 : Menu "À propos"

## User Story

As a utilisateur,
I want accéder à un écran "À propos" depuis la navigation,
So que j'aie les informations techniques de l'instance en un seul endroit (FR-32).

## Contexte

**Remplacement :** l'affichage de la version et du build sous le titre PACAL dans l'en-tête (Story 1.9, FR-24) est supprimé. Ces informations migrent vers la page "À propos".

**Contenu de la page "À propos" :**
1. **Version et build** : numéro de version (`NEXT_PUBLIC_APP_VERSION`) et date de build (`NEXT_PUBLIC_BUILD_DATE`) — mêmes variables qu'en Story 1.9.
2. **Stack technique** : liste des dépendances clés avec leurs versions npm — à lire depuis `package.json` au build (via `process.env` injecté au build time ou import statique).
3. **Changelog** : texte statique maintenu à la main dans le code (fichier `.ts` ou constante dans la page).

**Dépendances npm à afficher (minimum) :** Next.js, tRPC (@trpc/server), Drizzle ORM (drizzle-orm), Tailwind CSS, @react-pdf/renderer, fflate. Node.js version via `process.version` (côté serveur, à injecter en variable d'env au build si affiché côté client).

## Acceptance Criteria

**Given** que je suis sur n'importe quelle page
**When** je clique sur "À propos" dans la navigation
**Then** j'accède à la page `/a-propos` affichant :
  - Version et date de build
  - Liste de la stack technique avec versions
  - Changelog succinct

**And** le sous-titre de version sous "PACAL" dans l'en-tête a disparu
**And** en l'absence des variables d'environnement de build, la page s'affiche sans erreur (champs optionnels)

## Notes d'implémentation

### Page
- Route : `pacal/src/app/a-propos/page.tsx`
- Lien "À propos" ajouté dans le composant `Nav`.

### Versions des dépendances
Option recommandée : lire `package.json` directement à l'import dans la page serveur (Next.js App Router, Server Component) :
```ts
import pkg from '../../../../package.json';
// pkg.dependencies['next'], pkg.dependencies['drizzle-orm'], etc.
```
Cela évite d'injecter des dizaines de variables d'environnement.

### Changelog (contenu initial pour V1.2)
```
V1.2 (2026-06-28) — Expérience de saisie et identité visuelle
  - Bouton de rafraîchissement de la date/heure
  - Pré-remplissage du dernier contexte
  - Quantité + unité (remplace poids)
  - Type de note
  - Deux photos par fiche
  - Duplication → formulaire prérempli
  - Charte graphique + logo

V1.1 (2026-06-26) — Corrections et améliorations post-V1
  - Affichage version/build dans l'en-tête
  - Suppression et duplication d'entrée
  - Vignette photo dans le rapport PDF

V1.0 (2026-06-18) — Version initiale
  - Saisie, historique, édition, photo, export, rapport PDF
```

### En-tête
- Supprimer le bloc version/build sous le titre dans le composant `Nav` ou `Header`.

## Implémentation réelle (2026-06-28)

**Fichiers modifiés/créés :**
- `src/app/a-propos/page.tsx` — nouvelle page (Server Component)
- `src/components/ui/Nav.tsx` — lien "À propos" ajouté, sous-titre version supprimé

**Décisions prises :**
- Lecture de `package.json` via `require('../../../package.json')` dans un Server Component — évite d'injecter des dizaines de variables d'env au build. Fonctionne car Next.js App Router exécute les Server Components côté serveur.
- PostgreSQL listé comme "runtime" (pas dans package.json) — affiché tel quel dans le tableau stack.
- Changelog maintenu en dur dans la page (constante `CHANGELOG`) — pas de fichier externe à synchroniser.

**Écart par rapport au plan :** la note d'implémentation suggérait une "page/modal" — implémenté comme une page dédiée `/a-propos` (plus simple, cohérent avec la navigation existante).

**Validation :** TypeScript ✓, build ✓ (page statique pré-rendue), testé en production.

### En-tête
- Supprimer le bloc version/build sous le titre dans le composant `Nav` ou `Header`.
