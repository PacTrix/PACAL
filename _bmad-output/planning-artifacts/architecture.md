---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/briefs/brief-PACAL-2026-06-18/brief.md
  - _bmad-output/planning-artifacts/prds/prd-PACAL-2026-06-18/prd.md
  - docs/PACAL-cahier-des-charges.md
workflowType: 'architecture'
lastStep: 8
status: 'complete — addendum V1.1 ajouté 2026-06-26'
project_name: 'PACAL'
user_name: 'Utilisateur'
date: '2026-06-18'
completedAt: '2026-06-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements :**

23 FR organisées en 7 groupes fonctionnels : saisie d'une prise (FR-1 à
FR-6), édition et historique (FR-7, FR-8), export (FR-9), rapport PDF
(FR-10 à FR-12), scan de code-barres et OpenFoodFacts (FR-13 à FR-17),
enrichissement Yuka conditionnel (FR-18), cible calorique et alertes par
créneau (FR-19 à FR-23).

Architecturalement, ça dessine une application assez classique dans sa
forme — CRUD sur une entité centrale (l'Entrée) — mais avec quatre zones qui
méritent une vraie décision plutôt qu'un choix par défaut : le stockage et la
diffusion des photos (un fichier binaire par entrée, pas juste des colonnes
de table), deux intégrations externes de fiabilité inégale (OpenFoodFacts,
stable ; Yuka, incertaine), un calcul dérivé qui n'existe dans aucune table
(l'agrégation par créneau horaire, FR-19 à FR-23, qui doit se recalculer à la
volée à partir des horodatages plutôt que d'être stocké), et la génération de
deux documents de sortie (PDF, export CSV/Excel accompagné des fichiers
photo) qui ne sont pas de simples vues SQL.

**Non-Functional Requirements :**

Les 4 NFR sont structurantes : hébergement auto-géré sur un NAS Synology
DS923+ avec PostgreSQL (NFR-1) ; accès distant hors réseau domestique
obligatoire dès le Lot 1, parce que UJ-1 lui-même en dépend (NFR-2) — c'est
probablement la décision d'architecture la plus conséquente de tout le
document, puisqu'elle conditionne le modèle de sécurité entier ; confidentialité
des données de santé, avec un principe de non-transmission à des tiers hors
des requêtes de recherche par code-barres (NFR-3) ; vitesse de saisie quasi
instantanée, qui interdit qu'une fonctionnalité du Lot 2 ajoute une étape
obligatoire au chemin de saisie de base (NFR-4).

**Échelle et complexité :**

- Domaine technique principal : application web full-stack (API + base de
  données + client web responsive), auto-hébergée.
- Mono-utilisateur, mono-tenant — pas de gestion de comptes multiples, mais
  un besoin réel d'authentification pour l'accès distant (NFR-2).
- Complexité globale : faible à moyenne. Aucune des 23 FR n'est complexe en
  isolation ; la complexité vient de la combinaison (accès distant sécurisé +
  stockage de fichiers + deux intégrations externes + génération de
  documents), pas du volume de fonctionnalités.
- Pas d'epics/stories chargées à ce stade — l'architecture précède cette
  étape dans la séquence Full Method choisie.

### Technical Constraints & Dependencies

- PostgreSQL déjà disponible côté utilisateur ; aucune autre base n'est
  imposée par le PRD.
- Hébergement Synology DS923+ — typiquement via Container Manager
  (Docker) sur ce modèle de NAS.
- Cibles navigateur : Chrome sur Android (smartphone/tablette) et sur Mac.
  Aucune app native prévue.
- Le scan de code-barres (FR-13) suppose un accès caméra depuis le
  navigateur mobile — à valider techniquement (API navigateur de détection
  de code-barres ou bibliothèque dédiée).
- OpenFoodFacts expose une API publique stable (vérifié en phase Brief).
  Yuka n'en expose aucune officiellement — FR-18 reste une investigation, pas
  un engagement.
- Le mode hors ligne est un non-objectif explicite (PRD §6) — l'architecture
  peut donc supposer une connexion permanente au serveur.

### Cross-Cutting Concerns Identified

- **Accès distant et authentification** (NFR-2) — affecte le choix
  d'hébergement réseau, le modèle de sécurité, et potentiellement le choix de
  framework si une couche d'auth légère est nécessaire.
- **Stockage des photos** — affecte le schéma de données, la stratégie de
  sauvegarde, et le format d'export (FR-9 : les photos sortent comme fichiers
  JPG séparés, donc l'export n'est pas un simple CSV mais un paquet
  CSV + fichiers).
- **Agrégation temporelle dérivée** (FR-19 à FR-23) — affecte la conception
  du modèle de données : les créneaux et seuils sont de la configuration, pas
  des données d'entrée, et le calcul se fait toujours a posteriori sur
  l'horodatage des Entrées.
- **Fiabilité variable des sources externes** — OpenFoodFacts (fiable) vs
  Yuka (incertain) appellent une architecture qui isole proprement
  l'enrichissement optionnel du cœur fonctionnel, pour que l'absence de Yuka
  ne dégrade rien d'autre.

## Starter Template Evaluation

### Primary Technology Domain

Application web full-stack, déployée en conteneur unique sur un NAS Synology
DS923+, connectée à un PostgreSQL déjà disponible. Pas de préférence de
langage exprimée par l'utilisateur — le critère décisif est donc l'aisance
d'auto-hébergement et le coût de maintenance pour un développeur solo.

### Starter Options Considérées

- **T3 Stack (`create-t3-app`)** — Next.js + tRPC + Drizzle (ou Prisma) +
  Tailwind CSS + Auth.js, en TypeScript de bout en bout. Maintenu activement
  (28k+ étoiles GitHub, mises à jour suivant les versions majeures de
  Next.js). Le provider PostgreSQL est pris en charge nativement au
  scaffolding. L'image Docker standard de Next.js fonctionne sans
  modification pour un déploiement auto-hébergé — ce qui correspond
  exactement au besoin Synology.
- **Next.js nu (`create-next-app`)** — plus de liberté, mais aucune décision
  pré-câblée (ORM, validation API, auth) : pour un projet solo avec un calendrier
  serré, ça veut dire reproduire à la main une partie de ce que T3 offre déjà.
- **Python (FastAPI) + frontend séparé** — écarté : aucune préférence
  exprimée pour Python, et un découpage en deux services (API + frontend)
  complique l'auto-hébergement en conteneur unique sans bénéfice évident pour
  un produit mono-utilisateur.
- **Boilerplates payants type Supastarter/Makerkit** — écartés : pensés pour
  du SaaS multi-tenant avec facturation, à l'opposé du besoin (un seul
  utilisateur, auto-hébergé, pas de service tiers payant).

### Starter Retenu : T3 Stack (`create-t3-app`)

**Justification :**

Le standard Next.js se déploie en conteneur Docker sans modification — c'est
le critère le plus direct pour l'auto-hébergement Synology (NFR-1). Le
provider PostgreSQL natif évite de reconfigurer quoi que ce soit pour
utiliser la base déjà disponible. La sécurité de type de bout en bout
(base de données → API tRPC → interface) réduit une catégorie d'erreurs
sans ajouter de processus — un vrai avantage quand on travaille seul, sans
relecture de code par un pair. Le projet est un standard ouvert,
gratuit, sans verrouillage propriétaire, activement maintenu depuis 2022.

**Honnêteté sur les limites :** T3 s'assume explicitement comme "pas un
template tout-inclus" — aucun framework de test n'est fourni par défaut, et
rien n'est prévu pour le scan de code-barres ou la génération de PDF (normal,
ce sont des besoins spécifiques à PACAL, pas du T3). Ces choix se feront aux
étapes suivantes. Le choix Drizzle vs Prisma est aussi ouvert au scaffolding :
Drizzle est devenu le défaut communautaire en 2026 (plus léger), Prisma garde
un outil d'administration (Prisma Studio) plus confortable visuellement —
je retiens Drizzle par défaut sauf préférence contraire, parce que la légèreté
compte plus que le confort d'un studio graphique pour un seul utilisateur qui
connaît déjà sa base.

**Commande d'initialisation :**

```bash
pnpm dlx create-t3-app@latest --CI --trpc --tailwind --drizzle --dbProvider postgres
```

*(Auth.js n'est volontairement pas activé à ce stade — la stratégie d'accès
distant et d'authentification, NFR-2, est une décision à part entière de
l'étape suivante, pas un sous-produit automatique du choix de starter.)*

**Décisions architecturales fournies par le starter :**

**Langage & Runtime :** TypeScript de bout en bout, Next.js 16 (LTS), Node.js
20+.

**Solution de style :** Tailwind CSS.

**Outillage de build :** Turbopack (par défaut dans Next.js 16), App Router.

**Framework de test :** non fourni — à ajouter explicitement si souhaité
(non spécifié dans le PRD ; à statuer plus tard si le besoin se confirme).

**Organisation du code :** routeurs tRPC comme couche API typée (pas de
schéma REST séparé à maintenir), schéma et migrations Drizzle pour
PostgreSQL.

**Expérience de développement :** rechargement à chaud, typage de bout en
bout entre la base de données, l'API et l'interface.

*Note : l'initialisation du projet avec cette commande sera la première
story d'implémentation.*

## Core Architectural Decisions

### Decision Priority Analysis

**Décisions critiques (bloquantes pour l'implémentation) :**
- Accès distant et authentification : Tailscale (réseau privé) — résout NFR-2.
- Stockage des photos : fichiers sur un volume Docker monté.
- Schéma de données central (Entrée, configuration des créneaux/cible).

**Décisions importantes (structurent l'architecture) :**
- Validation : Zod côté tRPC.
- Migrations : Drizzle Kit.
- État frontend : React Query (via `@trpc/react-query`).
- Export : paquet CSV + fichiers photo (pas un simple fichier plat).

**Décisions différées (post-MVP ou hors de ce document) :**
- Faisabilité Yuka (FR-18) — investigation dédiée, pas une décision prise ici.
- Mode de saisie vocale/rapide (PRD, Open Question #4) — non nécessaire à ce
  stade.
- Framework de test automatisé — non fourni par le starter, à ajouter si le
  besoin se confirme après le MVP plutôt que par défaut.

### Data Architecture

- **Base de données :** PostgreSQL existant, via Drizzle ORM.
- **Modèle central :**
  - `entries` — id, horodatage, description?, poids estimé?, calories
    estimées?, statut d'estimation (estimé/mesuré), condition de prise (enum
    à 5 valeurs), note?, chemin de la photo?, dates de création/màj.
  - `product_references` — liée 1:1 à une entrée scannée : code-barres,
    instantané des données OpenFoodFacts (kcal/100g ou portion, Nutriscore,
    lien fiche), et score Yuka si FR-18 est retenu.
  - `settings` — ligne unique (mono-utilisateur) : cible calorique
    journalière, liste des créneaux horaires avec leurs bornes et seuils.
- **Photos :** fichiers sur un volume Docker monté (`/data/photos/`),
  référencés par chemin dans `entries.photo_path` — décision utilisateur,
  cohérente avec la sauvegarde NAS existante plutôt qu'avec un nouveau
  système de stockage.
- **Validation :** schémas Zod partagés entre la validation d'entrée tRPC et
  les opérations Drizzle — une seule source de vérité pour la forme des
  données.
- **Migrations :** Drizzle Kit, versionnées dans le dépôt.
- **Cache :** aucun nécessaire à cette échelle (mono-utilisateur).

### Authentication & Security

- **Accès réseau :** Tailscale (paquet officiel Synology, compatible x86_64
  du DS923+). PACAL n'est jamais exposé sur l'internet public — joignable
  uniquement depuis les appareils rattachés au tailnet personnel.
  Décision utilisateur, vérifiée techniquement avant d'être retenue.
- **Authentification applicative :** aucune. Le contrôle d'accès est délégué
  entièrement au réseau privé Tailscale plutôt que dupliqué dans l'app.
  `[NOTE FOR PM]` Si l'usage évoluait vers un appareil partagé avec un tiers
  (non prévu — voir Non-Goals du PRD), cette décision serait à revisiter.
- **Chiffrement :** trafic chiffré de bout en bout par Tailscale (WireGuard)
  entre les appareils et le NAS. La connexion entre le conteneur Next.js et
  PostgreSQL reste interne au réseau Docker du NAS, jamais exposée.
- **HTTPS même en réseau privé :** l'accès caméra du navigateur
  (`getUserMedia`, requis par FR-13) n'est autorisé par les navigateurs que
  dans un contexte sécurisé (HTTPS), même sur un réseau privé Tailscale —
  une IP Tailscale brute en HTTP ne suffit pas. Les certificats HTTPS
  Tailscale (activables depuis la console d'admin, domaine
  `*.ts.net`) doivent donc être activés pour le nœud NAS. *Trouvé en
  validation (step 7) — voir Gap Analysis ci-dessous.*
- **Surface API :** aucune clé publique à protéger ; les seuls appels
  sortants sont vers OpenFoodFacts (et Yuka si retenu), sans authentification
  entrante à gérer.

### API & Communication Patterns

- tRPC comme unique couche API (décidé en step 3) — pas de REST/GraphQL
  séparé, le typage de bout en bout suffit pour un client unique.
- Gestion des erreurs : conventions `TRPCError` standard, traduites en
  messages clairs côté interface plutôt qu'en codes techniques.
- Pas de rate limiting applicatif (mono-utilisateur, aucune exposition
  publique) ; les appels OpenFoodFacts respectent ses limites d'usage par
  défaut.
- Pas de documentation API formelle nécessaire — l'inférence de types tRPC
  suffit pour un unique consommateur interne (le frontend lui-même).

### Frontend Architecture

- App Router (Next.js 16), décidé par le starter.
- État serveur : React Query via `@trpc/react-query` — pas de store global
  (Redux/Zustand) pour ce volume d'écrans.
- Organisation : pages par fonctionnalité (saisie, historique/édition,
  export, rapport, réglages) plutôt qu'un design system élaboré.
- Accès caméra (FR-13) : API navigateur native quand disponible, complétée
  par une bibliothèque de détection de code-barres légère — choix précis de
  bibliothèque différé à l'étape Implementation Patterns.
- Performance/bundle : aucune contrainte particulière à ce stade (trafic
  mono-utilisateur) ; Turbopack (défaut Next.js 16) suffit.

### Infrastructure & Deployment

- Conteneur Docker unique (image Next.js standard) sur le NAS Synology
  DS923+ via Container Manager — décidé en step 3 (NFR-1).
- Tailscale pour l'accès distant (ci-dessus) ; aucun port exposé
  publiquement.
- PostgreSQL tourne déjà sur le NAS, **dans son propre conteneur Docker**
  (confirmé par l'utilisateur — ma première hypothèse d'une instance native
  était fausse). Le conteneur PACAL rejoint le même réseau Docker
  défini par l'utilisateur que le conteneur PostgreSQL existant, et s'y
  connecte par nom de conteneur plutôt que par IP — aucun nouveau conteneur
  de base de données à créer.
- Volumes Docker : un volume pour les photos (`/data/photos/`), monté dans
  le conteneur PACAL.
- **Permissions du volume photos (note ajoutée le 28/06/2026) :** sur
  Synology, un volume monté hérite des permissions du dossier réel côté NAS,
  qui ne correspondent pas forcément à l'utilisateur `nextjs` (uid 1001)
  utilisé dans le conteneur — le `chown`/`chmod` appliqués dans le
  Dockerfile au moment du build ne s'appliquent qu'au système de fichiers
  interne à l'image, et sont écrasés par le montage du volume réel.
  Conséquence observée : écriture des photos en échec silencieux (`EACCES`,
  visible uniquement dans les logs du conteneur). Corrigé en forçant les
  permissions du dossier `data/photos/` à chaque déploiement, dans
  `deploy.sh`, plutôt qu'une seule fois manuellement — voir le journal de
  décisions du PRD pour la chronologie complète de cette découverte.
- CI/CD : aucun pipeline formel — build et déploiement manuels via Docker
  Compose, cohérent avec un usage solo et le calendrier du week-end.
- Monitoring/logs : logs du conteneur (Container Manager) suffisent ; pas
  d'outil d'observabilité dédié à ce stade.
- Sauvegarde : **résolu** — le job Hyper Backup existant de l'utilisateur
  couvre déjà l'ensemble du NAS, y compris le dossier partagé Docker. Le
  volume photos de PACAL en bénéficie automatiquement dès qu'il y est créé ;
  aucune action de configuration supplémentaire n'est nécessaire.

### Decision Impact Analysis

**Séquence d'implémentation suggérée :**
1. Initialiser le projet avec la commande T3 retenue (step 3).
2. Définir le schéma Drizzle (`entries`, `settings`, `product_references`) et
   générer la première migration.
3. Mettre en place Tailscale sur le NAS et vérifier l'accès distant — un
   prérequis d'infrastructure à valider avant toute fonctionnalité métier.
4. Construire le flux de saisie (FR-1 à FR-6) en premier, conformément au
   MVP Scope du PRD.

**Dépendances croisées :**
- Le choix Tailscale élimine toute dépendance à un système d'auth
  applicatif — aucun composant frontend de connexion à construire.
- Le stockage photo en fichiers impose que l'export (FR-9) lise à la fois la
  base et le système de fichiers pour constituer son paquet de sortie.
- L'agrégation par créneau (FR-19 à FR-23) dépend uniquement du schéma
  `settings` et de l'horodatage déjà présent sur `entries` — cohérent avec
  le principe "calcul a posteriori" du PRD, aucune colonne supplémentaire
  requise sur les entrées.

## Implementation Patterns & Consistency Rules

*But de cette section : si l'implémentation se fait sur plusieurs sessions
(Claude Code aujourd'hui, peut-être une autre session dans plusieurs mois),
chaque session démarre sans mémoire des conventions non écrites. Ces règles
évitent qu'une session invente une convention différente de la précédente.
Ce sont des conventions standard de l'écosystème T3, pas des choix exotiques
— elles ne nécessitent pas de débat, juste d'être écrites une fois.*

### Naming Patterns

**Base de données :** identifiants Postgres en `snake_case` (`entries`,
`product_references`, `photo_path`) ; le schéma Drizzle utilise la
conversion de casse automatique (`casing: 'snake_case'`) pour exposer du
`camelCase` côté TypeScript — une seule source de vérité, pas de mapping
manuel à écrire ou à réinventer.

**API (tRPC) :** un routeur par domaine (`entries`, `settings`, `export`,
`report`), procédures nommées en `verbeNom` (`entries.create`,
`entries.list`, `settings.update`). Pas de convention REST à trancher
puisqu'il n'y a pas de REST.

**Code :** composants React en `PascalCase`, segments de route Next.js en
`kebab-case`, fonctions et variables en `camelCase` — conventions standard
TypeScript/React, non spécifiques à PACAL.

### Structure Patterns

- Organisation par fonctionnalité (saisie, historique, export, rapport,
  réglages), conforme à la décision frontend du step 4.
- Emplacements imposés par le starter T3 : routeurs tRPC sous
  `src/server/api/routers/`, schéma Drizzle sous `src/server/db/`.
- Si des tests sont ajoutés plus tard (différé, voir step 4), ils seront
  co-localisés en `*.test.ts` à côté du fichier testé plutôt que dans un
  dossier `__tests__/` séparé — plus simple à retrouver seul.

### Format Patterns

- **Réponses API :** tRPC retourne directement l'objet typé attendu, sans
  enveloppe `{data, error}` artificielle — les erreurs passent par
  `TRPCError`, pas par un champ `error` dans une réponse "réussie".
- **Date/heure :** stockage en `timestamptz` (UTC) dans PostgreSQL ; affichage
  converti au fuseau du navigateur côté client. Sérialisation API en ISO
  8601.
- **JSON :** `camelCase` partout côté API/frontend (cohérent avec la
  conversion de casse Drizzle ci-dessus).

### Communication Patterns

- Pas de système d'événements (pub/sub, websockets) — sans objet pour un
  produit mono-utilisateur sans temps réel ni collaboratif. Mentionné
  explicitement pour qu'une session future n'en introduise pas un par excès
  de précaution.
- État serveur exclusivement via React Query : les indicateurs
  `isPending`/`isError` natifs servent de source unique pour les états de
  chargement et d'erreur, plutôt que des variables d'état dupliquées par
  composant.

### Process Patterns

- **Gestion des erreurs :** `TRPCError` avec un jeu réduit de codes
  (`BAD_REQUEST`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`), traduits vers des
  messages utilisateur en français par une fonction de mapping centrale —
  pas de chaînes d'erreur ad hoc dispersées dans les composants.
- **Validation :** au moment de la soumission, via le même schéma Zod que
  celui utilisé par tRPC — pas de validation agressive à chaque frappe, pour
  préserver la vitesse de saisie (NFR-4).
- **États de chargement :** un indicateur discret sur le bouton
  d'enregistrement de la saisie plutôt qu'un loader plein écran — la saisie
  doit rester perçue comme instantanée (UJ-1, NFR-4).

### Enforcement Guidelines

**Toute session d'implémentation DOIT :**
- Utiliser les schémas Zod partagés comme unique source de validation
  (jamais de validation dupliquée côté composant).
- Respecter la conversion de casse Drizzle plutôt que mélanger `snake_case`
  et `camelCase` dans le même fichier.
- Ne jamais introduire de loader bloquant sur le chemin de saisie de base
  (FR-1 à FR-6) — toute latence perçue y est un défaut, pas un détail.

**Application des règles :** ce document fait foi ; toute déviation
constatée en revue de code doit soit corriger le code, soit mettre à jour ce
document si la règle s'avère mal choisie — jamais laisser les deux diverger
silencieusement.

### Pattern Examples

**Bon exemple :** un nouveau champ ajouté au formulaire de saisie passe par
le schéma Zod partagé, qui est consommé à la fois par le routeur tRPC
(validation serveur) et par le formulaire React (typage des props) — une
seule définition.

**Anti-pattern à éviter :** dupliquer la validation d'un champ dans le
composant React *et* dans le routeur tRPC avec des règles légèrement
différentes — source classique de bugs difficiles à repérer.

## Project Structure & Boundaries

### Arborescence complète du projet

```
pacal/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx                    # Écran de saisie — FR-1 à FR-6
│   │   ├── historique/
│   │   │   └── page.tsx                # Vue historique — FR-8
│   │   ├── entrees/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Édition d'une entrée — FR-7
│   │   ├── export/
│   │   │   └── page.tsx                # Export CSV/Excel + photos — FR-9
│   │   ├── rapport/
│   │   │   └── page.tsx                # Génération du rapport PDF — FR-10 à FR-12
│   │   ├── reglages/
│   │   │   └── page.tsx                # Cible calorique, créneaux — FR-19 à FR-21
│   │   └── api/trpc/[trpc]/route.ts    # Point d'entrée tRPC unique
│   ├── components/
│   │   ├── ui/                         # Éléments génériques (boutons, champs)
│   │   └── features/
│   │       ├── entry-form/             # FR-1 à FR-6, FR-13 à FR-17 (scan)
│   │       ├── entry-history/          # FR-8
│   │       ├── export/                 # FR-9
│   │       ├── report/                 # FR-10 à FR-12
│   │       └── settings/               # FR-19 à FR-21
│   ├── server/
│   │   ├── api/
│   │   │   ├── trpc.ts
│   │   │   ├── root.ts
│   │   │   └── routers/
│   │   │       ├── entries.ts          # FR-1 à FR-8
│   │   │       ├── products.ts         # FR-13 à FR-18 (OpenFoodFacts, Yuka)
│   │   │       ├── settings.ts         # FR-19 à FR-22
│   │   │       ├── export.ts           # FR-9
│   │   │       └── report.ts           # FR-10 à FR-12, FR-23
│   │   └── db/
│   │       ├── index.ts                # Connexion Drizzle/PostgreSQL
│   │       └── schema.ts               # entries, product_references, settings
│   ├── lib/
│   │   ├── time-slots.ts               # Calcul d'agrégation par créneau — FR-22
│   │   ├── openfoodfacts.ts            # Client API OpenFoodFacts — FR-13 à FR-16
│   │   ├── yuka.ts                     # Adaptateur Yuka, isolé et activable/désactivable — FR-18
│   │   ├── pdf.ts                      # Génération du rapport — FR-10 à FR-12
│   │   │                                # via @react-pdf/renderer (rendu React → PDF,
│   │   │                                # évite un Chrome headless lourd sur le NAS)
│   │   └── export.ts                   # Constitution du paquet CSV + fichiers photo — FR-9
│   └── types/
├── public/
└── data/                                # Volume Docker monté, hors dépôt git
    └── photos/
```

### Architectural Boundaries

**Frontière API :** tRPC uniquement (`src/server/api/`) — aucune route REST
publique. Tout accès aux données passe par un routeur.

**Frontière composants :** chaque dossier sous `components/features/`
possède son interface et ses hooks tRPC ; un composant d'une fonctionnalité
n'appelle jamais directement le code interne d'une autre fonctionnalité.

**Frontière données :** seul `server/db/` accède directement à PostgreSQL.
Les routeurs sont les seuls appelants de `server/db/` — jamais un composant
React, jamais une fonction de `lib/`.

**Frontière intégrations externes :** `lib/openfoodfacts.ts` et `lib/yuka.ts`
sont les **seuls** points du code qui effectuent des appels réseau sortants.
Cet isolement matérialise directement le constat de l'étape 2 (fiabilité
inégale des deux sources) : retirer Yuka un jour ne touche qu'un seul
fichier.

**Frontière photos :** les fichiers sous `data/photos/` ne sont jamais
servis comme dossier statique public — toujours via une route serveur qui
contrôle l'accès, même si Tailscale gère déjà le périmètre réseau (défense
en profondeur peu coûteuse).

### Requirements to Structure Mapping

- **Saisie, édition, historique** (FR-1 à FR-8) → `entries.ts` (routeur),
  `entry-form/` et `entry-history/` (composants), `app/`, `app/entrees/`,
  `app/historique/`.
- **Export** (FR-9) → `export.ts` (routeur), `lib/export.ts` (constitution
  du paquet), `export/` (composant), `app/export/`.
- **Rapport PDF** (FR-10 à FR-12) → `report.ts` (routeur), `lib/pdf.ts`,
  `report/` (composant), `app/rapport/`.
- **Scan et enrichissement produit** (FR-13 à FR-18) → `products.ts`
  (routeur), `lib/openfoodfacts.ts`, `lib/yuka.ts`, intégrés dans
  `entry-form/`.
- **Cible calorique et alertes par créneau** (FR-19 à FR-23) → `settings.ts`
  (routeur), `lib/time-slots.ts`, `settings/` (composant), `app/reglages/`,
  et l'affichage du cumul dans `entry-form/`.

### Integration Points

**Communication interne :** les composants appellent exclusivement les
hooks tRPC générés (`api.entries.create.useMutation()`, etc.) — jamais de
`fetch()` direct vers une route applicative.

**Intégrations externes :** uniquement depuis `lib/openfoodfacts.ts` et
`lib/yuka.ts`, toujours côté serveur (jamais depuis le bundle client) — ce
qui garde l'audit de NFR-3 (aucune donnée personnelle transmise hors du
code-barres) limité à deux fichiers.

**Flux de données :** soumission du formulaire → mutation tRPC (validée par
le schéma Zod partagé) → écriture Drizzle dans PostgreSQL ; le fichier photo
est écrit dans `data/photos/` par le même gestionnaire de mutation, et son
chemin stocké dans la ligne `entries`.

### File Organization Patterns

- Fichiers de configuration à la racine, conformes aux conventions T3
  (pas de réorganisation maison).
- Code source sous `src/`, organisé par fonctionnalité plutôt que par type
  technique (cohérent avec la décision frontend du step 4).
- Aucun dossier de test imposé pour l'instant (différé, step 4) ; si ajouté,
  co-localisation `*.test.ts`.
- Les photos vivent dans `data/photos/`, **hors du dépôt git**, sur le
  volume Docker monté — jamais commitées, jamais dans `public/`.

### Development Workflow Integration

**Développement :** `pnpm dev` lance Next.js (Turbopack) en local, connecté
au PostgreSQL existant du NAS (ou à une instance locale pour le
développement hors NAS, à configurer via `.env`).

**Build :** `next build` standard, image Docker construite à partir du
`Dockerfile` fourni par le starter T3 sans modification.

**Déploiement :** `docker compose up` sur le NAS, conteneur PACAL rejoignant
le réseau Docker du conteneur PostgreSQL existant (step 4) ; accès exclusif
via Tailscale, aucun port publié sur l'interface publique du NAS.

## Architecture Validation Results

### Coherence Validation ✅

**Compatibilité des décisions :** T3 Stack (Next.js 16, tRPC, Drizzle,
Tailwind) forme un ensemble cohérent et activement maintenu ; aucune
incompatibilité de version relevée. Tailscale, choisi pour NFR-2, ne
contraint aucune des décisions de la pile applicative.

**Cohérence des patterns :** les patterns de nommage (casse Drizzle
automatique) et de structure (organisation par fonctionnalité) s'alignent
avec les choix du starter sans contradiction.

**Alignement de la structure :** l'arborescence du step 6 respecte
strictement les frontières définies au step 5 (API tRPC uniquement, accès
DB limité à `server/db/`, intégrations externes isolées dans `lib/`).

### Requirements Coverage Validation ✅

**Couverture des FR :** les 23 FR sont toutes mappées à un emplacement
précis (step 6). Aucune FR sans support architectural identifié.

**Couverture des NFR :**
- NFR-1 (plateforme/hébergement) — couverte par le starter et le step 4.
- NFR-2 (accès distant) — couverte par Tailscale ; **un point a été corrigé
  pendant cette validation** (voir Gap Analysis).
- NFR-3 (confidentialité) — couverte par l'isolement des intégrations
  externes (step 6) et l'absence d'exposition publique (Tailscale).
- NFR-4 (vitesse de saisie) — couverte par l'absence de validation
  agressive et l'usage de React Query ; **une amélioration optionnelle est
  proposée ci-dessous, non bloquante.**

### Implementation Readiness Validation ✅

Toutes les décisions critiques portent une version vérifiée par recherche
web (Next.js 16.2 LTS, create-t3-app 7.40). Les patterns couvrent les cinq
catégories de conflits potentiels (nommage, structure, format,
communication, process). La structure de projet est complète et nominative,
pas un squelette générique.

### Gap Analysis Results

**Lacune critique trouvée et corrigée pendant cette validation :**
L'accès caméra du navigateur (`getUserMedia`, requis par FR-13) exige un
contexte sécurisé HTTPS — y compris sur un réseau privé Tailscale, une IP
brute en HTTP ne suffit pas. **Résolu :** activation des certificats HTTPS
Tailscale (`*.ts.net`) pour le nœud NAS, ajoutée à la section
Authentication & Security. Sans cette correction, FR-13 (scan de
code-barres) aurait échoué silencieusement en implémentation malgré un
accès réseau fonctionnel — exactement le genre d'écart qu'une validation
explicite est censée attraper avant le code plutôt qu'après.

**Lacune importante trouvée et corrigée :** la bibliothèque de génération
PDF (FR-10 à FR-12) n'était pas nommée jusqu'ici, seulement son emplacement
(`lib/pdf.ts`). **Résolu :** `@react-pdf/renderer` retenu — rendu React vers
PDF, évite de faire tourner un Chrome headless (Puppeteer) sur un NAS aux
ressources limitées.

**Amélioration non bloquante proposée :** pour renforcer NFR-4 au-delà du
minimum déjà couvert, la mutation tRPC de sauvegarde d'une entrée pourrait
utiliser une mise à jour optimiste de React Query (l'interface se met à
jour avant la confirmation serveur). Non requis pour le MVP, mais peu
coûteux à ajouter si la vitesse perçue de UJ-1 le justifie en usage réel.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Statut global :** READY FOR IMPLEMENTATION

**Niveau de confiance :** élevé — les deux lacunes trouvées pendant cette
validation portaient sur des détails techniques précis (HTTPS sur réseau
privé, choix de bibliothèque PDF), pas sur des décisions structurantes ; les
deux sont désormais résolues dans le document.

**Forces principales :**
- Isolement net des deux sources externes de fiabilité inégale
  (OpenFoodFacts/Yuka) dans des fichiers dédiés.
- Choix d'accès distant (Tailscale) qui élimine une catégorie entière de
  code à écrire et maintenir (authentification applicative).
- Mapping explicite et complet des 23 FR vers des fichiers précis.

**Pistes d'amélioration future :**
- Mise à jour optimiste pour la saisie (ci-dessus), si l'usage réel le
  justifie.
- Ajout d'un framework de test si la maintenance long terme du projet le
  justifie après le MVP.

### Implementation Handoff

**Consignes pour toute session d'implémentation (Claude Code ou autre) :**
- Suivre les décisions architecturales telles que documentées ici, sans les
  rejouer.
- Appliquer les patterns d'implémentation de façon uniforme sur tous les
  composants.
- Respecter la structure et les frontières définies au step 6.
- Se référer à ce document pour toute question architecturale plutôt que
  d'improviser une nouvelle convention.

**Première priorité d'implémentation :**

```bash
pnpm dlx create-t3-app@latest --CI --trpc --tailwind --drizzle --dbProvider postgres
```

Puis : activer les certificats HTTPS Tailscale sur le NAS *avant* d'écrire
la moindre fonctionnalité de scan — c'est un prérequis d'infrastructure, pas
une story applicative.

---

## Addendum V1.1 — Décisions d'architecture (2026-06-26)

### Contexte de la révision

La V1.0 est déployée et utilisée. Les FR-24 à FR-27 (PRD §11) constituent une maintenance évolutive mineure. Aucune décision d'architecture V1.0 n'est remise en cause. Cet addendum documente uniquement les choix d'implémentation nouveaux ou modifiés.

Code inspecté avant rédaction : `src/app/layout.tsx`, `src/components/ui/Nav.tsx`, `src/server/api/routers/entries.ts`, `src/components/features/entry-history/EntryList.tsx`, `src/lib/pdf.tsx`, `src/env.js`, `next.config.js`.

---

### FR-24 — Affichage version et build dans l'en-tête

**Décision : variables d'environnement `NEXT_PUBLIC_*` injectées au build Docker.**

- Deux variables ajoutées : `NEXT_PUBLIC_APP_VERSION` (ex. `1.1.0`) et `NEXT_PUBLIC_BUILD_DATE` (ex. `2026-06-26`).
- Ces variables sont déclarées dans `src/env.js` côté `client` (préfixe `NEXT_PUBLIC_`) avec `z.string().optional()` — optionnelles pour ne pas bloquer le `pnpm dev` local sans les avoir définies.
- Affichage dans `Nav.tsx` : ajout d'un titre "PACAL" au-dessus des liens de navigation (actuellement absent de la nav — le titre n'apparaît nulle part dans l'UI V1.0), avec la version et la date en dessous en plus petit et italique.
- Aucune modification du schéma de données, aucune migration requise.

**Pourquoi pas un fichier de version :** l'injection par variable d'environnement au build Docker est la pratique standard pour les conteneurs — elle évite de gérer un fichier de version en plus du `package.json`, et la valeur est disponible côté client sans requête serveur supplémentaire.

**Impact Dockerfile :** le `docker compose` de déploiement devra passer `NEXT_PUBLIC_APP_VERSION` et `NEXT_PUBLIC_BUILD_DATE` en `build-args`. À documenter dans le `docker-compose.yml`.

---

### FR-25 — Suppression d'une entrée

**Décision : nouvelle procédure `entries.delete` dans le routeur existant + suppression du fichier photo côté serveur.**

- Procédure tRPC : `entries.delete` (mutation, input `{ id: number }`).
- Séquence côté serveur :
  1. Récupérer l'entrée (pour obtenir `photoPath`) via `getById` ou une requête inline.
  2. Si `photoPath` est non null, supprimer le fichier du volume `data/photos/` via `fs.unlink` (Node.js natif — pas de dépendance supplémentaire).
  3. Supprimer la ligne en base avec Drizzle.
- En cas d'erreur `fs.unlink` (fichier déjà absent) : log d'avertissement, opération non bloquante — la ligne est supprimée de la base dans tous les cas. Un fichier orphelin vaut mieux qu'une suppression incomplète.
- Frontend (`EntryList.tsx`) : ajout d'un bouton "Supprimer" sur chaque carte. Un dialog de confirmation natif (`window.confirm`) est suffisant pour ce cas d'usage mono-utilisateur — pas de composant de modal dédié.
- Invalidation React Query : `utils.entries.list.invalidate()` après la mutation, pattern déjà en place dans les autres mutations.
- Aucune migration de schéma requise.

**Frontière importante :** la suppression du fichier photo se fait **dans le routeur tRPC**, pas dans `lib/pdf.ts` ni dans un handler séparé — cohérent avec la règle existante "seul `server/db/` accède à PostgreSQL, les routeurs sont les seuls appelants". L'accès filesystem est une opération de la même couche que l'accès DB pour cette mutation.

---

### FR-26 — Duplication d'une entrée

**Décision : pas de nouvelle procédure tRPC — réutilisation de `entries.create` existant.**

La duplication est une opération UX, pas une opération de données nouvelle. Mécanisme :
- Bouton "Dupliquer" dans `EntryList.tsx` sur chaque carte.
- Au clic : appel de `entries.create.useMutation()` avec les valeurs de l'entrée source (description, poids, calories, condition, note) et `timestamp: new Date()`.
- La photo n'est pas dupliquée (décision PRD FR-26) — `photoPath` n'est pas transmis.
- Après succès de la mutation, invalidation de `entries.list` pour rafraîchir la liste.

**Alternative écartée — navigation vers le formulaire de saisie pré-rempli via URL params :** techniquement faisable (passer les valeurs en query string vers `/`), mais fragile (longueur d'URL, encodage des caractères spéciaux dans les champs texte) et ne respecte pas la séparation des responsabilités — `EntryList` ne devrait pas construire une URL de navigation avec des données d'une autre vue. La mutation directe est plus robuste.

---

### FR-27 — Layout 3 colonnes avec vignette photo dans le rapport PDF

**Décision : `Image` de `@react-pdf/renderer` avec lecture de fichier côté serveur, layout `flexDirection: "row"` à 3 colonnes.**

`@react-pdf/renderer` expose un composant `Image` qui accepte un chemin de fichier local (côté serveur Node.js) ou un Buffer base64. Puisque `renderRapport` s'exécute côté serveur (route `GET /api/rapport`), les fichiers `data/photos/` sont accessibles directement par chemin absolu via `PHOTOS_DIR` (déjà utilisé dans la route photos V1.0).

**Structure de layout :**

```
entryRow (flexDirection: "row", alignItems: "flex-start")
├── col_time (width: 40pt)
├── col_content (flex: 1)  ← tout le contenu textuel existant
└── col_photo (width: ~57pt ≈ 2cm à 72dpi)
    └── Image (height: ~57pt, objectFit: "contain") si photoPath présent
        ou View vide si absent
```

- La largeur de la colonne photo est fixée à ~57pt (2 cm × 28.35 pt/cm ≈ 56.7 pt, arrondi à 57pt).
- `objectFit: "contain"` préserve le ratio d'aspect sans déformation.
- La colonne photo est **toujours rendue** (View avec largeur fixe), même sans photo — évite un décalage de layout entre les lignes.
- L'actuelle mention textuelle `"Photo jointe"` (style `photo` en V1.0) est supprimée et remplacée par la vignette.

**Gestion d'erreur lecture fichier :** si `fs.existsSync(photoPath)` retourne false (photo référencée en base mais absente du volume), la colonne photo reste vide plutôt que de faire planter la génération du PDF entier — même politique de tolérance que pour la suppression (FR-25).

**Refactoring du composant `RapportPDF` :** le layout actuel de `entry` utilise `marginLeft: 40` pour indenter le contenu sous l'heure (pattern `indent`). Ce pattern sera remplacé par le layout 3 colonnes — la migration est localisée dans `lib/pdf.tsx`, sans impact sur d'autres fichiers.

**Pas de nouvelle dépendance :** `@react-pdf/renderer` supporte déjà `Image` — aucun package à ajouter.

---

### Résumé des impacts V1.1

| FR | Fichiers modifiés | Nouveaux fichiers | Migration DB |
|----|-------------------|-------------------|--------------|
| FR-24 | `src/env.js`, `src/components/ui/Nav.tsx`, `docker-compose.yml` | — | Non |
| FR-25 | `src/server/api/routers/entries.ts`, `src/components/features/entry-history/EntryList.tsx` | — | Non |
| FR-26 | `src/components/features/entry-history/EntryList.tsx` | — | Non |
| FR-27 | `src/lib/pdf.tsx` | — | Non |

**Aucune migration de schéma de données requise pour V1.1.** Toutes les modifications sont localisées dans la couche présentation (frontend) ou la couche service (routeur, lib). Le modèle de données `entries` reste inchangé.


