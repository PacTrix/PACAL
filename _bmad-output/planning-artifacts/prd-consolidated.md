---
title: "PACAL — PRD Consolidé"
status: final
created: 2026-06-18
updated: 2026-06-28
version: "2.0 (consolidé)"
supersedes:
  - prds/prd-PACAL-2026-06-18/prd.md
  - prds/prd-PACAL-2026-06-28/prd.md
---

# PRD PACAL — Document de référence consolidé

> Ce document est la **source de vérité unique** pour toutes les exigences fonctionnelles de PACAL, de la V1.0 à la V2. Il consolide trois documents antérieurs (brief initial, PRD V1.x, PRD V2) en une référence cohérente organisée par feature group. Les FRs sont numérotés globalement (FR-1 à FR-42) et stables — les story files et l'architecture s'y réfèrent.

---

## Historique des versions

| Version | Date | FRs couverts | Statut |
|---|---|---|---|
| V1.0 | 2026-06-18 | FR-1 à FR-12 | ✅ Livré |
| V1.1 | 2026-06-26 | FR-24 à FR-27 | ✅ Livré |
| V1.2 | 2026-06-28 | FR-28 à FR-35 | ✅ Livré |
| V2.0 | — | FR-36 à FR-42 | 🔵 En cours |
| V2.5 | — | FR-19 à FR-23 | 🔲 Backlog |

*FR-13 à FR-17 (ancienne formulation Lot 2) : supersédés par FR-36 à FR-42 (formulation V2 plus détaillée et arbitrée). FR-18 (Yuka) : abandonné.*

---

## 0. Objet du document

Ce PRD s'adresse à l'auteur en tant que PM, et aux étapes BMAD en aval (architecture, epics, stories) qui s'appuieront sur lui sans redemander ce qui est déjà tranché. Les exigences fonctionnelles (FR) sont numérotées globalement et stables. Les hypothèses inférées sont marquées `[ASSUMPTION]`. Les décisions résolues sont marquées `[RÉSOLU]`.

---

## 1. Vision

PACAL transforme un geste qui prend aujourd'hui plusieurs minutes de réflexion contrainte (où je classe ça, dans quel repas) en un geste de quelques secondes : ouvrir l'app, c'est déjà être en train de saisir. Chaque entrée porte la vérité du moment — l'heure réelle, le lieu social, une photo, un mot — qu'elle décrive une prise alimentaire ou un instant qui compte tout autant pour un suivi de remise en forme (un médicament, une fringale résistée).

Cette fidélité n'a de valeur que parce qu'elle débouche sur quelque chose : un export exploitable, un rapport PDF qu'on peut poser sur le bureau d'un diététicien sans avoir à le reconstruire de mémoire la veille du rendez-vous. PACAL ne cherche pas à remplacer un nutritionniste ni à concurrencer les suites grand public — il fait une seule chose, pour une seule personne, mieux que ce que ces outils ne savent faire.

---

## 2. Utilisateur cible

### 2.1 Jobs To Be Done

- **Fonctionnel** — enregistrer une prise (ou un instant) avec son horodatage réel et son contexte, en quelques secondes, sans naviguer dans des menus.
- **Fonctionnel** — retrouver et corriger une entrée passée si l'estimation initiale était fausse ou incomplète.
- **Fonctionnel** — identifier un aliment par son code-barres et obtenir automatiquement sa valeur nutritionnelle.
- **Professionnel/social** — produire, en vue d'une consultation diététique, un document lisible qui ne ressemble pas à un export brut de base de données.
- **Émotionnel** — pouvoir noter un écart (une fringale, un excès) sans culpabiliser ni être contraint de tout quantifier précisément.
- **Contextuel** — logger aussi bien depuis un smartphone en sortant d'un restaurant que depuis un Mac le soir en relisant sa journée.

### 2.2 Non-utilisateurs

PACAL est mono-utilisateur : pas de comptes, pas de partage, pas de notion d'équipe. Le diététicien n'est pas un utilisateur de l'application — il reçoit un document, il n'ouvre jamais l'app.

### 2.3 Parcours utilisateurs clés

**UJ-1. Logger une prise en sortant du resto.**
- Smartphone en main, app déjà accessible via Tailscale.
- Ouvre l'app → atterrit directement sur l'écran de saisie, heure déjà pré-remplie → ajuste la description → sélectionne le contexte → prend une photo du plat → enregistre.
- Climax : l'entrée est sauvegardée en moins de 20 secondes.
- `[ASSUMPTION]` Après sauvegarde, l'app reste sur un formulaire vierge prêt pour la prochaine saisie.

**UJ-2. Scanner un produit pour enrichir une saisie.**
- Smartphone, formulaire de saisie ouvert.
- Clic Scan → caméra → produit reconnu → kcal et scores pré-remplis → ajuste la quantité → les kcal se recalculent → enregistre.
- Climax : saisie précise sans ressaisie manuelle des données nutritionnelles.

**UJ-3. Préparer un rendez-vous diététique.**
- Mac, Chrome, vue historique.
- Sélectionne une période → génère le rapport PDF → le PDF distingue les valeurs estimées des valeurs issues d'un scan → imprime ou transfère.
- Climax : un document prêt, organisé jour par jour.

---

## 3. Glossaire

- **Entrée** — Enregistrement unitaire : un horodatage, et optionnellement description, quantité, unité, calories, conditions de prise, type de note, note, jusqu'à deux photos, code-barres, scores nutritionnels.
- **Conditions de prise** — Liste fermée, sélection unique : *Chez moi, Au bureau, Au resto (business), Au resto (amis), Chez des gens.*
- **Statut d'estimation** — *Estimé* (saisi à la main) ou *Mesuré* (issu d'OpenFoodFacts via scan). Distinct dans le rapport PDF.
- **Fiche produit (OpenFoodFacts)** — Résultat d'une recherche par code-barres EAN : nutriscore, nova, greenscore, kcal/100g ou /portion.
- **Scores nutritionnels** — Triplet nutriscore (A–E) / nova (1–4) / greenscore (A–E), affiché sous la forme X·N·Y avec colorisation.
- **Rapport** — Document PDF généré pour une période donnée, regroupant les entrées jour par jour.
- **Export** — Extraction brute au format CSV, avec photos en fichiers séparés.
- **Cible calorique journalière** — Valeur de référence fixée par l'utilisateur (V2.5).

---

## 4. Exigences fonctionnelles

### 4.1 Saisie d'une entrée *(V1.0 → V1.2, tous livrés)*

**Description :** L'app s'ouvre directement sur l'écran de saisie. Aucune navigation préalable. Réalise UJ-1.

#### FR-1 : Lancement direct sur l'écran de saisie ✅
L'utilisateur arrive sur un formulaire vierge à chaque ouverture. Aucun écran intermédiaire.

#### FR-2 : Horodatage par défaut, modifiable ✅
Le formulaire pré-remplit la date et l'heure courantes. Toute date passée est acceptée. Les entrées sont classées en ordre antéchronologique.

#### FR-3 : Champs alimentaires optionnels ✅
Description, quantité et calories sont optionnels. Une entrée constituée d'un horodatage et d'une note seule est valide.

#### FR-4 : Conditions de prise ✅
Sélection unique parmi la liste fermée. `[ASSUMPTION]` Obligatoire — une entrée a toujours exactement une condition.

#### FR-5 : Deux photos par entrée ✅ *(évolué FR-33 en V1.2)*
Chaque entrée peut avoir jusqu'à deux photos indépendantes et optionnelles (prise directe ou galerie). Aucun troisième slot.

#### FR-6 : Note libre ✅
Texte libre, longueur non contrainte par l'interface.

#### FR-28 : Bouton de rafraîchissement de la date/heure ✅ *(V1.2)*
Sur les formulaires de saisie et d'édition, un bouton "↺ Maintenant" remet la date/heure à l'instant courant. Ne soumet pas le formulaire.

#### FR-29 : Pré-remplir le dernier contexte saisi ✅ *(V1.2)*
Le champ *conditions de prise* se pré-remplit avec la dernière valeur utilisée (localStorage). Le formulaire d'édition n'est pas affecté.

#### FR-30 : Quantité + unité (remplace "poids") ✅ *(V1.2)*
Le champ "poids" est remplacé par :
- **Quantité** : entier positif, optionnel.
- **Unité** : liste fermée — `g`, `kg`, `dl`, `l`, `portion` — optionnelle.

Le rapport PDF affiche "X g", "X portion", etc. L'export CSV contient les colonnes `quantity` et `unit`.

#### FR-31 : Type de note ✅ *(V1.2)*
Le champ *note* est enrichi d'un sous-champ **type** optionnel : `aliment`, `médicament`, `sommeil`, `autre`. Présent dans l'export CSV et le rapport PDF.

---

### 4.2 Code-barres et enrichissement nutritionnel *(V2, en cours)*

**Description :** Identifie un aliment par son EAN, récupère ses données nutritionnelles depuis OpenFoodFacts, et enrichit la saisie en cours. Réalise UJ-2. Principe fondateur : tout reste saisissable manuellement — l'enrichissement est une aide, pas une contrainte.

#### FR-36 : Saisie du code-barres avec scan caméra 🔵
- Champ optionnel "Code-barres" dans les formulaires de saisie et d'édition.
- Bouton **Scan** qui active la caméra pour lire un EAN (compatible Safari iOS et Chrome Android).
- Saisie manuelle possible sur toute plateforme y compris Mac/Chrome.
- Le champ reste éditable après scan (correction manuelle en cas de lecture imprécise).
- Le code-barres est persisté en base de données.

#### FR-37 : Recherche automatique dans OpenFoodFacts 🔵
- Dès qu'un code-barres est disponible, l'application interroge `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`.
- Si le produit est trouvé : enrichissement FR-38 et FR-39 déclenché.
- Si le produit n'est pas trouvé ou si l'appel échoue (réseau absent, timeout 5s) :
  - Le code-barres reste dans le champ.
  - Message non-bloquant à l'utilisateur.
  - Flag `of_incomplete: true` associé à l'entrée (déclenche FR-41).
  - Toute saisie manuelle reste possible.

#### FR-38 : Affichage des scores nutritionnels colorisés 🔵
- Affichage sous la forme **X·N·Y** (nutriscore · nova · greenscore). Un score absent = `_`.
- Colorisation :
  - Nutriscore / Greenscore : A, B → vert ; C → orange ; D, E → rouge.
  - Nova : 1, 2 → vert ; 3 → orange ; 4 → rouge.
- Visible dans : formulaire de saisie/édition, vue détail, rapport PDF.
- Absent de la liste historique (vue synthétique).
- Les valeurs de score sont persistées en base de données.

#### FR-39 : Calcul automatique des kcal selon quantité 🔵
- Prérequis : données OpenFoodFacts présentes (kcal/100g ou kcal/portion).
- Calcul selon l'unité choisie :
  - `g` / `kg` : `kcal = floor(quantité_en_g × kcal_per_100g / 100)`
  - `dl` / `l` : `kcal = floor(quantité_en_ml × kcal_per_100ml / 100)` `[ASSUMPTION]`
  - `portion` : `kcal = kcal_per_portion` (valeur fixe OpenFoodFacts)
  - Si `portion` mais kcal/portion absent : champ kcal affiché grisé visuellement, affiche `---`, reste éditable manuellement.
- Recalcul à chaque modification de quantité ou d'unité, tant que l'utilisateur n'a pas saisi manuellement les kcal.
- Si l'utilisateur modifie manuellement les kcal : la valeur est verrouillée (recalcul automatique suspendu). `[ASSUMPTION]` Un indicateur visuel léger signale la valeur manuelle.

#### FR-40 : Persistance des données OpenFoodFacts 🔵
Champs ajoutés à l'entrée :

| Champ | Contenu |
|---|---|
| `barcode` | Code EAN (texte) |
| `nutriscore` | Lettre A–E ou null |
| `nova` | Entier 1–4 ou null |
| `greenscore` | Lettre A–E ou null |
| `kcal_per_100g` | Réel (pour recalcul) ou null |
| `kcal_per_portion` | Réel ou null |
| `of_incomplete` | Booléen — true si OpenFoodFacts n'a pas enrichi la fiche |

Ces champs sont inclus dans l'export CSV.

#### FR-41 : Triangle ⚠ pour fiches incomplètes 🔵
- Une entrée est marquée incomplète (`of_incomplete: true`) quand un code-barres a été saisi/scanné mais OpenFoodFacts n'a pas retourné de données.
- Dans la liste historique : icône triangle orange ⚠ visible sur ces entrées.
- Dans le formulaire d'édition : le message d'avertissement OpenFoodFacts est réaffiché.
- Quand l'édition aboutit à un enrichissement réussi, `of_incomplete` passe à `false`.

#### FR-42 : Affichage dans vue détail et rapport PDF 🔵
- **Vue détail/édition** : code-barres en lecture seule (éditable en mode édition), scores X·N·Y colorisés.
- **Rapport PDF** : code-barres affiché si présent, scores X·N·Y avec couleurs vert/orange/rouge, mention "(données manuelles)" si `of_incomplete`.

---

### 4.3 Édition, historique et duplication *(V1.0 → V1.2, tous livrés)*

#### FR-7 : Édition d'une entrée existante ✅
Tout champ modifiable, y compris horodatage et conditions de prise. Toute modification est persistée.

#### FR-8 : Vue historique des entrées ✅
Liste antéchronologique. Sélectionner une entrée ouvre son formulaire d'édition pré-rempli.

#### FR-25 : Suppression d'une entrée ✅ *(V1.1)*
Depuis l'historique, avec confirmation explicite. Les photos associées sont supprimées du stockage.

#### FR-26 → FR-34 : Duplication → formulaire pré-rempli ✅ *(évolué en V1.2)*
Depuis l'historique, "Dupliquer" ouvre le formulaire de saisie pré-rempli avec les champs de l'entrée source (description, quantité, unité, calories, conditions de prise, note, type de note). La date/heure est celle de l'instant. Les photos ne sont pas reprises. Aucune entrée n'est créée si l'utilisateur annule.

---

### 4.4 Export des données *(V1.0, livré)*

#### FR-9 : Export CSV ✅
Export de toutes les entrées (ou une période filtrée) au format CSV. Une ligne par entrée, tous champs inclus (y compris entrées "instant"). Les photos sont exportées en fichiers JPG séparés nommés par horodatage ; le nom du fichier est une colonne du CSV.

Colonnes V1.2 : `datetime, condition, description, quantity, unit, calories, note_type, note, photo_file_1, photo_file_2`
Colonnes V2 (ajout) : `barcode, nutriscore, nova, greenscore, kcal_per_100g, kcal_per_portion, of_incomplete`

---

### 4.5 Rapport PDF *(V1.0 → V1.2 → V2)*

#### FR-10 : Génération d'un rapport PDF par période ✅
L'utilisateur choisit une période et génère un PDF regroupant les entrées jour par jour. Chaque jour apparaît comme section distincte, même sans entrée alimentaire.

#### FR-11 : Entrées non-alimentaires dans le rapport ✅
Les entrées "instant" apparaissent au même titre que les prises alimentaires.

#### FR-12 : Distinction visuelle estimé / mesuré ✅
Un repère visuel constant (icône ou libellé) distingue les valeurs saisies manuellement des valeurs issues d'OpenFoodFacts.

#### FR-27 : Layout 3 colonnes avec vignette photo ✅ *(V1.1)*
Chaque ligne d'entrée : heure | contenu textuel | photo(s). Vignette d'environ 2 cm de hauteur quand une photo existe, colonne vide sinon. Jusqu'à deux vignettes par entrée (V1.2).

#### FR-35 : Logo et charte graphique dans le PDF ✅ *(V1.2)*
Logo en en-tête du PDF. Couleurs `#F05C22` (orange) et `#06466D` (marine) dans le StyleSheet.

*(FR-38 et FR-42 couvrent l'affichage des scores dans le PDF — voir §4.2)*

---

### 4.6 Interface, charte graphique et navigation *(V1.1 → V1.2)*

#### FR-24 → FR-32 : Menu "À propos" ✅ *(évolué en V1.2)*
Un lien "À propos" dans la navigation remplace l'affichage de version en sous-titre. La page affiche : version et date de build, stack technique avec versions, changelog succinct.

#### FR-35 : Charte graphique ✅ *(V1.2)*
- Titres : `#F05C22` (orange brand).
- Textes et saisies : `#06466D` (marine brand).
- Définis via `@theme` dans `globals.css` (Tailwind v4), utilisés comme `text-brand-orange` / `text-brand-marine`.
- Logo `public/logo.png` en en-tête de toutes les vues.

---

### 4.7 Cible calorique journalière et alertes *(V2.5, backlog)*

**Description :** Repérage d'une répartition déséquilibrée dans la journée via créneaux horaires calculés après coup sur l'horodatage des entrées. Aucun créneau n'est imposé au moment de la saisie.

#### FR-19 : Cible calorique journalière 🔲
L'utilisateur définit une cible de calories pour sa journée, modifiable à tout moment.

#### FR-20 : Créneaux horaires configurables 🔲
Nombre libre de créneaux (matin, midi, soir, etc.) avec bornes de début/fin. Modifier les bornes ne modifie aucune entrée existante.

#### FR-21 : Seuil par créneau 🔲
Pour chaque créneau, un seuil en kcal absolu ou en pourcentage de la cible journalière.

#### FR-22 : Calcul dérivé de l'horodatage 🔲
Cumul des kcal par créneau, calculé sur l'horodatage des entrées sans que les entrées référencent un créneau.

#### FR-23 : Affichage passif et alerte active 🔲
Cumul du jour affiché en continu (passif). Signal visuel actif quand le cumul d'un créneau ou le total journalier dépasse son seuil — même si le total global reste dans la cible.

---

### Fonctionnalités abandonnées

#### FR-13 à FR-17 — Ancienne formulation scan/OpenFoodFacts *(supersédés)*
Ces FRs de la formulation initiale "Lot 2" sont supersédés par FR-36 à FR-42, qui les précisent et les arbitrent. Ils ne sont plus la référence.

#### FR-18 — Enrichissement Yuka *(abandonné)*
L'API Yuka n'est pas publique. Investigation conclue : aucune voie d'accès fiable et pérenne identifiée. FR abandonné sans impact sur le reste.

---

## 5. Exigences non fonctionnelles

#### NFR-1 : Plateforme et hébergement
NAS Synology DS923+, PostgreSQL, Docker (Next.js standalone). Accessible depuis smartphone/tablette (iOS/Android) et Mac via Chrome.

#### NFR-2 : Accès distant via Tailscale `[RÉSOLU]`
Connexion via Tailscale. Pas de problème d'authentification — utilisateur unique, réseau de confiance. Aucun proxy inverse ou VPN supplémentaire requis.

#### NFR-3 : Confidentialité des données
Les données sont des données de santé personnelles. Aucune donnée personnelle n'est transmise à un tiers, à l'exception du code EAN seul transmis à OpenFoodFacts lors d'une recherche.

#### NFR-4 : Vitesse de saisie
La saisie d'une entrée simple (FR-1 à FR-6) doit rester en moins de 20 secondes. Aucune fonctionnalité ultérieure n'ajoute une étape obligatoire au chemin de saisie de base.

#### NFR-5 : Migrations manuelles
Les migrations de schéma SQL sont rédigées manuellement et appliquées via `psql` sur le NAS (drizzle-kit non disponible sur l'hôte Synology standalone). Les nouveaux champs sont nullable pour préserver la compatibilité avec les données existantes.

#### NFR-6 : Compatibilité scan caméra mobile *(V2)*
Le scan EAN doit fonctionner depuis Chrome sur Android (Samsung Galaxy et Redmi Pad SE). Pas d'iOS — l'utilisateur n'a pas d'appareils Apple.

---

## 6. Non-goals explicites

- Multi-utilisateur : pas de comptes, pas de partage.
- Mode hors ligne : l'application suppose une connexion au serveur.
- Enrichissement Yuka (abandonné — API non publique).
- Tables CIQUAL (reportées à Epic 3 ou version ultérieure).
- Intégration Garmin (activité) ou Renpho (poids corporel) : lots ultérieurs.
- Coaching automatisé, recommandations nutritionnelles, fonctionnalités communautaires.
- Détection automatique de schémas comportementaux (au-delà des alertes FR-23).
- Recettes, repas types, favoris.
- Base de données produits locale (pas de cache OpenFoodFacts).
- Suggestions ou autocomplétion par nom de produit.

---

## 7. Critères de succès

**Primaires**
- **SM-1** : Usage quotidien sans abandon après 4 semaines d'usage réel. Valide FR-1 à FR-6.
- **SM-2** : Le rapport PDF est apporté tel quel à au moins une consultation diététique. Valide FR-10, FR-11, FR-12.
- **SM-3** *(V2)* : Le scan d'un produit renseigne les kcal sans ressaisie manuelle. Valide FR-36 à FR-39.

**Secondaires**
- **SM-4** : Au moins un comportement dysfonctionnel est identifié par relecture du rapport ou de l'export dans les 4 premières semaines.

**Contre-métriques**
- **SM-C1** : Le temps de saisie d'une entrée simple ne dépasse pas ~20 secondes. Un enrichissement plus riche ne doit jamais ralentir la saisie de base.

---

## 8. Questions ouvertes

| # | Question | Priorité | Statut |
|---|---|---|---|
| OQ-1 | Bibliothèque de scan JS retenue (`@zxing/browser` vs `html5-qrcode`) — Chrome Android uniquement (pas d'iOS) | Haute | 🔵 À trancher (architecte V2) |
| OQ-2 | OpenFoodFacts fournit-il les kcal/100ml pour les produits liquides ? (impact FR-39 unités dl/l) | Moyenne | 🔵 À vérifier (spike V2) |
| OQ-3 | Indicateur visuel "kcal saisi manuellement" — icône ou texte ? | Basse | 🔵 Arbitrage à l'implémentation |

*Questions résolues : Tailscale (NFR-2), Yuka (FR-18 abandonné), périmètre V2 (sans alertes caloriiques), photos (2 max, indépendantes).*

---

## 9. Index des assumptions

- FR-1/UJ-1 — après sauvegarde, l'app reste sur un formulaire vierge (pas de liste).
- FR-4 — conditions de prise à sélection unique, obligatoire.
- FR-5 — photos optionnelles, max 2, indépendantes.
- FR-8 — vue historique implicitement requise comme point d'entrée de l'édition.
- FR-9 — export couvre l'historique complet par défaut, filtre période optionnel.
- FR-39 — OpenFoodFacts fournit kcal/100ml pour les liquides (à confirmer en spike).
- FR-39 — Un indicateur visuel léger signale les kcal saisis manuellement (arbitrage implémentation).
