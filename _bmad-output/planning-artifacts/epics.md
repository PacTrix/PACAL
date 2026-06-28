---
stepsCompleted: [1, 2, 3, 4]
updatedV1.2: 2026-06-28
updatedV2: 2026-06-28
v2StoriesValidated: 2026-06-28
inputDocuments:
  - _bmad-output/planning-artifacts/prd-consolidated.md
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
FR13-FR17: *(supersédés par FR36-FR42 — ancienne formulation Lot 2, remplacée par la formulation V2 plus précise et arbitrée)*
FR18: *(abandonné — API Yuka non publique, investigation conclue)*
FR19: L'utilisateur définit une cible calorique journalière, modifiable à tout moment. *(V2.5)*
FR20: L'utilisateur définit des créneaux horaires configurables (bornes libres), indépendamment de la saisie d'entrée. *(V2.5)*
FR21: L'utilisateur fixe un seuil par créneau (kcal absolu ou % de la cible journalière). *(V2.5)*
FR22: PACAL calcule, pour chaque créneau et chaque jour, le cumul calorique des entrées dont l'horodatage tombe dans ce créneau — calcul a posteriori. *(V2.5)*
FR23: Le cumul du jour est affiché en continu (passif) ; signal visuel actif si un créneau ou le total dépasse son seuil. *(V2.5)*
FR36: Champ optionnel "Code-barres" dans les formulaires de saisie et d'édition. Bouton Scan déclenche la caméra (BarcodeDetector API native, Chrome Android). Saisie manuelle possible sur toute plateforme. Champ éditable après scan. Code-barres persisté en base.
FR37: Dès qu'un code-barres est disponible, recherche automatique dans OpenFoodFacts (côté serveur via tRPC). Si produit trouvé : enrichissement. Si erreur/timeout (5s)/produit inconnu : message non-bloquant + flag of_incomplete = true. La saisie manuelle reste toujours possible.
FR38: Affichage des scores sous la forme X·N·Y (nutriscore · nova · greenscore), avec `_` si absent. Colorisation : A/B → vert, C → orange, D/E → rouge pour nutriscore et greenscore ; 1/2 → vert, 3 → orange, 4 → rouge pour nova. Visible dans formulaire, vue détail, PDF. Absent de la liste historique.
FR39: Si données OpenFoodFacts présentes, les kcal sont recalculées automatiquement à chaque changement de quantité ou d'unité. Règles : g/kg/dl/l → calcul proportionnel depuis kcal/100g ; portion → kcal/portion fixe. Si kcal/portion absent : champ grisé visuellement, affiche `---`, reste éditable. Si l'utilisateur modifie manuellement les kcal, la valeur est verrouillée (recalcul suspendu).
FR40: Champs persistés en base sur `entries` : barcode, nutriscore, nova, greenscore, kcalPer100g, kcalPerPortion, ofIncomplete. Inclus dans l'export CSV.
FR41: Entrée marquée of_incomplete = true quand scan lancé mais OpenFoodFacts échoue. Triangle ⚠ orange visible dans la liste historique. Disparaît quand l'édition aboutit à un enrichissement réussi.
FR42: Vue détail/édition : code-barres en lecture seule (éditable en mode édition), scores X·N·Y colorisés. Rapport PDF : code-barres si présent, scores avec couleurs, mention "(données manuelles)" si of_incomplete.

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
- **Modèle de données** : table `entries` (toutes les données V1-V2 dont les champs OpenFoodFacts). Table `product_references` abandonnée (décision V2). Table `settings` (créneaux/cible) anticipée pour V2.5. Validation par schémas Zod partagés entre tRPC et Drizzle.
- **Isolement des intégrations externes** : `lib/openfoodfacts.ts` est le seul fichier autorisé à effectuer des appels réseau sortants vers OpenFoodFacts, toujours côté serveur. `lib/yuka.ts` abandonné.
- **Bibliothèque scan** : `BarcodeDetector` API native Chrome Android (zéro dépendance). Bouton Scan masqué si API absente. HTTPS requis (certificats Tailscale déjà activés).
- **Migration V2** : `drizzle/0004_v2_schema.sql` — 7 colonnes nullable sur `pacal_entry` (barcode, nutriscore, nova, greenscore, kcal_per100g, kcal_per_portion, of_incomplete). ⚠ Attention casing Drizzle : `kcalPer100g` → `kcal_per100g` (sans underscore avant `1`).
- **Aucun framework de test imposé** pour le MVP (différé, non bloquant).
- **Aucun système d'authentification applicative, de cache, ni de pipeline CI/CD formel** requis à ce stade — décisions explicites, pas des oublis.

### UX Design Requirements

Aucun document UX séparé. Les parcours utilisateurs UJ-1 (saisie rapide en
sortant du resto), UJ-2 (entrée "instant" sans nourriture) et UJ-3
(préparation d'un rendez-vous diététique) — détaillés au PRD §2.3 — servent
de référence comportementale pour les stories ci-dessous.

### FR Coverage Map

FR1-FR8: Epic 1 / V1.0 ✅
FR9-FR12: Epic 1 / V1.0 ✅
FR24-FR27: Epic 1 / V1.1 ✅
FR28-FR35: Epic 1 / V1.2 ✅
FR13-FR17: Supersédés par FR36-FR42
FR18: Abandonné (Yuka)
FR36-FR42: Epic 2 / V2 🔵
FR19-FR23: Epic 2 / V2.5 🔲
NFR1-NFR6: couvertes transversalement (infrastructure, Tailscale, vitesse de saisie, caméra Chrome Android).

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

### Epic 2 : Accélérer la saisie par scan et enrichissement nutritionnel
En s'appuyant sur les entrées d'Epic 1, l'utilisateur peut identifier un aliment par son code-barres EAN, récupérer automatiquement ses données nutritionnelles depuis OpenFoodFacts (nutriscore, nova, greenscore, kcal) et enrichir sa saisie sans ressaisie manuelle. Les fiches dont l'enrichissement a échoué sont signalées pour correction ultérieure.
**FRs covered (V2):** FR36, FR37, FR38, FR39, FR40, FR41, FR42
**FRs couverts (V2.5 — backlog):** FR19, FR20, FR21, FR22, FR23

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

### V1.2 — Expérience de saisie et identité visuelle (2026-06-28)

*Stories 1.12 à 1.19 correspondent aux FR-28 à FR-35 de l'addendum PRD V1.2.
Toutes les stories migrations (1.14, 1.15, 1.17) doivent précéder les stories
qui dépendent des nouveaux champs. La story 1.19 (charte graphique) peut
s'exécuter en parallèle des autres.*

### Story 1.12 : Bouton de rafraîchissement de la date/heure

As a utilisateur,
I want pouvoir remettre la date/heure à l'instant courant d'un clic,
So that je peux saisir une deuxième fiche sans me soucier de la date obsolète dans le formulaire (FR-28).

**Acceptance Criteria :**

**Given** que je suis sur le formulaire de saisie ou d'édition
**When** je clique sur le bouton "Actualiser la date/heure"
**Then** le champ date/heure se met à jour à l'instant courant (à la seconde)
**And** le formulaire n'est pas soumis

### Story 1.13 : Pré-remplir le dernier contexte saisi

As a utilisateur,
I want que le champ "contexte" soit pré-rempli avec ma dernière valeur utilisée,
So que je n'aie pas à le resélectionner systématiquement (FR-29).

**Acceptance Criteria :**

**Given** que j'ai déjà enregistré au moins une entrée
**When** j'ouvre le formulaire de nouvelle saisie
**Then** le champ contexte affiche la dernière valeur que j'avais sélectionnée
**And** si aucune entrée n'existe, le comportement actuel est conservé

### Story 1.14 : Remplacer "poids" par "quantité + unité"

As a utilisateur,
I want saisir une quantité entière avec son unité (g, kg, dl, l, portion),
So que le suivi soit plus précis et pertinent selon ce que je consomme (FR-30).

**Acceptance Criteria :**

**Given** la migration Drizzle exécutée (renommage `weight` → `quantity` entier + nouvelle colonne `unit` varchar)
**When** je saisis une nouvelle entrée ou modifie une entrée existante
**Then** le champ "Poids estimé" est remplacé par "Quantité" (entier) et un sélecteur "Unité" (g, kg, dl, l, portion)
**And** les deux champs sont optionnels
**And** l'export CSV reflète les colonnes `quantity` et `unit` (sans `weight`)
**And** le rapport PDF affiche "X g", "X portion", etc., ou la valeur seule si pas d'unité

### Story 1.15 : Type de note

As a utilisateur,
I want qualifier ma note avec un type (aliment, médicament, sommeil, autre),
So que je puisse catégoriser mes entrées sans ambiguïté dans le rapport (FR-31).

**Acceptance Criteria :**

**Given** la migration Drizzle exécutée (colonne `note_type` varchar nullable)
**When** je saisis ou modifie une entrée
**Then** un sélecteur "Type de note" optionnel est disponible avec les valeurs : aliment, médicament, sommeil, autre
**And** le champ peut rester vide sans erreur de validation
**And** le type de note est présent dans l'export CSV et dans le rapport PDF

### Story 1.16 : Menu "À propos"

As a utilisateur,
I want accéder à un écran "À propos" depuis la navigation,
So que j'aie les informations techniques de l'instance en un seul endroit (FR-32).

**Acceptance Criteria :**

**Given** que je suis sur n'importe quelle page
**When** je clique sur "À propos" dans la navigation
**Then** j'accède à une page affichant : version + date de build, stack technique avec versions npm, changelog succinct
**And** la version sous le titre PACAL (Story 1.9) est supprimée
**And** en l'absence des variables d'environnement de build, la page s'affiche sans erreur

### Story 1.17 : Deux photos par fiche

As a utilisateur,
I want pouvoir attacher jusqu'à deux photos indépendantes à une entrée,
So que je puisse photographier à la fois le plat et sa fiche descriptive (FR-33).

**Acceptance Criteria :**

**Given** la migration Drizzle exécutée (remplacement de `photo_path` par `photo_path_1` et `photo_path_2`, nullable)
**When** je saisis ou modifie une entrée
**Then** deux zones de capture indépendantes sont disponibles (appareil photo ou galerie + preview + suppression pour chacune)
**And** chaque zone est optionnelle et indépendante
**And** l'export ZIP inclut les deux photos si elles existent
**And** le rapport PDF affiche jusqu'à deux vignettes par entrée
**And** la suppression d'une entrée supprime les deux fichiers photos associés

### Story 1.18 : Duplication → écran de saisie prérempli

As a utilisateur,
I want que la duplication ouvre un formulaire pré-rempli plutôt que de créer directement,
So que je puisse ajuster les champs avant d'enregistrer (FR-34).

**Acceptance Criteria :**

**Given** que je suis sur la vue historique
**When** je clique sur "Dupliquer" pour une entrée
**Then** le formulaire de saisie s'ouvre, pré-rempli avec les champs de l'entrée source (description, quantité, unité, calories, contexte, note, type de note)
**And** la date/heure est celle de l'instant courant (pas celle de l'entrée source)
**And** les champs photo sont vides (les photos ne sont pas reprises)
**And** l'entrée source reste inchangée
**And** si j'annule, aucune entrée n'est créée

### Story 1.19 : Charte graphique et logo

As a utilisateur,
I want retrouver une identité visuelle cohérente avec ma palette de couleurs et mon logo,
So que l'application soit reconnaissable et agréable à utiliser (FR-35).

**Acceptance Criteria :**

**Given** que je navigue sur n'importe quelle page de l'application
**When** la page se charge
**Then** les titres (h1–h3, labels de section) s'affichent en `#F05C22`
**And** les textes courants et champs de saisie s'affichent en `#06466D`
**And** le logo (`public/logo.png`) est visible dans l'en-tête à côté du titre "PACAL"

**Given** que je génère un rapport PDF
**When** le PDF est rendu
**Then** le logo est affiché en en-tête du document PDF

---

## Epic 2: Accélérer la saisie par scan et enrichissement nutritionnel

En s'appuyant sur les entrées d'Epic 1, l'utilisateur peut identifier un aliment par son code-barres EAN, récupérer automatiquement ses données nutritionnelles (nutriscore, nova, greenscore, kcal) depuis OpenFoodFacts et enrichir sa saisie sans ressaisie manuelle. Les fiches dont l'enrichissement a échoué sont signalées pour correction ultérieure.

*Décisions d'architecture applicables : BarcodeDetector API native (Chrome Android), appel OpenFoodFacts côté serveur via tRPC `products.lookup`, champs V2 directement sur `entries`, calcul kcal côté client. Voir addendum V2 dans `architecture.md`.*

---

### V2 — Stories 2.1 à 2.6 (2026-06-28)

### Story 2.1 : Saisie et scan du code-barres EAN

As a utilisateur,
I want saisir ou scanner un code-barres EAN dans le formulaire de saisie ou d'édition,
So that je puisse identifier un produit sans le chercher manuellement (FR-36).

**Contexte schéma V1.2 (champs existants — read-only pour cette story) :**
- Constantes : `ENTRY_UNITS = ["g","kg","dl","l","portion"]`, `NOTE_TYPES = ["aliment","médicament","sommeil","autre"]`
- Champs actifs : `quantity integer`, `unit varchar(10)`, `noteType varchar(20)`, `photoPath1 text`, `photoPath2 text`
- Cette story ajoute uniquement `barcode varchar(50)` — aucun champ V1.2 ne doit être modifié.

**Acceptance Criteria :**

**Given** que je suis sur le formulaire de saisie ou d'édition
**When** le formulaire se charge
**Then** un champ optionnel "Code-barres" est présent avec un bouton "Scan" à sa droite
**And** le bouton Scan n'est visible que si `'BarcodeDetector' in window` (Chrome Android) — il est masqué sur Mac Chrome

**Given** que je clique sur "Scan" (Chrome Android, HTTPS)
**When** la caméra arrière s'active
**Then** dès qu'un code EAN-13 ou EAN-8 est détecté, le champ "Code-barres" est rempli automatiquement et la caméra s'arrête
**And** le champ reste éditable pour corriger une lecture imprécise

**Given** que je suis sur n'importe quelle plateforme (y compris Mac Chrome)
**When** je saisis manuellement un code dans le champ "Code-barres"
**Then** le code est accepté comme source valide pour la recherche OpenFoodFacts

**And** la colonne `barcode varchar(50)` est ajoutée à `pacal_entry` par migration `drizzle/0004_v2_schema.sql` (nullable, toutes les entrées existantes conservées intactes)

---

### Story 2.2 : Enrichissement automatique depuis OpenFoodFacts

As a utilisateur,
I want qu'une fois un code-barres saisi ou scanné, les données nutritionnelles du produit soient récupérées et pré-remplissent mon formulaire,
So que je n'aie pas à ressaisir les calories et scores manuellement (FR-37, FR-38).

**Acceptance Criteria :**

**Given** qu'un code-barres est disponible dans le formulaire (scan ou saisie manuelle)
**When** l'appel tRPC `products.lookup` aboutit (produit trouvé dans OpenFoodFacts sous 5s)
**Then** le formulaire affiche les scores nutritionnels sous la forme X·N·Y (nutriscore · nova · greenscore)
**And** la colorisation est appliquée : A/B → vert, C → orange, D/E → rouge (nutriscore et greenscore) ; 1/2 → vert, 3 → orange, 4 → rouge (nova)
**And** les valeurs `kcalPer100g` et `kcalPerPortion` sont stockées dans l'état local du formulaire pour le calcul kcal (story 2.3)
**And** le statut d'estimation passe automatiquement à "mesuré"

**Given** qu'un code-barres est disponible
**When** l'appel échoue (produit inconnu, erreur réseau, timeout 5s)
**Then** un message non-bloquant informe l'utilisateur ("Produit non trouvé" ou "Connexion indisponible")
**And** le code-barres reste dans le champ
**And** `ofIncomplete` est positionné à `true` pour cette entrée
**And** toute saisie manuelle reste possible sans blocage

**And** les colonnes `nutriscore varchar(2)`, `nova integer`, `greenscore varchar(2)`, `kcal_per100g real`, `kcal_per_portion real` sont ajoutées à `pacal_entry` par la même migration `0004` (nullable)
**And** un nouveau routeur `src/server/api/routers/products.ts` expose la procédure `lookup(barcode: string)`
**And** `src/lib/openfoodfacts.ts` implémente l'appel réel avec timeout AbortController 5s et retourne `null` sur toute erreur

---

### Story 2.3 : Calcul automatique des kcal selon la quantité

As a utilisateur,
I want que les kcal se recalculent automatiquement quand je change la quantité ou l'unité (si des données OpenFoodFacts sont disponibles),
So que je n'aie pas à faire le calcul moi-même (FR-39).

**Acceptance Criteria :**

**Given** que des données OpenFoodFacts sont présentes dans le formulaire (`kcalPer100g` ou `kcalPerPortion`)
**When** je modifie le champ Quantité ou l'unité
**Then** le champ kcal se met à jour automatiquement selon la règle :
- `g` : `floor(quantité × kcalPer100g / 100)`
- `kg` : `floor(quantité × 1000 × kcalPer100g / 100)`
- `dl` : `floor(quantité × 100 × kcalPer100g / 100)`
- `l` : `floor(quantité × 1000 × kcalPer100g / 100)`
- `portion` : `floor(kcalPerPortion)` (valeur fixe, quantité ignorée)

**Given** que l'unité est `portion` mais `kcalPerPortion` est absent
**When** je saisis une quantité
**Then** le champ kcal est visuellement grisé et affiche `---`
**And** il reste éditable manuellement

**Given** que le champ kcal a été recalculé automatiquement
**When** je modifie manuellement la valeur des kcal
**Then** le recalcul automatique est suspendu pour cette session (valeur verrouillée)
**And** un indicateur visuel léger signale que la valeur est saisie manuellement

**And** aucune migration de base de données n'est requise pour cette story (calcul purement frontend)

---

### Story 2.4 : Persistance des données OpenFoodFacts et signalement des fiches incomplètes

As a utilisateur,
I want que les données OpenFoodFacts soient sauvegardées avec chaque entrée et que les fiches dont l'enrichissement a échoué soient signalées dans mon historique,
So que je puisse les identifier et les corriger ultérieurement (FR-40, FR-41).

**Acceptance Criteria :**

**Given** qu'un enrichissement OpenFoodFacts réussi a été appliqué au formulaire
**When** j'enregistre l'entrée
**Then** les champs `barcode`, `nutriscore`, `nova`, `greenscore`, `kcalPer100g`, `kcalPerPortion` sont persistés en base
**And** `ofIncomplete` est `false` (ou null)
**And** ces champs apparaissent dans l'export CSV

**Given** qu'un scan a été lancé mais OpenFoodFacts a échoué (`ofIncomplete = true`)
**When** l'entrée apparaît dans la liste historique
**Then** un triangle orange ⚠ est visible sur cette ligne (non intrusif, inline)
**And** le triangle disparaît une fois que l'édition de l'entrée aboutit à un enrichissement réussi

**Given** qu'une entrée n'a pas de code-barres
**When** elle apparaît dans l'historique
**Then** aucun triangle ⚠ n'est affiché (le flag ne s'applique qu'aux scans échoués, pas à l'absence de scan)

**And** la colonne `of_incomplete boolean DEFAULT false` est ajoutée à `pacal_entry` par la migration `0004`
**And** la migration `0004` est la dernière opération à exécuter sur le NAS avant déploiement V2 (elle cumule les 7 colonnes V2)

⚠️ **Mapping Drizzle → SQL à vérifier à la génération :** `kcalPer100g` → `kcal_per100g` (sans underscore avant `100` — règle Drizzle : pas d'underscore devant un chiffre). Valider dans `drizzle/0004_v2_schema.sql` avant merge. Les autres champs (`nova`, `ofIncomplete` → `of_incomplete`, `kcalPerPortion` → `kcal_per_portion`) suivent la règle camelCase standard sans cas particulier.

---

### Story 2.5 : Affichage dans la vue détail et le rapport PDF

As a utilisateur,
I want voir le code-barres et les scores nutritionnels quand j'ouvre une entrée ou génère un rapport PDF,
So que je dispose du contexte nutritionnel complet dans mes documents de suivi (FR-42).

**Acceptance Criteria :**

**Given** qu'une entrée a été enrichie depuis OpenFoodFacts
**When** j'ouvre la vue détail / formulaire d'édition
**Then** le code-barres est affiché en lecture seule (éditable en mode édition)
**And** les scores X·N·Y apparaissent avec la colorisation vert/orange/rouge

**Given** que je génère un rapport PDF couvrant des entrées avec et sans données OpenFoodFacts
**When** le PDF est rendu
**Then** le code-barres est affiché sur les entrées qui en ont un
**And** les scores X·N·Y apparaissent avec les couleurs correspondantes (via `StyleSheet` de `@react-pdf/renderer`)
**And** les entrées avec `ofIncomplete = true` affichent "(données manuelles)" à la place des scores

**And** aucune migration de base de données n'est requise pour cette story

---

### Story 2.6 : Corrections post-déploiement V2 *(bug-fix, 2026-06-28)*

As a utilisateur,
I want que les bugs constatés lors du test V2 soient corrigés,
So que je puisse utiliser le scan et l'enrichissement comme prévu.

**Bugs corrigés :**

- **Changelog À propos** : V2 était absent — ajout de l'entrée V2 en tête de liste.
- **Position du champ code-barres** : le champ était après les notes — déplacé entre la description et les champs quantité/unité (dans `EntryForm` et `EntryEditForm`).
- **Bouton scanner invisible** : `canScan` était une constante calculée au SSR (`false` côté serveur) → mismatch d'hydratation → bouton absent sur Chrome Android. Fix : `useState(false)` + `useEffect` côté client.
- **Barcode s'effaçait au blur** : `onBlur` lisait `e.target.value` (peut être vide sur mobile au moment du blur) → remplacé par la lecture du state React `barcode`.

**And** aucune migration de base de données n'est requise pour cette story

---

## Epic 2 — V2.5 (backlog) : Piloter ses apports caloriques

*Stories ci-dessous reportées en V2.5. Dépendent d'Epic 2 V2 complet.*

### Story 2.6 : Définir une cible calorique et des créneaux horaires *(V2.5)*

As a utilisateur,
I want définir ma cible calorique journalière et mes créneaux horaires avec leurs seuils,
So that je puisse ensuite être alerté en cas de déséquilibre (FR19, FR20, FR21).

**Acceptance Criteria :**

**Given** que j'accède aux réglages
**When** je définis une cible calorique journalière et un ou plusieurs créneaux horaires avec leurs bornes et seuils
**Then** ces valeurs sont enregistrées et modifiables à tout moment
**And** modifier les bornes d'un créneau ne modifie aucune entrée existante
**And** la table `settings` (ligne unique) est créée par migration à cette étape

### Story 2.7 : Être alerté d'un déséquilibre calorique *(V2.5)*

As a utilisateur,
I want voir mon cumul calorique du jour et être alerté si un créneau ou le total dépasse son seuil,
So that je repère un déséquilibre même si je reste dans ma cible globale (FR22, FR23).

**Acceptance Criteria :**

**Given** des créneaux et seuils déjà configurés (Story 2.6) et des entrées existantes
**When** je consulte l'écran de saisie au cours de la journée
**Then** le cumul calorique du jour est affiché en continu
**And** le cumul de chaque créneau est calculé à partir du seul horodatage des entrées, sans qu'aucune saisie ne référence un créneau
**And** un signal visuel actif apparaît si un créneau ou le total dépasse son seuil, même si le total journalier reste dans la cible
