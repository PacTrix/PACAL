---
title: "PACAL — PRD V2 : Scan code-barres et enrichissement OpenFoodFacts"
status: final
version: "2.0"
created: 2026-06-28
updated: 2026-06-28
finalized: 2026-06-28
author: PAC
pm: John (BMAD)
---

# PACAL V2 — Scan code-barres et enrichissement OpenFoodFacts

## 1. Contexte et objectif

PACAL est un journal alimentaire personnel, auto-hébergé sur NAS Synology DS923+ (Docker), accessible via Tailscale. Utilisateur unique.

La V1 permet la saisie manuelle d'entrées alimentaires avec photo, quantité, note et export PDF/CSV. La V2 enrichit la saisie en permettant d'identifier un aliment par son code-barres (EAN) et d'en récupérer automatiquement les données nutritionnelles depuis la base OpenFoodFacts (nutriscore, nova, greenscore, kcal).

**Objectif V2 :** réduire la friction de saisie et enrichir la qualité des données sans modifier le flux existant pour les entrées sans code-barres.

## 2. Périmètre V2

**Inclus :**
- Saisie et scan du code-barres EAN
- Enrichissement automatique depuis OpenFoodFacts (scores nutritionnels + données kcal)
- Calcul automatique des kcal selon quantité saisie
- Signalement visuel des fiches incomplètes (données OpenFoodFacts manquantes)
- Affichage dans la vue détail et le rapport PDF

**Exclus (reportés) :**
- Cible calorique et alertes déséquilibre (→ V2.5)
- Tables CIQUAL (→ version ultérieure)
- Note Yuka (abandonnée — API non publique)

## 3. Exigences fonctionnelles

### FR-36 — Saisie du code-barres avec scan caméra

**Dans le formulaire de saisie (nouvelle entrée) et le formulaire d'édition :**

- Un champ optionnel "Code-barres" est ajouté, avec un bouton **Scan** à sa droite.
- Le champ accepte une saisie manuelle (clavier) du code EAN.
- Le bouton Scan déclenche la caméra de l'appareil pour lire un code-barres.
  - [ASSUMPTION] Implémentation via la bibliothèque `@zxing/browser` ou `html5-qrcode` (scan côté client dans le navigateur — pas de backend requis pour la capture). À confirmer par l'architecte.
- Une fois le code détecté (par scan ou saisie + validation), le champ "Code-barres" est rempli et la recherche OpenFoodFacts se déclenche automatiquement.
- Le champ reste éditable après le scan pour permettre une correction manuelle en cas de lecture imprécise.
- Le code-barres est persisté en base de données avec l'entrée.

### FR-37 — Recherche automatique dans OpenFoodFacts

- Dès qu'un code-barres est disponible (scan ou saisie manuelle), l'application interroge l'API OpenFoodFacts.
  - [ASSUMPTION] Endpoint : `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- Si le produit est trouvé, les données sont utilisées pour pré-remplir les champs définis en FR-38 et FR-39.
- Si le produit n'est **pas trouvé** (réponse 404 ou `status: 0`) ou si l'appel **échoue** (réseau indisponible, timeout) :
  - Le code-barres reste dans le champ.
  - Un message non-bloquant informe l'utilisateur ("Produit non trouvé dans OpenFoodFacts" ou "Connexion indisponible").
  - Un flag interne `of_incomplete: true` est associé à l'entrée (déclenche FR-41).
  - Toute la saisie manuelle reste possible.

### FR-38 — Affichage des scores nutritionnels (nutriscore / nova / greenscore)

**Après enrichissement OpenFoodFacts :**

- Les trois scores sont affichés de façon synthétique sous la forme **X·N·Y** où X = nutriscore (lettre), N = nova (chiffre), Y = greenscore (lettre). Si un score est absent des données OpenFoodFacts, il est remplacé par `_`.
  - Exemple : `B·3·A`, ou `B·_·A` si le nova est absent.
- Chaque score est colorisé :
  - **Nutriscore** : A, B → vert ; C → orange ; D, E → rouge
  - **Nova** : 1, 2 → vert ; 3 → orange ; 4 → rouge
  - **Greenscore** : A, B → vert ; C → orange ; D, E → rouge
- L'affichage est visible dans :
  - Le formulaire de saisie / édition (sous le champ code-barres)
  - La vue détail d'une entrée
  - Le rapport PDF (avec les couleurs correspondantes)
- L'affichage n'apparaît **pas** dans la liste historique (vue synthétique).
- Les valeurs de score sont persistées en base de données.

### FR-39 — Calcul automatique des kcal selon quantité

**Prérequis :** des données OpenFoodFacts ont été récupérées (kcal/100g et/ou kcal/portion disponibles).

- Quand l'utilisateur saisit ou modifie le champ **Quantité** :
  - Si l'unité est `g` ou `kg` : `kcal = round_down(quantité_en_g × kcal_per_100g / 100)`
  - Si l'unité est `dl` ou `l` : `kcal = round_down(quantité_en_ml × kcal_per_100ml / 100)`
    - [ASSUMPTION] OpenFoodFacts fournit les kcal pour 100ml sur les produits liquides — à vérifier lors de l'implémentation.
  - Si l'unité est `portion` : `kcal = kcal_per_portion` (valeur fixe issue d'OpenFoodFacts, indépendante de la quantité saisie)
    - Si la valeur kcal/portion n'est pas disponible : le champ kcal est grisé visuellement (mais reste éditable manuellement) et affiche `---`.
- Le champ kcal est mis à jour automatiquement à chaque changement de quantité ou d'unité, tant que l'utilisateur n'a pas saisi manuellement une valeur.
- Si l'utilisateur **modifie manuellement** le champ kcal après un calcul automatique, la valeur est verrouillée (le recalcul automatique s'arrête pour cette session de saisie).
  - [ASSUMPTION] Un indicateur visuel léger (ex. icône "crayon" ou texte "manuel") signale que la valeur a été forcée. À arbitrer à l'implémentation.

### FR-40 — Persistance des données OpenFoodFacts en base

Les champs suivants sont ajoutés à l'entrée et persistés :

| Champ logique | Contenu |
|---|---|
| `barcode` | Code EAN (texte) |
| `nutriscore` | Lettre A–E ou null |
| `nova` | Entier 1–4 ou null |
| `greenscore` | Lettre A–E ou null |
| `kcal_per_100g` | Réel (pour recalcul) ou null |
| `kcal_per_portion` | Réel ou null |
| `of_incomplete` | Booléen — true si OpenFoodFacts n'a pas pu enrichir la fiche |

Ces champs sont ajoutés à l'export CSV.

### FR-41 — Signalement visuel des fiches incomplètes

- Une entrée est marquée "incomplète" (`of_incomplete: true`) quand :
  - Un code-barres a été saisi/scanné, mais OpenFoodFacts n'a pas retourné de données (produit inconnu, erreur réseau, timeout).
- Dans la **liste historique**, ces entrées affichent un triangle orange ⚠ (petit, non intrusif) permettant de les identifier visuellement et d'aller les compléter ultérieurement.
- Dans le **formulaire d'édition**, le message d'avertissement OpenFoodFacts est réaffiché si `of_incomplete` est true et qu'un code-barres est présent.
- Quand l'édition d'une entrée incomplète aboutit à un enrichissement réussi, `of_incomplete` passe à `false`.

### FR-42 — Affichage dans la vue détail et le rapport PDF

**Vue détail / édition (`/entrees/[id]`) :**
- Code-barres affiché en lecture seule (éditable en mode édition).
- Scores X·N·Y colorisés affichés si disponibles.
- Kcal calculés affichés normalement.

**Rapport PDF :**
- Code-barres affiché si présent.
- Scores X·N·Y affichés avec les couleurs vert/orange/rouge (via `@react-pdf/renderer` `StyleSheet`).
- Indication "(données manuelles)" si `of_incomplete` est true.

## 4. Exigences non fonctionnelles

**NFR-1 — Compatibilité caméra mobile**
Le scan doit fonctionner depuis Safari sur iOS et Chrome sur Android, qui sont les navigateurs utilisés pour accéder à PACAL via Tailscale sur mobile.

**NFR-2 — Latence API OpenFoodFacts**
L'appel à OpenFoodFacts se fait côté client (pas de proxy backend).
[ASSUMPTION] Un timeout de 5 secondes est appliqué. Au-delà, le comportement offline (FR-37) s'applique.

**NFR-3 — Pas de clé API requise**
L'API OpenFoodFacts est publique et gratuite pour un usage personnel. Aucune authentification requise.

**NFR-4 — Dégradé gracieux**
Si les données OpenFoodFacts sont absentes ou partielles, toutes les fonctionnalités de saisie manuelle V1 restent accessibles et inchangées.

**NFR-5 — Migration de schéma**
La migration SQL sera rédigée manuellement (drizzle-kit non disponible sur l'hôte Synology). Les nouveaux champs sont nullable pour préserver la compatibilité avec les entrées V1 existantes.

## 5. Comportements hors périmètre

- Pas de cache local des données OpenFoodFacts (pas de base produits locale).
- Pas de suggestion/autocomplétion par nom de produit.
- Pas d'affichage des ingrédients ou allergènes.
- Pas de comparaison de produits.

## 6. Critères de succès

- L'utilisateur peut scanner un code-barres en moins de 3 actions (ouvrir formulaire → clic Scan → scan caméra).
- Les scores nutriscore/nova/greenscore s'affichent dans les 3 secondes suivant le scan (réseau nominal Tailscale).
- Les kcal sont automatiquement calculés quand une quantité est saisie après enrichissement OpenFoodFacts.
- Les entrées dont l'enrichissement a échoué sont identifiables dans l'historique sans ouvrir chaque fiche.
- Les données V1 existantes ne sont pas affectées par la migration.

## 7. Questions ouvertes

| # | Question | Priorité | Condition de résolution |
|---|----------|----------|------------------------|
| OQ-1 | Bibliothèque de scan JS retenue (`@zxing/browser` vs `html5-qrcode` vs autre) — compatibilité Safari iOS à vérifier | Haute | Architecte / spike technique |
| OQ-2 | OpenFoodFacts fournit-il les kcal/100ml pour les produits liquides ? (impact FR-39 unités dl/l) | Moyenne | Vérification lors du spike technique |
| OQ-3 | Indicateur visuel "kcal saisi manuellement" — icône ou texte ? | Basse | Arbitrage à l'implémentation |
