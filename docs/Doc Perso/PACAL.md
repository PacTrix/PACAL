Cahier des charges application PACAL pour l'enregistrements des prises alimentaires

# Contexte

Il s'agit d'une application dont je serai le seul utilisateur.

# Objectif principal

Enregistrer les prises alimentaires avec **horodatage**, photos et notes.

Je veux ensuite pouvoir analyser ce que j'ai mangé (ou bu) en quelles quantités, à quelle heure, et dans quelles conditions pour l'exploiter ou le fournir à un diététicien lors d'une consultation (donc sorti Excel ou report PDF un peu mieux construit)

# Environnement technique

Au départ, l'application sera hébergé sous la forme d'un site web sur mon NAS DS923+

Base de données : j'ai postgres mais on peut utiliser autre chose si motivé

Utilisation sur smartphone ou tablette Android ou depuis mon Mac avec Chrome

# Principes de base de fonctionnemt

1) Lancement de l’application.
   Par défaut l'app se lance directement sur une saisie alimentaire
2) Date et heure courante par défaut mais modifiables
3) description de la prise
4) Poids estimé
5) kcal estimé
6) Conditions de la prise
   1) Chez moi
   2) Au bureau
   3) Au resto (business)
   4) Au resto (Amis)
   5) Chez des gens
7) Notes
8) Photo (1 photo par prise)

# Fonctionnalités à prendre en compte

## Lot 1

- Saisie d'une prise alimentaire selon "principe de base de fonctionnement"
- Édition d'une prise
- Export XLSS ou CSV ou autre
- Impression d'un rapport PDF de base avec tous les renseignements pour chaque prise et un regroupement jour par jour

## Lot 2

- Scan du barcode
  - Recherche dans OpenFood Fact - Préreplissage de la prise avec les éléments trouvés
    - Gestion du nombre de kcal au 100g (ou l) ou bien à la portion
    - Ajustement (recalcul) des kg si les quantités changent
  - Recherche dans Yuka
  - Entre OpenFood fact et Yuka, ajout de quelques champs dont
    - Nutriscore
    - Score sur 100 de Yuka
    - Lien vers la fiche OpenFoodFact
    - Lien vers la fiche Yuka
    - Les éventuelles remarques sur le caractère sain ou pas

## Lots ultérieurs

- Ajout de fonctionnalités pour se rapprocher des applications telles que Yazio
- Mode offline
- Prise en compte de l'activité via Garmin
- Prise en compte du poids via RenphoHealth



