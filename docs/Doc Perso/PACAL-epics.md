---
stepsCompleted: [1]
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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
