---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-PACAL-2026-06-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/briefs/brief-PACAL-2026-06-18/brief.md
---

# PACAL - Epic Breakdown

## Overview

Ce document décompose les exigences du PRD et les décisions d'Architecture
de PACAL en epics et stories implémentables. Pas de document UX séparé —
l'entrée Vision+Fonctionnalités a été retenue en PRD ; les parcours
utilisateurs (UJ-1 à UJ-3) y tiennent lieu de référence UX.

## Requirements Inventory

### Functional Requirements

FR1: L'utilisateur arrive sur un formulaire de saisie vierge à chaque ouverture de l'app — aucun écran intermédiaire.
FR2: Le formulaire pré-remplit la date/heure courantes, modifiables y compris vers le passé ; les entrées sont listées en ordre antéchronologique.
FR3: La description, le poids estimé et les calories estimées sont tous optionnels — une entrée "instant" peut être enregistrée sans eux.
FR4: L'utilisateur sélectionne une condition de prise unique parmi 5 valeurs fixes (obligatoire).
FR5: L'utilisateur peut attacher au plus une photo par entrée, soit par prise directe (caméra), soit par sélection depuis une photo existante.
FR6: L'utilisateur peut ajouter une note en texte libre, sans contrainte de longueur côté interface.
FR7: L'utilisateur peut modifier n'importe quel champ d'une entrée existante, y compris l'horodatage et la condition de prise.
FR8: L'utilisateur peut consulter une liste antéchronologique des entrées pour en sélectionner une à éditer.
FR9: L'utilisateur peut exporter ses entrées en CSV/Excel (période ou historique complet) ; les photos sont exportées en fichiers JPG séparés (nommés par horodatage), référencés par un champ de l'export.
FR10: L'utilisateur peut générer un rapport PDF pour une période choisie, regroupé jour par jour.
FR11: Les entrées non-alimentaires apparaissent dans le rapport PDF au même titre que les prises alimentaires, à leur horodatage réel.
FR12: Le rapport distingue visuellement une valeur estimée d'une valeur mesurée (issue d'un scan).
FR13: Depuis mobile/tablette, l'utilisateur peut scanner un code-barres via la caméra pour lancer une recherche OpenFoodFacts (non disponible sur Mac/Chrome par ce mécanisme).
FR14: Une fiche produit trouvée préremplit la description et les calories de l'entrée, statut d'estimation positionné sur "mesuré".
FR15: PACAL recalcule automatiquement les calories selon la quantité réellement consommée (gestion kcal/100g/100ml vs portion).
FR16: Le Nutriscore et un lien vers la fiche OpenFoodFacts sont affichés quand disponibles.
FR17: Sur toute plateforme (y compris Mac/Chrome), l'utilisateur peut saisir un code-barres au clavier comme repli.
FR18: Une investigation technique (spike) détermine la faisabilité d'un enrichissement Yuka avant tout engagement ferme ; si viable, score/100, lien fiche et remarques santé sont affichés.
FR19: L'utilisateur définit une cible calorique journalière, modifiable à tout moment.
FR20: L'utilisateur définit des créneaux horaires configurables (bornes libres), indépendamment de la saisie d'entrée.
FR21: L'utilisateur fixe un seuil par créneau (kcal absolu ou % de la cible journalière).
FR22: PACAL calcule, pour chaque créneau et chaque jour, le cumul calorique des entrées dont l'horodatage tombe dans ce créneau — calcul a posteriori, jamais de saisie de créneau.
FR23: Le cumul du jour est affiché en continu (passif) ; un signal visuel actif apparaît quand un créneau ou le total dépasse son seuil, même si le total journalier reste dans la cible.

### NonFunctional Requirements

NFR1: PACAL est un site web auto-hébergé sur le NAS Synology DS923+ de l'utilisateur, avec PostgreSQL comme base de données, accessible depuis Android (Chrome) et Mac (Chrome).
NFR2: L'application doit être joignable depuis l'extérieur du réseau domestique (plusieurs parcours, dont UJ-1, en dépendent), avec un niveau d'authentification/accès approprié à des données de santé personnelles.
NFR3: Aucune donnée personnelle n'est transmise à un tiers, à l'exception des requêtes de recherche par code-barres (OpenFoodFacts, et Yuka si retenu), qui ne contiennent que le code-barres lui-même.
NFR4: La saisie d'une entrée simple doit rester perceptiblement instantanée (cible : moins de 20 secondes pour UJ-1) ; aucune fonctionnalité du Lot 2 ne doit ajouter d'étape obligatoire au chemin de saisie de base.

### Additional Requirements

- **Starter / Epic 1 Story 1** : initialiser le projet avec `pnpm dlx create-t3-app@latest --CI --trpc --tailwind --drizzle --dbProvider postgres` (Next.js 16 LTS, tRPC, Drizzle, Tailwind, provider PostgreSQL).
- **Infrastructure** : conteneur Docker unique (image Next.js standard) sur le NAS Synology DS923+ via Container Manager ; rejoint le réseau Docker du conteneur PostgreSQL déjà existant sur le NAS (connexion par nom de conteneur, pas de nouveau conteneur de base de données).
- **Accès distant et sécurité (résout NFR2)** : Tailscale (paquet officiel Synology, compatible DS923+) comme unique mécanisme d'accès distant — aucune authentification applicative, aucune exposition publique. Les certificats HTTPS Tailscale (`*.ts.net`) doivent être activés sur le nœud NAS *avant* toute fonctionnalité dépendant de la caméra (FR13) — l'accès `getUserMedia` exige un contexte sécurisé même sur le réseau privé.
- **Stockage des photos** : fichiers sur un volume Docker monté (`/data/photos/`), référencés par chemin dans `entries.photo_path` ; déjà couvert par le job Hyper Backup existant de l'utilisateur (pas de configuration de sauvegarde supplémentaire).
- **Génération PDF** : bibliothèque `@react-pdf/renderer` (rendu React → PDF, évite un Chrome headless sur le NAS).
- **Modèle de données** : tables `entries`, `product_references` (liée 1:1 à une entrée scannée), `settings` (ligne unique — cible calorique, créneaux horaires et seuils). Validation par schémas Zod partagés entre tRPC et Drizzle.
- **Isolement des intégrations externes** : `lib/openfoodfacts.ts` et `lib/yuka.ts` sont les seuls fichiers autorisés à effectuer des appels réseau sortants, toujours côté serveur.
- **Aucun framework de test imposé** pour le MVP (différé, non bloquant).
- **Aucun système d'authentification applicative, de cache, ni de pipeline CI/CD formel** requis à ce stade — décisions explicites, pas des oublis.

### UX Design Requirements

Aucun document UX séparé. Les parcours utilisateurs UJ-1 (saisie rapide en
sortant du resto), UJ-2 (entrée "instant" sans nourriture) et UJ-3
(préparation d'un rendez-vous diététique) — détaillés au PRD §2.3 — servent
de référence comportementale pour les stories ci-dessous.

### FR Coverage Map

FR1-FR8: Epic 1 — saisie, édition, historique des entrées.
FR9: Epic 1 — export CSV/Excel + photos.
FR10-FR12: Epic 1 — rapport PDF.
FR13-FR17: Epic 2 — scan de code-barres et enrichissement OpenFoodFacts.
FR18: Epic 2 — investigation Yuka.
FR19-FR23: Epic 2 — cible calorique et alertes par créneau.
NFR1-NFR4: couvertes transversalement par Epic 1 (l'infrastructure, l'accès
distant Tailscale+HTTPS et la vitesse de saisie sont des prérequis du
chemin de base, pas d'une fonctionnalité du Lot 2).

## Epic List

### Epic 1 : Capturer et restituer ses prises
L'utilisateur peut enregistrer n'importe quel instant (alimentaire ou non)
en quelques secondes avec horodatage, photo et contexte, retrouver et
corriger une entrée passée, puis en sortir un export brut ou un rapport PDF
prêt pour une consultation diététique. C'est le MVP au sens du PRD (Lot 1) —
une boucle complète et autonome de bout en bout : saisir, corriger,
exploiter.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12
**NFRs covered:** NFR1, NFR2, NFR3, NFR4 (prérequis transversaux : starter
T3, infrastructure Docker/NAS, Tailscale + HTTPS, stockage photo)

### Epic 2 : Accélérer la saisie et piloter ses apports
En s'appuyant sur les entrées d'Epic 1, l'utilisateur peut scanner un
code-barres pour préremplir une entrée plutôt que tout saisir à la main, et
définir une cible calorique journalière avec des alertes par créneau
horaire pour repérer une répartition déséquilibrée dans la journée. C'est le
Lot 2 du PRD — un enrichissement assumé, pas un prérequis du MVP.
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23

## Epic 1: Capturer et restituer ses prises

L'utilisateur peut enregistrer n'importe quel instant (alimentaire ou non)
en quelques secondes avec horodatage, photo et contexte, retrouver et
corriger une entrée passée, puis en sortir un export brut ou un rapport PDF
prêt pour une consultation diététique.

*NFR1 (plateforme), NFR3 (confidentialité) et NFR4 (vitesse de saisie) sont
des exigences transversales vérifiées sur chaque story de cet epic plutôt
que traitées comme une story à part — elles n'ont pas de valeur utilisateur
isolée.*

### Story 1.1: Initialiser le projet PACAL

As a développeur (l'utilisateur lui-même, via Claude Code),
I want le projet scaffoldé avec la pile T3 et connecté au PostgreSQL existant du NAS,
So that les stories suivantes disposent d'une base fonctionnelle conforme à l'architecture validée.

**Acceptance Criteria:**

**Given** un environnement Node.js 20+ et le NAS Synology DS923+ accessible
**When** la commande `pnpm dlx create-t3-app@latest --CI --trpc --tailwind --drizzle --dbProvider postgres` est exécutée
**Then** un projet Next.js 16 avec tRPC, Drizzle et Tailwind est généré, conforme à l'arborescence définie dans `architecture.md`
**And** le conteneur applicatif rejoint le réseau Docker du conteneur PostgreSQL existant et s'y connecte par nom de conteneur

### Story 1.2: Accéder à PACAL depuis l'extérieur du réseau domestique

As a utilisateur,
I want pouvoir atteindre PACAL depuis n'importe où,
So that je peux logger une prise immédiatement en sortant d'un restaurant (UJ-1).

**Acceptance Criteria:**

**Given** Tailscale installé et activé sur le NAS Synology DS923+ (résout NFR2)
**When** je me connecte depuis un appareil rattaché à mon tailnet personnel, hors du réseau domestique
**Then** PACAL est accessible via son adresse `*.ts.net`
**And** la connexion s'effectue en HTTPS (certificat Tailscale activé), jamais en HTTP brut
**And** PACAL n'est joignable depuis aucune autre adresse publique

### Story 1.3: Saisir une prise avec horodatage et contexte

As a utilisateur,
I want enregistrer une prise — alimentaire ou non — en quelques secondes,
So that je capture le moment exact sans effort de saisie (FR1, FR2, FR3, FR4, FR6).

**Acceptance Criteria:**

**Given** que j'ouvre l'application
**When** l'écran se charge
**Then** je suis directement sur le formulaire de saisie, sans écran intermédiaire
**And** la date/heure courantes sont pré-remplies et modifiables, y compris vers le passé
**And** je choisis une condition de prise parmi les 5 valeurs fixes — champ obligatoire
**And** la description, le poids estimé et les calories estimées sont tous facultatifs
**And** je peux ajouter une note libre sans limite de longueur perceptible
**And** je peux enregistrer une entrée ne contenant que l'horodatage, la condition et une note, sans erreur de validation
**And** la table `entries` (horodatage, description, poids, calories, statut d'estimation, condition, note) est créée par migration Drizzle à cette étape — pas avant

### Story 1.4: Joindre une photo à une prise

As a utilisateur,
I want attacher une photo à une prise, en la prenant sur le moment ou en choisissant une photo existante,
So that je garde un souvenir visuel de la prise (FR5).

**Acceptance Criteria:**

**Given** que je suis sur le formulaire de saisie
**When** j'appuie sur le bouton appareil photo
**Then** la caméra s'active et la photo prise est attachée à l'entrée
**And** je peux, alternativement, choisir une photo déjà existante sur l'appareil, avec le même résultat
**And** une entrée sans photo reste valide
**And** attacher une nouvelle photo à une entrée qui en a déjà une remplace la précédente plutôt que d'en ajouter une seconde
**And** la colonne `photo_path` est ajoutée à la table `entries` par une migration dédiée à cette story

### Story 1.5: Consulter l'historique des prises

As a utilisateur,
I want voir la liste de mes prises passées,
So that je peux les retrouver pour les corriger ou les consulter (FR8).

**Acceptance Criteria:**

**Given** que j'ai déjà enregistré une ou plusieurs prises
**When** j'ouvre la vue historique
**Then** je vois mes entrées triées de la plus récente à la plus ancienne
**And** je peux sélectionner une entrée pour ouvrir son détail

### Story 1.6: Modifier une prise existante

As a utilisateur,
I want corriger une prise déjà enregistrée,
So that une estimation provisoire puisse être ajustée plus tard (FR7).

**Acceptance Criteria:**

**Given** que j'ai sélectionné une entrée depuis l'historique
**When** je modifie un ou plusieurs champs, y compris l'horodatage ou la condition de prise
**Then** les modifications sont enregistrées
**And** elles se reflètent dans les exports et rapports générés par la suite

### Story 1.7: Exporter mes données

As a utilisateur,
I want exporter mes prises en CSV/Excel,
So that je peux les retravailler dans un tableur (FR9).

**Acceptance Criteria:**

**Given** que j'ai des entrées enregistrées
**When** je lance un export, avec ou sans filtre de période
**Then** je reçois un fichier contenant une ligne par entrée avec tous ses champs, y compris les entrées "instant"
**And** le statut d'estimation (estimé/mesuré) figure comme colonne explicite
**And** les photos sont fournies en fichiers JPG séparés, nommés par horodatage, référencés par un champ de l'export

### Story 1.8: Générer un rapport PDF pour une consultation

As a utilisateur,
I want générer un rapport PDF de mes prises sur une période,
So that je peux le présenter à mon diététicien sans reconstitution manuelle (FR10, FR11, FR12).

**Acceptance Criteria:**

**Given** que je choisis une période contenant au moins une entrée
**When** je génère le rapport
**Then** j'obtiens un PDF regroupant les entrées jour par jour
**And** les entrées non-alimentaires apparaissent au même titre que les prises alimentaires, à leur horodatage réel
**And** une journée ne contenant que des entrées "instant" produit une section lisible, pas une section vide ou cassée
**And** chaque valeur de poids/calories est visuellement marquée comme estimée ou mesurée

---

### V1.1 — Évolutions et corrections (2026-06-26)

*Stories 1.9 à 1.11 correspondent aux FR-24 à FR-27 du PRD §11. Aucune migration de schéma requise. Voir addendum V1.1 dans `architecture.md` pour les décisions d'implémentation.*

### Story 1.9: Afficher la version et le build dans l'en-tête

As a utilisateur,
I want voir immédiatement quelle version de PACAL tourne sur mon NAS,
So that je peux identifier sans chercher dans les logs si l'application est à jour (FR-24).

**Acceptance Criteria:**

**Given** que le conteneur Docker est démarré avec les variables d'environnement `NEXT_PUBLIC_APP_VERSION` et `NEXT_PUBLIC_BUILD_DATE`
**When** j'ouvre n'importe quelle page de l'application
**Then** le titre "PACAL" est visible dans l'en-tête de navigation
**And** sous ce titre, le numéro de version et la date de build sont affichés en plus petit et en italique
**And** ces informations sont cohérentes avec les variables d'environnement injectées au build
**And** en l'absence des variables (développement local), l'en-tête s'affiche sans erreur (valeurs optionnelles)

### Story 1.10: Supprimer et dupliquer une entrée depuis l'historique

As a utilisateur,
I want pouvoir supprimer une entrée erronée ou en dupliquer une pour réutiliser son contenu,
So that je peux corriger mon historique et accélérer la saisie d'entrées similaires (FR-25, FR-26).

**Acceptance Criteria:**

**Given** que je suis sur la vue historique
**When** je choisis de supprimer une entrée
**Then** une confirmation explicite m'est demandée avant la suppression
**And** après confirmation, l'entrée disparaît de l'historique, des exports et des rapports
**And** la photo associée (si elle existe) est également supprimée du stockage

**Given** que je suis sur la vue historique
**When** je choisis de dupliquer une entrée
**Then** une nouvelle entrée est créée avec les mêmes valeurs (description, poids, calories, condition, note)
**And** l'horodatage de la nouvelle entrée est celui de l'instant de la duplication (modifiable)
**And** la photo de l'entrée source n'est pas copiée
**And** l'entrée source reste inchangée

### Story 1.11: Vignette photo dans le rapport PDF

As a utilisateur,
I want voir une vignette des photos dans le rapport PDF,
So que je peux identifier visuellement les prises sans ouvrir l'export séparément (FR-27).

**Acceptance Criteria:**

**Given** que je génère un rapport PDF contenant des entrées avec et sans photo
**When** le PDF est rendu
**Then** chaque ligne d'entrée présente 3 colonnes : heure | contenu textuel | photo
**And** une entrée avec photo affiche une vignette d'environ 2 cm de hauteur dans la colonne droite, avec le ratio d'aspect préservé
**And** une entrée sans photo laisse la colonne droite vide (pas de placeholder ni d'icône)
**And** la vignette ne provoque pas de saut de page intempestif

---

## Epic 2: Accélérer la saisie et piloter ses apports

En s'appuyant sur les entrées d'Epic 1, l'utilisateur peut scanner un
code-barres pour préremplir une entrée plutôt que tout saisir à la main, et
définir une cible calorique journalière avec des alertes par créneau
horaire pour repérer une répartition déséquilibrée dans la journée.

### Story 2.1: Scanner un code-barres

As a utilisateur,
I want scanner un code-barres avec mon téléphone, ou le saisir manuellement sur Mac,
So that je n'aie pas à chercher le produit moi-même (FR13, FR17).

**Acceptance Criteria:**

**Given** que je suis sur mobile/tablette, dans le formulaire de saisie
**When** je déclenche le scanner et présente un code-barres à la caméra
**Then** une recherche OpenFoodFacts est lancée automatiquement, sans étape manuelle supplémentaire
**And** sur toute plateforme, y compris Mac/Chrome, je peux saisir le code-barres au clavier pour le même résultat

### Story 2.2: Préremplir une entrée depuis une fiche produit

As a utilisateur,
I want que les informations du produit scanné remplissent automatiquement mon entrée,
So that je n'aie pas à ressaisir manuellement les calories (FR14, FR15, FR16).

**Acceptance Criteria:**

**Given** qu'une recherche OpenFoodFacts a trouvé une fiche produit
**When** la fiche est appliquée à l'entrée en cours
**Then** la description et les calories sont préremplies, et le statut d'estimation passe à "mesuré"
**And** si la fiche exprime les calories au 100g/100ml, modifier la quantité consommée recalcule immédiatement les calories
**And** le Nutriscore et un lien vers la fiche OpenFoodFacts sont affichés quand disponibles
**And** la table `product_references` est créée par migration à cette étape, liée 1:1 à une entrée scannée

### Story 2.3: Investigation et, si possible, enrichissement Yuka

As a utilisateur,
I want savoir si l'enrichissement Yuka est viable, et en bénéficier si oui,
So that je dispose d'un signal de qualité supplémentaire sans dépendre d'une source non officielle fragile (FR18).

**Acceptance Criteria:**

**Given** l'absence d'API publique officielle Yuka
**When** l'investigation technique est menée
**Then** une décision documentée (go/no-go) est produite avant tout développement de la fonctionnalité
**And** si "go", le score Yuka, un lien vers la fiche et les remarques santé éventuelles s'affichent au même endroit que le Nutriscore
**And** si "no-go", aucune fonctionnalité Yuka n'est exposée, sans impact sur le reste de l'Epic 2

### Story 2.4: Définir une cible calorique et des créneaux horaires

As a utilisateur,
I want définir ma cible calorique journalière et mes créneaux horaires avec leurs seuils,
So that je puisse ensuite être alerté en cas de déséquilibre (FR19, FR20, FR21).

**Acceptance Criteria:**

**Given** que j'accède aux réglages
**When** je définis une cible calorique journalière et un ou plusieurs créneaux horaires avec leurs bornes et seuils
**Then** ces valeurs sont enregistrées et modifiables à tout moment
**And** modifier les bornes d'un créneau ne modifie aucune entrée existante
**And** la table `settings` (ligne unique) est créée par migration à cette étape

### Story 2.5: Être alerté d'un déséquilibre calorique

As a utilisateur,
I want voir mon cumul calorique du jour et être alerté si un créneau ou le total dépasse son seuil,
So that je repère un déséquilibre même si je reste dans ma cible globale (FR22, FR23).

**Acceptance Criteria:**

**Given** des créneaux et seuils déjà configurés (Story 2.4) et des entrées existantes
**When** je consulte l'écran de saisie au cours de la journée
**Then** le cumul calorique du jour est affiché en continu
**And** le cumul de chaque créneau est calculé à partir du seul horodatage des entrées, sans qu'aucune saisie ne référence un créneau
**And** un signal visuel actif apparaît si un créneau ou le total dépasse son seuil, même si le total journalier reste dans la cible
