---
title: PACAL
status: final
created: 2026-06-18
updated: 2026-06-28
version: 1.2
---

# PRD: PACAL
*Working title — confirm.*

## 0. Document Purpose

Ce PRD s'adresse à l'auteur lui-même en tant que PM, et aux étapes BMAD en
aval (architecture, découpage en epics/stories) qui s'appuieront sur lui sans
redemander ce qui est déjà tranché. Il construit sur `brief.md` (approuvé) et
son journal de décisions sans les dupliquer : le "pourquoi" et le
positionnement vivent dans le brief, ce document détaille le "quoi" de
manière testable. Les fonctionnalités sont groupées, les exigences
fonctionnelles (FR) numérotées globalement, et les hypothèses inférées sont
marquées `[ASSUMPTION]` inline puis listées en §9 pour confirmation explicite.

## 1. Vision

PACAL transforme un geste qui prend aujourd'hui plusieurs minutes de
réflexion contrainte (où je classe ça, dans quel repas) en un geste de
quelques secondes : ouvrir l'app, c'est déjà être en train de saisir. Chaque
entrée porte la vérité du moment — l'heure réelle, le lieu social, une photo,
un mot — qu'elle décrive une prise alimentaire ou un instant qui compte tout
autant pour un suivi de remise en forme (un médicament, une fringale
résistée).

Cette fidélité n'a de valeur que parce qu'elle débouche sur quelque chose :
un export exploitable, un rapport PDF qu'on peut poser sur le bureau d'un
diététicien sans avoir à le reconstruire de mémoire la veille du rendez-vous.
PACAL ne cherche pas à remplacer un nutritionniste ni à concurrencer les
suites grand public sur leur terrain (bases de données massives, coaching
automatisé) — il fait une seule chose, pour une seule personne, mieux que ce
que ces outils ne savent faire.

## 2. Target User

### 2.1 Jobs To Be Done

- **Fonctionnel** — enregistrer une prise (ou un instant) avec son horodatage
  réel et son contexte, en quelques secondes, sans naviguer dans des menus.
- **Fonctionnel** — retrouver et corriger une entrée passée si l'estimation
  initiale était fausse ou incomplète.
- **Professionnel/social** — produire, en vue d'une consultation diététique,
  un document lisible qui ne ressemble pas à un export brut de base de
  données.
- **Émotionnel** — pouvoir noter un écart (une fringale, un excès) sans
  culpabiliser ni être contraint de tout quantifier précisément — d'où les
  champs optionnels.
- **Contextuel** — logger aussi bien depuis un smartphone en sortant d'un
  restaurant que depuis un Mac le soir en relisant sa journée.

### 2.2 Non-Users (v1)

PACAL v1 n'est pas un produit multi-utilisateur : pas de comptes, pas de
partage, pas de notion d'équipe ou de foyer. Le diététicien n'est pas un
utilisateur de l'application — il reçoit un document, il n'ouvre jamais
l'app. PACAL n'est pas non plus un produit grand public : aucune ambition de
base de données communautaire, de coaching automatisé ou de fil social.

### 2.3 Key User Journeys

- **UJ-1. Logger une prise en sortant du resto.**
  - **Persona + contexte :** l'utilisateur, après un déjeuner d'affaires,
    sort du restaurant.
  - **État d'entrée :** smartphone en main, app déjà installée, pas
    d'authentification (mono-utilisateur).
  - **Parcours :** ouvre l'app → atterrit directement sur l'écran de saisie,
    heure déjà pré-remplie → ajuste la description et l'estimation
    poids/kcal → sélectionne "Au resto (business)" → prend une photo du plat
    → enregistre.
  - **Climax :** l'entrée est sauvegardée en moins de 20 secondes, sans avoir
    eu à chercher un "repas" dans lequel la ranger.
  - **Résolution :** l'app reste sur un écran de saisie vierge, prête pour la
    prochaine entrée. `[ASSUMPTION: après sauvegarde, l'app revient sur un
    écran de saisie vide plutôt que sur une liste — cohérent avec le principe
    "lancement direct sur la saisie".]`

- **UJ-2. Noter un instant sans nourriture.**
  - **Persona + contexte :** une fringale en milieu d'après-midi, à laquelle
    l'utilisateur résiste.
  - **État d'entrée :** chez lui ou au bureau, app ouverte.
  - **Parcours :** ouvre l'app → laisse les champs alimentaires vides →
    sélectionne le contexte → écrit "fringale résistée, 16h" en note →
    enregistre sans photo.
  - **Climax :** l'entrée existe avec un horodatage exact, sans qu'aucun
    champ alimentaire n'ait été un obstacle à la saisie.
  - **Résolution :** cet instant apparaîtra dans le rapport au même titre
    qu'une prise alimentaire, à la bonne heure de la journée.

- **UJ-3. Préparer un rendez-vous diététique.**
  - **Persona + contexte :** la veille d'une consultation, l'utilisateur veut
    arriver avec un dossier.
  - **État d'entrée :** Mac, Chrome, app ouverte sur la vue historique.
  - **Parcours :** sélectionne une période → génère le rapport PDF → vérifie
    que les valeurs estimées sont visuellement distinguées des valeurs
    issues d'un scan → imprime ou transfère le PDF.
  - **Climax :** un document prêt, organisé jour par jour, sans reconstitution
    de mémoire la veille.
  - **Résolution :** le rendez-vous s'appuie sur des faits datés plutôt que
    sur un résumé approximatif.
  - **Cas limite :** une journée ne contenant que des entrées "instant" (sans
    nourriture) doit rester lisible dans le rapport plutôt que de créer une
    section vide ou cassée.

## 3. Glossary

- **Entrée** — Enregistrement unitaire dans PACAL : un horodatage, et
  optionnellement une description, un poids estimé, des calories estimées,
  des conditions de prise, une photo, une note. Peut représenter une prise
  alimentaire ou un instant sans nourriture.
- **Conditions de prise** — Catégorie de contexte associée à une Entrée,
  valeur unique parmi : Chez moi, Au bureau, Au resto (business), Au resto
  (amis), Chez des gens. `[ASSUMPTION: sélection unique, pas multiple.]`
- **Statut d'estimation** — Indicateur attaché au poids et aux calories d'une
  Entrée : *estimé* (saisi à l'œil) ou *mesuré* (issu d'une Fiche produit via
  scan). Distinction obligatoire dans le Rapport.
- **Fiche produit (OpenFoodFacts)** — Résultat d'une recherche par
  code-barres dans la base OpenFoodFacts : nom, kcal au 100g/100ml ou à la
  portion, Nutriscore, lien vers la fiche source.
- **Enrichissement Yuka** — Score sur 100, lien vers la fiche, remarques
  santé. Conditionnel : dépend d'une voie d'accès aux données Yuka jugée
  viable en phase d'architecture (voir FR correspondant).
- **Rapport** — Document PDF généré pour une période donnée, regroupant les
  Entrées jour par jour, alimentaires et non-alimentaires confondues.
- **Export** — Extraction brute des Entrées au format CSV/Excel.
- **Cible calorique journalière** — Valeur de référence fixée par
  l'utilisateur, comparée au cumul des calories des Entrées du jour pour
  produire une Alerte.
- **Lot** — Périmètre de livraison (Lot 1, Lot 2, lots ultérieurs), au sens du
  cahier des charges initial.

## 4. Features

### 4.1 Saisie d'une prise

**Description :** L'app s'ouvre directement sur l'écran de saisie — jamais
sur un menu, un tableau de bord ou une sélection de "repas". C'est le cœur du
produit : tout le reste (édition, export, rapport) n'a de sens que parce que
cette étape est sans friction. Réalise UJ-1, UJ-2.

**Functional Requirements :**

#### FR-1 : Lancement direct sur l'écran de saisie
L'utilisateur arrive sur un formulaire de saisie vierge à chaque ouverture de
l'app (hors navigation explicite vers une autre vue). Réalise UJ-1.

**Conséquences (testables) :**
- Aucun écran intermédiaire (accueil, liste, dashboard) n'est affiché avant le
  formulaire de saisie au lancement.

#### FR-2 : Horodatage par défaut, modifiable
Le formulaire pré-remplit la date et l'heure courantes ; l'utilisateur peut
les modifier librement, y compris vers une date passée.

**Conséquences (testables) :**
- À l'ouverture du formulaire, le champ date/heure contient l'instant présent
  à la minute près.
- Toute date/heure passée est acceptée sans contrainte de fenêtre glissante.
- les prises sont automatiquement classées en ordre antéchronologique

#### FR-3 : Champs alimentaires optionnels (entrée "instant")
La description, le poids estimé et les calories estimées sont tous
optionnels. Une entrée peut être enregistrée sans aucun de ces champs.
Réalise UJ-2.

**Conséquences (testables) :**
- Une entrée constituée uniquement d'un horodatage, d'une note et/ou d'une
  photo est acceptée et sauvegardée sans erreur de validation.

#### FR-4 : Conditions de prise
L'utilisateur sélectionne une condition de prise unique parmi : Chez moi, Au
bureau, Au resto (business), Au resto (amis), Chez des gens.
`[ASSUMPTION: sélection unique et obligatoire — une entrée a toujours
exactement une condition, même une entrée "instant".]`

**Conséquences (testables) :**
- Le champ Conditions de prise n'accepte qu'une seule valeur parmi les cinq
  listées.

#### FR-5 : Photo
L'utilisateur peut attacher au plus une photo à une entrée, soit en prenant
une photo directement (bouton appareil photo qui active la caméra), soit en
sélectionnant une photo déjà existante sur l'appareil.
`[ASSUMPTION: la photo est optionnelle, comme les champs alimentaires.]`

**Conséquences (testables) :**
- Une entrée sans photo est acceptée.
- Les deux chemins (prise directe, sélection depuis la pellicule) aboutissent
  au même résultat : une photo attachée à l'entrée.
- Une tentative d'attacher une deuxième photo à une entrée existante remplace
  la précédente plutôt que d'en ajouter une seconde.

#### FR-6 : Note libre
L'utilisateur peut ajouter une note en texte libre, de longueur non
contrainte par l'interface (au-delà d'une limite technique raisonnable).

**Notes :** *(optionnel)* — `[NOTE FOR PM]` aucune limite de caractères n'a
été demandée ; une limite généreuse (ex. 2000 caractères) sera fixée en
architecture si nécessaire pour le stockage, sans jamais être perçue comme
contraignante à l'usage.

### 4.2 Édition et historique des entrées

**Description :** Une entrée saisie dans l'instant peut contenir une
estimation provisoire ; l'utilisateur doit pouvoir la retrouver et la
corriger plus tard (poids réel constaté, photo ajoutée après coup, etc.).

**Functional Requirements :**

#### FR-7 : Édition d'une entrée existante
L'utilisateur peut modifier n'importe quel champ d'une entrée déjà
enregistrée, y compris l'horodatage et les conditions de prise.

**Conséquences (testables) :**
- Toute modification est persistée et reflétée dans les exports et rapports
  ultérieurs.

#### FR-8 : Vue historique des entrées
L'utilisateur peut consulter une liste antéchronologique de ses entrées pour en
sélectionner une à éditer. `[ASSUMPTION: cette vue n'est pas décrite dans le
cahier des charges initial mais est une condition nécessaire de FR-7 — sans
elle, l'édition n'a pas de point d'entrée.]`

**Conséquences (testables) :**
- Depuis la vue historique, sélectionner une entrée ouvre son formulaire
  d'édition pré-rempli avec ses valeurs actuelles.

### 4.3 Export des données

**Description :** Les données brutes doivent pouvoir sortir de PACAL pour
être retravaillées ailleurs (tableur, analyse personnelle).

**Functional Requirements :**

#### FR-9 : Export CSV/Excel
L'utilisateur peut exporter ses entrées au format CSV ou Excel, pour une
période choisie ou pour l'historique complet.
`[ASSUMPTION: la période est un filtre optionnel — par défaut, l'export
couvre tout l'historique.]`

**Conséquences (testables) :**
- L'export contient une ligne par entrée avec tous ses champs, y compris les
  entrées "instant" (champs alimentaires vides).
- Le statut d'estimation (estimé/mesuré) est une colonne explicite de
  l'export.
- les photos sont exportées à part en tant que fichier jpg indépendant (avec l'horodatage comme base du nom) - un champs de l'export contient le nom de ce fichier

### 4.4 Rapport PDF

**Description :** Le document destiné au diététicien. Doit se lire comme un
dossier, pas comme un export technique. Réalise UJ-3.

**Functional Requirements :**

#### FR-10 : Génération d'un rapport PDF par période
L'utilisateur choisit une période (date de début/fin) et génère un PDF
regroupant les entrées jour par jour. Réalise UJ-3.

**Conséquences (testables) :**
- Chaque jour de la période apparaît comme une section distincte, même s'il
  ne contient aucune entrée alimentaire (cas limite UJ-3).

#### FR-11 : Inclusion des entrées non-alimentaires dans le rapport
Les entrées "instant" (sans contenu alimentaire) apparaissent dans le rapport
au même titre que les prises alimentaires, à leur horodatage réel.

**Conséquences (testables) :**
- Une journée contenant uniquement des entrées "instant" produit une section
  de rapport lisible (pas de section vide ou cassée).

#### FR-12 : Distinction visuelle estimé / mesuré
Le rapport distingue visuellement une valeur de poids/calories saisie à l'œil
d'une valeur retrouvée via un code-barres (Lot 2).

**Conséquences (testables) :**
- Un repère visuel constant (icône, style, libellé) accompagne chaque valeur
  numérique selon son Statut d'estimation.

### 4.5 Scan de code-barres et enrichissement OpenFoodFacts (Lot 2)

**Description :** Allège la saisie répétitive en préremplissant poids et
calories depuis une base de données ouverte, avec un repli manuel assumé sur
les plateformes sans caméra pratique.

**Functional Requirements :**

#### FR-13 : Scan de code-barres (mobile/tablette)
Depuis un smartphone ou une tablette, l'utilisateur peut scanner un
code-barres via la caméra pour lancer une recherche OpenFoodFacts. Non
disponible sur Mac/Chrome par ce mécanisme (voir FR-17).

**Conséquences (testables) :**
- Un code-barres reconnu déclenche une recherche automatique sans étape
  manuelle supplémentaire.

#### FR-14 : Préremplissage depuis la fiche produit
Une fiche produit trouvée préremplit la description et les calories de
l'entrée en cours, avec le Statut d'estimation positionné sur *mesuré*.

#### FR-15 : Recalcul automatique selon la quantité consommée
Si la fiche produit exprime les calories au 100g/100ml, l'utilisateur indique
la quantité réellement consommée et PACAL recalcule les calories
proportionnellement. Si la fiche exprime les calories à la portion, l'ajustement
se fait par multiple de portion.

**Conséquences (testables) :**
- Modifier la quantité consommée après préremplissage recalcule
  immédiatement les calories affichées, sans nécessiter une nouvelle
  recherche.

#### FR-16 : Affichage Nutriscore et lien vers la fiche
Quand disponibles dans la fiche produit, le Nutriscore et un lien vers la
fiche OpenFoodFacts d'origine sont affichés sur l'entrée.

#### FR-17 : Saisie manuelle du code-barres
Sur toute plateforme, y compris Mac/Chrome, l'utilisateur peut saisir un
code-barres au clavier pour déclencher la même recherche OpenFoodFacts que
FR-13.

**Out of Scope :** *(explicite)*
- Le scan via webcam Mac/Chrome n'est pas traité (décision utilisateur) — la
  saisie manuelle est le repli assumé sur cette plateforme.

### 4.6 Enrichissement Yuka (Lot 2 — conditionnel)

**Description :** Objectif assumé mais non garanti : Yuka n'expose aucune API
publique officielle. Ce point est traité comme une investigation technique,
pas comme une fonctionnalité ferme.

**Functional Requirements :**

#### FR-18 : Investigation de faisabilité Yuka
Avant tout engagement de sprint, une investigation technique (phase
architecture) détermine s'il existe une voie d'accès aux données Yuka jugée
suffisamment fiable et pérenne. Si oui, l'entrée affiche le score Yuka sur
100, un lien vers la fiche, et les remarques santé éventuelles, au même
endroit que le Nutriscore (FR-16). Si non, cette fonctionnalité est retirée du
Lot 2 sans impact sur le reste.

A voir : l'enrichissement Yuka peut peut-être s'envisager en batch lors de la constitution du rapport PDF

**Conséquences (testables) :**
- La décision (go/no-go) et sa justification technique sont documentées dans
  l'addendum d'architecture avant tout développement de cette fonctionnalité.

### 4.7 Cible calorique journalière et alertes par créneau (Lot 2)

**Description :** Va au-delà d'un simple compteur : aide à repérer une
répartition déséquilibrée dans la journée (un dîner trop copieux, par
exemple) même quand le total journalier reste correct — sans jamais imposer
de créneau au moment de la saisie. Les créneaux n'existent que comme grille
de lecture calculée après coup sur l'horodatage des entrées.

**Functional Requirements :**

#### FR-19 : Cible calorique journalière
L'utilisateur définit une cible de calories pour sa journée, modifiable à
tout moment.

#### FR-20 : Créneaux horaires configurables
L'utilisateur définit un nombre libre de créneaux horaires (ex. matin, midi,
soir) avec leurs bornes de début/fin, indépendamment de toute saisie
d'entrée.

**Conséquences (testables) :**
- Modifier les bornes d'un créneau ne modifie aucune entrée existante ; seul
  le calcul d'agrégation en tient compte.

#### FR-21 : Seuil par créneau
Pour chaque créneau défini, l'utilisateur fixe un seuil (en kcal absolu ou en
pourcentage de la cible journalière).

#### FR-22 : Calcul dérivé de l'horodatage
PACAL calcule, pour chaque créneau et pour chaque jour, le cumul des
calories des entrées dont l'horodatage tombe dans ce créneau — sans qu'aucune
saisie d'entrée ne référence un créneau explicitement.

#### FR-23 : Affichage passif et alerte active
Le cumul calorique du jour est affiché en continu pendant la saisie (passif).
Un signal visuel actif (couleur, message) apparaît quand le cumul d'un
créneau, ou le total journalier, dépasse son seuil respectif — y compris
quand le total journalier reste dans la cible mais qu'un créneau isolé la
dépasse.

**Conséquences (testables) :**
- Un créneau en dépassement déclenche un signal visuel même si le cumul
  journalier total reste sous la cible.

## 5. Contraintes et Exigences Transverses

#### NFR-1 : Plateforme et hébergement
PACAL est un site web auto-hébergé sur le NAS Synology DS923+ de
l'utilisateur, avec PostgreSQL comme base de données. Accessible depuis
smartphone/tablette Android et depuis un Mac via Chrome.

#### NFR-2 : Accès distant
Plusieurs parcours (UJ-1 notamment) supposent une saisie depuis l'extérieur
du réseau domestique (en sortant d'un restaurant). L'application doit donc
être joignable hors du réseau local, avec un niveau d'authentification
approprié à des données de santé personnelles. Le mécanisme exact (VPN,
proxy inverse authentifié, etc.) est un choix d'architecture — voir Open
Questions §8.

#### NFR-3 : Confidentialité des données
Les données enregistrées sont des données de santé personnelles. Aucune
donnée personnelle n'est transmise à un tiers, à l'exception des requêtes de
recherche par code-barres envoyées à OpenFoodFacts (et, si retenu, à Yuka),
qui ne contiennent que le code-barres lui-même.

#### NFR-4 : Vitesse de saisie
La saisie d'une entrée simple (FR-1 à FR-6) doit rester perceptiblement
instantanée — c'est la condition de UJ-1 (logger en moins de 20 secondes).
Aucune fonctionnalité ultérieure (Lot 2 et après) ne doit ajouter une étape
obligatoire au chemin de saisie de base.

## 6. Non-Goals (Explicit)

- PACAL n'est pas une application multi-utilisateur : pas de comptes, pas de
  partage, pas de gestion de permissions.
- Le mode hors ligne n'est pas traité en Lot 1/Lot 2 — l'application suppose
  une connexion au serveur auto-hébergé.
- Aucune intégration Garmin (activité) ou Renpho (poids corporel) n'est
  développée dans ce PRD — ce sont des lots ultérieurs distincts.
- PACAL ne propose pas de coaching automatisé, de recommandations
  nutritionnelles ou de fonctionnalités communautaires.
- La détection automatique de schémas comportementaux n'est pas développée :
  au démarrage, ce repérage reste manuel, par lecture du rapport ou de
  l'export (au-delà des alertes par créneau de FR-19 à FR-23, qui restent un
  signal simple, pas une analyse).
- Les notions de recette (assemblage de plats), de repas types et de favoris
  ne sont pas développées dans ce PRD.

## 7. MVP Scope

### 7.1 In Scope

- Lot 1 complet : FR-1 à FR-12 (saisie, édition, historique, export,
  rapport PDF).
- C'est le socle qui doit fonctionner seul avant que le Lot 2 ne soit ajouté.

### 7.2 Out of Scope for MVP

- Lot 2 (FR-13 à FR-23 : scan code-barres, OpenFoodFacts, Yuka conditionnel,
  cible calorique et alertes par créneau) — développé immédiatement après le
  MVP, dans le même PRD, mais pas requis pour la première version utilisable.
  `[NOTE FOR PM]` Le Lot 2 reste émotionnellement important (motivation n°2,
  programme de remise en forme) — à ne pas laisser glisser indéfiniment une
  fois le MVP livré.
- Tout le contenu de §6 Non-Goals — différé à des lots ultérieurs ou non
  prévu du tout.

## 8. Success Metrics

**Primary**
- **SM-1** : Usage quotidien sans abandon — l'utilisateur continue de logger
  au moins une entrée par jour après 4 semaines d'usage réel. Valide FR-1 à
  FR-6.
- **SM-2** : Le rapport PDF est apporté tel quel à au moins une consultation
  diététique, sans reconstruction manuelle préalable. Valide FR-10, FR-11,
  FR-12.

**Secondary**
- **SM-3** : Au moins un comportement dysfonctionnel est identifié par
  relecture du rapport, de l'export, ou via une alerte par créneau, dans les
  4 premières semaines d'usage. Valide FR-10, FR-11, FR-19 à FR-23.

**Counter-metrics (à ne pas optimiser)**
- **SM-C1** : Le temps de saisie d'une entrée simple (UJ-1) ne doit pas
  dépasser ~20 secondes en usage courant. Contrebalance SM-3 : enrichir les
  champs pour mieux analyser ne doit jamais se faire au prix de la rapidité de
  saisie qui conditionne SM-1.

## 9. Open Questions

1. Faisabilité technique réelle de l'enrichissement Yuka (FR-18) — à trancher
   en phase d'architecture.
2. Mécanisme précis d'accès distant hors réseau domestique (NFR-2) — VPN,
   proxy inverse authentifié, ou autre — à trancher en architecture, mais
   requis dès le Lot 1 puisque UJ-1 en dépend.
3. Valeurs initiales des créneaux horaires et de leurs seuils (FR-20, FR-21)
   — volontairement laissées à la configuration de l'utilisateur ; aucune
   valeur par défaut n'est imposée par ce PRD.
4. Un mode de saisie encore plus rapide (vocal, raccourci) pourrait-il être
   nécessaire si l'usage révèle que 20 secondes reste un frein réel ? Non
   demandé à ce stade — à surveiller après usage.
5. Piste à évaluer en architecture (FR-18) : plutôt que d'interroger Yuka à
   chaque scan, l'enrichissement pourrait se faire en lot (batch) au moment de
   la génération du rapport PDF plutôt qu'à la saisie — réduirait la
   dépendance temps réel à une source non officielle. À trancher avec le
   reste de la faisabilité Yuka.

---

## 11. V1.1 — Évolutions et corrections (2026-06-26)

### Contexte

La V1.0 est déployée et utilisée. Ces trois ajustements sont issus du premier cycle d'usage réel. Ils sont traités comme une maintenance évolutive mineure — aucun changement de vision, aucune remise en cause du modèle de données existant.

### 11.1 Affichage de la version et du build dans l'en-tête

**Description :** L'utilisateur doit pouvoir identifier immédiatement quelle version de PACAL tourne sur son NAS, sans consulter les logs du conteneur.

#### FR-24 : Affichage version et build dans l'en-tête de l'application
Sous le titre PACAL, l'application affiche en plus petit et en italique le numéro de version sémantique et la référence de build (date de build et/ou hash de commit court). Cette information est injectée au moment du build et non saisie manuellement.

**Conséquences (testables) :**
- Le numéro de version est lisible dans toutes les vues de l'application, sous le titre principal.
- La valeur est cohérente avec le tag git ou la date de build du conteneur déployé.
- L'information ne figure pas dans une page de paramètres cachée : elle est visible sans navigation supplémentaire.

**Décision de conception :** la référence de build est injectée via une variable d'environnement au moment du build Docker (`NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_BUILD_DATE`), ce qui ne nécessite aucune modification du modèle de données.

---

### 11.2 Suppression et duplication d'une entrée depuis l'historique

**Description :** Deux actions manquantes sur la vue historique : supprimer une entrée erronée, et dupliquer une entrée pour réutiliser son contenu sans ressaisir.

#### FR-25 : Suppression d'une entrée depuis la vue historique
L'utilisateur peut supprimer définitivement une entrée depuis la vue historique. Une confirmation explicite est demandée avant la suppression (action destructive irréversible).

**Conséquences (testables) :**
- Une action "Supprimer" est accessible depuis la vue historique pour chaque entrée.
- Un mécanisme de confirmation (dialog, bouton de confirmation) est présenté avant la suppression effective.
- Après confirmation, l'entrée disparaît de l'historique, des exports et des rapports générés ultérieurement.
- La photo associée (si elle existe) est également supprimée du stockage.

#### FR-26 : Duplication d'une entrée depuis la vue historique
L'utilisateur peut dupliquer une entrée existante depuis la vue historique. La duplication crée une nouvelle entrée pré-remplie avec les valeurs de l'entrée source (description, poids, calories, conditions de prise, note), mais avec l'horodatage remis à l'instant présent. La photo n'est pas dupliquée.

**Conséquences (testables) :**
- Une action "Dupliquer" est accessible depuis la vue historique pour chaque entrée.
- L'action crée immédiatement une nouvelle entrée avec les valeurs de l'entrée source, sans étape intermédiaire de formulaire à valider.
- L'horodatage de la nouvelle entrée est celui de l'instant de la duplication.
- La photo de l'entrée source n'est pas copiée — le champ photo est vide sur la nouvelle entrée.
- L'entrée source reste inchangée.

---

### 11.3 Vignette photo dans le rapport PDF

**Description :** Quand une entrée comporte une photo, le rapport PDF doit permettre de l'identifier visuellement sans avoir à ouvrir l'export ZIP séparément.

#### FR-27 : Layout 3 colonnes dans le rapport PDF avec vignette photo
Le rapport PDF adopte un layout à 3 colonnes pour chaque ligne d'entrée : heure | contenu textuel | photo. La colonne photo est toujours présente ; elle affiche une vignette d'environ 2 cm de hauteur quand une photo existe, et reste vide sinon. Ce layout remplace le layout existant à 2 colonnes.

**Conséquences (testables) :**
- Toute ligne d'entrée dans le PDF présente les 3 colonnes, quelle que soit la présence d'une photo.
- Une entrée avec photo affiche une vignette d'environ 2 cm de hauteur dans la colonne droite.
- Une entrée sans photo laisse la colonne droite vide (pas de placeholder, pas d'icône).
- La vignette est suffisamment petite pour ne pas fragmenter le rapport (pas de saut de page provoqué par une seule image).
- Les entrées "instant" (sans champ alimentaire) suivent le même layout.

**Décision de conception :** la hauteur de 2 cm est une contrainte de rendu — elle sera traduite en unités pt dans `@react-pdf/renderer` lors de l'implémentation. Le ratio d'aspect de la photo est préservé (pas de déformation).

---

---

## §11 (suite) — Addendum V1.2 (2026-06-28)

*Stories 1.12 à 1.19 correspondent aux FR-28 à FR-35 ci-dessous.*

#### FR-28 : Bouton de rafraîchissement de la date/heure
Sur le formulaire de saisie (nouvelle entrée **et** édition d'une entrée existante), un bouton discret permet de remettre la date/heure à l'instant courant. Ce besoin naît du cas d'usage où l'utilisateur laisse le formulaire ouvert et revient plus tard pour saisir une deuxième fiche : la date/heure pré-remplie au chargement est alors obsolète.

**Conséquences (testables) :**
- Un bouton "Actualiser la date/heure" est visible à côté du champ date sur les deux formulaires (saisie + édition).
- Un clic positionne le champ date/heure sur l'instant de l'appui (à la seconde).
- Le bouton ne soumet pas le formulaire.

#### FR-29 : Pré-remplir le dernier contexte saisi
Le champ *contexte* (condition de prise — liste fermée) se pré-remplit avec la dernière valeur utilisée par l'utilisateur, plutôt que de rester vide ou sur une valeur arbitraire.

**Conséquences (testables) :**
- À l'ouverture d'un formulaire de nouvelle entrée, le champ contexte affiche la dernière valeur enregistrée (persistée côté serveur ou en localStorage).
- Si aucune entrée n'existe encore, le comportement actuel est conservé (valeur vide ou premier choix de la liste).
- Le formulaire d'édition d'une entrée existante n'est pas affecté (il pré-remplit la valeur de l'entrée, pas la "dernière").

#### FR-30 : Remplacer "poids" par "quantité" + unité
Le champ "poids" (nombre décimal, libellé "Poids estimé (g)") est remplacé par :
- **Quantité** : entier positif, optionnel.
- **Unité** : liste fermée — `g`, `kg`, `dl`, `l`, `portion` — optionnelle, sans valeur par défaut imposée.

Ce changement impacte : la table `entries` (migration), les exports CSV/ZIP, et le rapport PDF.

**Conséquences (testables) :**
- La colonne `weight` est renommée `quantity` (entier) et une colonne `unit` (varchar) est ajoutée par migration Drizzle.
- Le formulaire de saisie et le formulaire d'édition reflètent les nouveaux libellés et types.
- L'export CSV contient les colonnes `quantity` et `unit` (la colonne `weight` disparaît).
- Le rapport PDF affiche "X g", "X portion", etc. selon l'unité choisie. Si aucune unité, la valeur seule est affichée.
- Une entrée sans quantité ni unité reste valide.

#### FR-31 : Type de note (aliment, médicament, sommeil, autre)
Le champ "note" (texte libre) est enrichi d'un sous-champ **type** optionnel, liste fermée : `aliment`, `médicament`, `sommeil`, `autre`. Ce champ s'ajoute sans modifier le champ *contexte* (condition de prise, FR-4) qui reste inchangé.

**Conséquences (testables) :**
- Une colonne `note_type` (varchar nullable) est ajoutée à `entries` par migration Drizzle.
- Sur les formulaires, un sélecteur "Type de note" apparaît à côté ou sous le champ note — il est optionnel (peut rester non renseigné).
- Le type de note apparaît dans l'export CSV et dans le rapport PDF.
- Le champ contexte (condition de prise) reste inchangé.

#### FR-32 : Menu "À propos"
L'affichage de la version et du build sous le titre PACAL (FR-24, Story 1.9) est remplacé par un lien/menu "À propos" accessible depuis l'en-tête. Ce menu contient :
1. Numéro de version et date de build (identique à l'ancien affichage).
2. Stack technique avec numéros de version (Next.js, tRPC, Drizzle, Tailwind, PostgreSQL, Node.js — lus depuis `package.json` pour les dépendances npm).
3. Changelog succinct (texte statique maintenu manuellement dans le code).

**Conséquences (testables) :**
- L'en-tête ne montre plus la version en sous-titre permanent.
- Un lien "À propos" est présent dans la navigation (ou l'en-tête).
- La page/modal "À propos" affiche les 3 sections ci-dessus.
- En l'absence des variables d'environnement de build, la section version s'affiche sans erreur.

#### FR-33 : Deux photos par fiche
Chaque entrée peut désormais avoir jusqu'à **deux photos** indépendantes et optionnelles. Aucune contrainte sur le contenu (l'utilisateur choisit librement ce qu'il photographie). Il n'y aura pas de troisième slot.

**Conséquences (testables) :**
- Deux colonnes `photo_path_1` et `photo_path_2` (nullable) remplacent `photo_path` dans `entries` — migration Drizzle requise.
- Sur le formulaire de saisie et d'édition, deux zones de capture indépendantes sont présentes (chacune : appareil photo ou galerie, preview, suppression).
- Chaque zone est optionnelle et indépendante de l'autre.
- L'export ZIP inclut les deux photos si elles existent (nommées distinctement).
- Le rapport PDF affiche jusqu'à deux vignettes par entrée (layout à adapter).
- La suppression d'une entrée supprime les deux fichiers photos associés.

#### FR-34 : Duplication → écran de saisie prérempli
La duplication d'une entrée depuis l'historique n'effectue plus de copie directe. Elle ouvre le formulaire de saisie pré-rempli avec les champs de l'entrée source, mais :
- la date/heure est celle de l'instant courant (pas de l'entrée source) ;
- aucune photo n'est reprise.

**Conséquences (testables) :**
- Depuis l'historique, le bouton "Dupliquer" ouvre le formulaire de saisie (pas de création immédiate).
- Tous les champs textuels/sélecteurs de l'entrée source sont pré-remplis, sauf la date (= maintenant) et les photos (vides).
- L'utilisateur peut modifier tous les champs avant d'enregistrer.
- L'entrée source reste inchangée.
- Aucune entrée n'est créée si l'utilisateur annule.

#### FR-35 : Charte graphique et logo
Application d'une identité visuelle cohérente sur l'ensemble des écrans et du rapport PDF.

**Palette :**
- Titres (headings h1–h3, labels de section) : `#F05C22` (orange).
- Saisies et textes courants : `#06466D` (bleu marine).

**Logo :** le fichier logo fourni (`public/logo.png`) est affiché :
- Dans l'en-tête de l'application (à côté du titre "PACAL").
- En en-tête du rapport PDF généré.

**Conséquences (testables) :**
- Tous les titres principaux affichent la couleur `#F05C22`.
- Les champs de saisie et le texte courant affichent la couleur `#06466D`.
- Le logo est visible dans le header sur toutes les pages.
- Le logo est visible en en-tête du PDF.
- L'application reste lisible et accessible (contraste suffisant sur fond blanc).

---

## 10. Assumptions Index

- §2.3 UJ-1 — après sauvegarde d'une entrée, l'app revient sur un écran de
  saisie vierge plutôt que sur une liste ou un écran de confirmation.
- §3 Glossaire / FR-4 — les conditions de prise sont à sélection unique, pas
  multiple.
- FR-5 — la photo est optionnelle (0 ou 1), pas obligatoire.
- FR-8 — une vue historique des entrées est nécessaire bien qu'absente du
  cahier des charges initial, comme condition d'usage de l'édition (FR-7).
- FR-9 — l'export couvre l'historique complet par défaut, avec un filtre de
  période optionnel.
- FR-5 — les deux mécanismes de capture (prise directe via l'appareil photo,
  sélection depuis la pellicule) sont équivalents du point de vue du modèle
  de données ; aucune distinction n'est conservée après l'attachement.
