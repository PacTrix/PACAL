---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/planning-artifacts/briefs/brief-PACAL-2026-06-18/brief.md
  - _bmad-output/planning-artifacts/prds/prd-PACAL-2026-06-18/prd.md
  - docs/PACAL-cahier-des-charges.md
workflowType: 'architecture'
project_name: 'PACAL'
user_name: 'Utilisateur'
date: '2026-06-18'
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
  Aucune app native prévue en lot 1 ou 2
- Le scan de code-barres (FR-13) suppose un accès caméra depuis le
  navigateur mobile — à valider techniquement (API navigateur de détection
  de code-barres ou bibliothèque dédiée).
- OpenFoodFacts expose une API publique stable (vérifié en phase Brief).
  Yuka n'en expose aucune officiellement — FR-18 reste une investigation, pas
  un engagement.
- Le mode hors ligne est un non-objectif explicite (PRD §6) — l'architecture
  peut donc supposer une connexion permanente au serveur. Le mode hors ligne sera demandé ultérieurement

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

