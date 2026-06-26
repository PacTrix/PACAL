---
title: "Product Brief: PACAL"
status: approved
created: 2026-06-18
updated: 2026-06-18
---

# Product Brief: PACAL

## Executive Summary

PACAL est une application personnelle d'enregistrement des prises
alimentaires conçue pour une seule chose que les applications grand public
(Yazio, MyFitnessPal) ne font pas correctement : capturer le moment exact, le
contexte et la matière visuelle d'une prise, plutôt que de la faire entrer
dans des cases de "repas" prédéfinies. Elle naît d'un besoin concret — mener
un programme de remise en forme exigeant tout en préparant des données
sérieuses pour des consultations diététiques — et d'une frustration vécue
avec les outils existants, qui perdent l'horodatage, n'acceptent ni photo ni
note développée, et ne s'exportent pas dans un format utile à un rendez-vous
clinique.

La solution repose sur un parcours de saisie sans friction (ouverture directe
sur l'enregistrement, horodatage réel modifiable, un tag de contexte, une
photo, une note libre), avec tous les champs alimentaires rendus optionnels
pour qu'une entrée puisse aussi capturer un instant sans nourriture — une
prise de médicament, une fringale résistée. En sortie, un export brut et un
rapport PDF jour par jour, conçu pour un diététicien, distinguent clairement
une estimation d'une valeur retrouvée par scan de code-barres une fois le
Lot 2 activé, OpenFoodFacts étant la source fiable et l'enrichissement Yuka
restant conditionnel à sa faisabilité technique réelle.

À ce stade, le succès se mesure simplement : une donnée assez riche et
honnête pour qu'on puisse, en la relisant, repérer soi-même ses propres
comportements dysfonctionnels. Les ambitions plus larges — activité physique,
poids mesuré, détection automatique de schémas, usage hors ligne — restent
une trajectoire assumée plutôt qu'une promesse du jour un.

## The Problem

Suivre précisément ce qu'on mange exige de tenir ensemble deux choses que les
applications grand public ne tiennent jamais en même temps : la fidélité
temporelle et contextuelle de l'enregistrement, et la possibilité d'en faire
une preuve présentable à un professionnel de santé. L'utilisateur vit cette
tension de plein fouet : engagé dans une remise en forme exigeante, il a besoin
de savoir non seulement combien de calories il absorbe, mais à quel moment
précis, dans quel contexte (chez lui, au bureau, au resto pour affaires ou
entre amis, chez des proches), avec quelle marge d'incertitude sur le poids
estimé.

Les deux références du marché testées — Yazio et MyFitnessPal — échouent au
même endroit, pour des raisons différentes. Ni l'une ni l'autre n'horodate
réellement une prise : la saisie est contrainte dans des créneaux de "repas"
prédéfinis, ce qui pousse à entasser tout ce qui ne rentre pas dans ces cases
dans un "repas fourre-tout" — l'information temporelle, pourtant centrale pour
comprendre ses propres schémas alimentaires, disparaît dès la saisie. Ni l'une
ni l'autre ne permet d'attacher une photo à une prise, ni de rédiger une note
un peu développée : l'application enregistre un chiffre, pas un souvenir
exploitable. Les bases de code-barres sur lesquelles elles s'appuient sont
alimentées par la communauté et truffées d'erreurs, sans qu'aucun signal de
fiabilité (Nutriscore, score Yuka) ne soit affiché pour aider à trancher. Et au
moment où ces données devraient servir à quelque chose — préparer un
rendez-vous chez le diététicien — Yazio ne propose aucun export, et l'export de
MyFitnessPal n'a manifestement pas été pensé pour cet usage.

Le coût du statu quo : des données saisies consciencieusement dans des outils
qui en perdent une partie en route, sans matière exploitable au moment précis
où elle compterait — face à un professionnel, ou face à soi-même pour ajuster
sa trajectoire.

## The Solution

PACAL part d'un parti pris simple : l'app s'ouvre directement sur la saisie
d'une prise, sans détour par un menu ou une sélection de "repas". L'heure
réelle est proposée par défaut et reste modifiable en deux gestes — la prise
est rattachée au moment où elle a vraiment eu lieu, pas au créneau le plus
proche dans une liste figée. Chaque entrée porte sa propre photo, sa propre
note libre, et un tag de contexte (chez moi, au bureau, au resto business, au
resto entre amis, chez des gens) qui transforme un simple chiffre de calories
en un souvenir qu'on peut relire et interpréter des semaines plus tard.

Cette discipline de saisie n'a de valeur que si elle débouche sur quelque
chose d'exploitable. PACAL exporte les données brutes (Excel/CSV) pour qui veut
les retravailler, et génère un rapport PDF regroupé jour par jour, pensé dès le
départ pour être amené à une consultation diététique plutôt que reconstitué à
la main avant le rendez-vous. Le scan de code-barres vient ensuite alléger la
saisie répétitive : une recherche dans OpenFoodFacts préremplit poids et
calories, avec recalcul automatique si la quantité réellement consommée
diffère de la portion de référence. L'enrichissement par le Nutriscore et le
score Yuka reste un objectif assumé mais conditionnel : OpenFoodFacts a une API
publique stable, ce qui n'est pas le cas de Yuka — ce point est traité comme un
risque de scope plutôt que comme une promesse, voir section Scope.

Le poids et les calories restent par nature des estimations en Lot 1 — saisies
à l'œil, avant tout enrichissement par scan. Plutôt que de chercher une fausse
précision, PACAL assume cette incertitude : un doute peut se documenter dans la
note libre ou se compléter par la photo, et le rapport distinguera clairement
une valeur estimée à la main d'une valeur retrouvée via un code-barres, pour ne
jamais donner au diététicien une impression de précision qui n'existe pas.

Tous les champs liés à la nourriture (description, poids, calories) sont
volontairement optionnels : une entrée peut ne porter que l'horodatage, une
photo et une note. Ça permet de capturer des moments qui ne sont pas des prises
alimentaires mais qui comptent tout autant dans un suivi de remise en forme —
une prise de médicament, un coup de fatigue en milieu de journée, une fringale
à laquelle on a résisté. PACAL devient ainsi un journal de bord ponctuel plutôt
qu'un simple compteur de calories, sans jamais imposer de saisie superflue
quand seul l'instant compte.


Au-delà du Lot 1 et du Lot 2, PACAL est pensé comme une fondation : le même
modèle de données pourra accueillir, plus tard, l'activité physique (Garmin) et
le poids mesuré (Renpho), pour rapprocher l'outil d'un suivi à la Yazio — mais
en gardant l'horodatage fin et la richesse contextuelle qui font tout l'intérêt
de l'app par rapport à l'existant.


## What Makes This Different

PACAL ne cherche pas à rivaliser avec Yazio ou MyFitnessPal sur leur terrain —
bases de données massives, communauté, coaching automatisé. Sa différence
tient à trois partis pris que ces outils n'ont pas faits, précisément parce
qu'ils visent un public large plutôt qu'un usage personnel exigeant :
l'horodatage réel de chaque prise plutôt qu'un découpage en repas figés, la
photo et la note comme citoyens de première classe plutôt que comme
accessoires, et un export pensé dès le départ pour un usage clinique plutôt
que pour un partage social. Le fait d'accepter des entrées sans contenu
alimentaire (médicament, fringale résistée, coup de fatigue) pousse cette
logique un cran plus loin : PACAL documente des instants de vie liés à la
santé, pas seulement des calories — et le rapport pour le diététicien en
profite directement, puisque ces instants y figurent au même titre que les
prises alimentaires.

L'honnêteté méthodologique veut qu'on le dise : ce différenciateur est un
choix d'usage, pas un avantage technique. Rien n'empêcherait Yazio d'ajouter
l'horodatage libre demain. L'avantage de PACAL est d'exister *pour un seul
utilisateur aux besoins précis*, sans les compromis qu'impose un produit grand
public.

## Who This Serves

PACAL a un seul utilisateur actif : la personne qui saisit ses prises et
consulte ses propres données pour ajuster sa trajectoire de remise en forme.
Il a un second destinataire, plus occasionnel mais tout aussi déterminant pour
la conception : le diététicien qui reçoit le rapport PDF lors des
consultations. Ce deuxième public n'interagit jamais avec l'application —
il ne voit que la sortie — mais c'est lui qui fixe l'exigence de lisibilité et
de rigueur du rapport : pas de jargon d'app, pas d'ambiguïté entre une valeur
estimée et une valeur mesurée, une vue jour par jour qui se lit comme un
dossier plutôt que comme un export brut.

## Success Criteria

PACAL répond à deux publics, donc à deux mesures de succès qui ne se confondent
pas.

**Côté usage personnel** : l'outil réussit s'il permet de repérer des
comportements dysfonctionnels par rapport aux objectifs de remise en forme —
pas seulement de compter des calories, mais de relier une dérive (horaire,
contexte, quantité) à une situation identifiable. Cela suppose que la donnée
saisie (horodatage, conditions, notes, photo) soit suffisamment riche et
consultable pour faire émerger ces schémas, que ce soit par lecture directe du
rapport/export ou par un minimum d'agrégation dans l'app — point à trancher en
Scope plutôt qu'ici.

**Côté démarche professionnelle** : le succès se mesure à la conversation avec
le client la semaine prochaine, autour de trois messages — la preuve par
l'exemple que BMAD produit rapidement des applications documentées et
maintenables, la thèse que tout travail en 2026 doit s'appuyer sur l'IA, et le
point plus fin qu'il faut l'utiliser avec profondeur et méthode plutôt qu'à
coups de prompts d'une ou deux phrases.

## Scope

**Dans le périmètre (Lot 1)** — saisie directe à l'ouverture de l'app, avec
horodatage par défaut modifiable ; tous les champs liés à la nourriture
(description, poids estimé, calories estimées) optionnels pour permettre des
entrées "instant" (médicament, fringale résistée, coup de fatigue) ; conditions
de prise parmi les cinq valeurs fixes ; une photo et une note libre par
entrée ; édition d'une entrée existante ; export CSV/Excel ; rapport PDF
regroupé jour par jour, incluant indifféremment les entrées alimentaires et
non-alimentaires, et distinguant visuellement une valeur estimée d'une valeur
retrouvée par code-barres.

**Dans le périmètre (Lot 2)** — scan de code-barres avec recherche
OpenFoodFacts, préremplissage poids/calories et recalcul automatique si la
quantité consommée diffère de la portion de référence, gestion du kcal au
100g/100ml vs à la portion ; affichage du Nutriscore et lien vers la fiche
OpenFoodFacts quand disponibles. L'enrichissement Yuka (score sur 100, lien
fiche, remarques santé) est **conditionnel** : Yuka n'expose aucune API
publique officielle, contrairement à OpenFoodFacts — sa faisabilité doit être
validée techniquement en phase d'architecture avant d'être engagée dans un
sprint ; si aucune voie fiable n'existe, ce point sort du Lot 2 sans remettre
en cause le reste. Le Lot 2 inclut aussi la fixation d'une cible de calories
par jour avec une alerte progressive au fil des prises — contrairement au
reste du backlog Yazio-like ci-dessous, ce point sert directement le programme
de remise en forme et n'attend pas un lot ultérieur.

**Hors périmètre actuel** (lots ultérieurs, explicitement non traités
maintenant) : mode offline, intégration Garmin (activité), intégration Renpho
(poids corporel), fonctionnalités de coaching/communauté à la Yazio, et toute
agrégation ou détection automatique de schémas comportementaux — au démarrage,
le repérage des comportements dysfonctionnels reste manuel, par lecture du
rapport ou de l'export. PACAL reste par construction une application
mono-utilisateur : aucune notion de compte multiple, partage ou permissions
n'est prévue.

Autres fonctions possibles ultérieurement : plus ou moins ce que l'on retrouve dans les applications comme MFP et Yazio :

- possibilité d'assembler plusieurs aliments en un plat (notiion de recette)
- possibilité d'avoir des repas type
- possibilité d'avoir des favoris - dans le cas d'un aliment favori on peut alors aussi enregistrer la quantité favorite
- Enrichissement des rapports avec des statistiques 
  - répartition des calories au cours de la journée
  - analyse nutritionnelle des prises (lipides, protéine, glucides) - analyse plus détaillés des nutriments)

## Vision

Dans deux ou trois ans, PACAL n'est plus seulement un carnet de prises
alimentaires : c'est le point de convergence de tout ce qui informe une
remise en forme menée sérieusement — l'alimentation, l'activité physique
(Garmin), le poids mesuré (Renpho), utilisable hors connexion. La donnée
accumulée est suffisamment riche pour que le repérage des comportements
dysfonctionnels, manuel au démarrage, devienne progressivement assisté :
PACAL pourrait suggérer un schéma ("les fringales résistées augmentent les
jours de resto business") plutôt que d'attendre qu'on le découvre soi-même en
relisant un rapport. Il reste pensé pour une seule personne et ses besoins
exacts plutôt que pour le plus grand nombre — c'est précisément ce qui lui
permet d'aller là où les applications grand public ne s'aventurent pas.
