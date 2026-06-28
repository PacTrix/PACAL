# PACAL avec BMAD : un cycle complet, de la V1.0 à la V1.1

*Document de travail pour préparer un retour d'expérience devant une équipe de chefs de projet et de développeurs. Tous les exemples ci-dessous sont réels, tirés du projet PACAL — aucun n'est théorique.*

---

## 1. Le projet en une phrase

PACAL est une application de suivi alimentaire auto-hébergée, conçue et développée avec BMAD-METHOD, en deux temps :
- **V1.0** : cycle complet Brief → PRD → Architecture → Epics → Stories → Implémentation, sur un projet parti de zéro (Epic 1, 8 stories). Déployée sur un NAS Synology, utilisée en conditions réelles.
- **V1.1** : un mois plus tard, trois correctifs issus de l'usage réel — affichage de version, suppression/duplication d'entrée, vignette photo dans le rapport PDF. Même cycle BMAD, rejoué sur un projet existant.

C'est ce deuxième cycle — la **maintenance**, pas la création — qui apporte la preuve la plus intéressante : BMAD ne sert pas qu'à démarrer un projet, il tient sur la durée.

---

## 2. Le message central

> **BMAD ne produit pas seulement du code. Il produit la trace de pourquoi ce code existe — et cette trace reste vérifiable longtemps après que le code a été écrit.**

Sur un projet "normal" développé avec un assistant IA en mode conversationnel, on obtient du code qui marche, mais la justification des choix vit dans une conversation qui se perd. Sur PACAL, six mois plus tard, n'importe qui peut répondre à :
- Pourquoi cette fonctionnalité existe (→ remonter au PRD, à la story utilisateur)
- Pourquoi elle a été implémentée *de cette façon précise* (→ remonter à l'architecture, qui documente aussi les alternatives écartées)
- Si le comportement actuel correspond à ce qui a été décidé (→ comparer architecture, story, et code)

C'est cette dernière capacité — **vérifier**, pas seulement documenter — qui a eu un effet concret pendant la V1.1.

---

## 3. Preuve à l'appui : une divergence détectée et corrigée

Pendant la V1.1, le PRD décrivait la duplication d'une entrée comme l'ouverture d'un formulaire pré-rempli. Le code livré, lui, crée l'entrée immédiatement, sans formulaire intermédiaire — un choix que l'architecte avait documenté et justifié (l'alternative formulaire était jugée trop fragile : encodage des valeurs en paramètres d'URL).

Le PRD n'avait simplement pas été mis à jour après cette décision d'architecture.

**Ce qui rend ça intéressant** : cette divergence n'a pas été trouvée en testant l'application, mais en comparant trois documents écrits à des moments différents par des "rôles" différents (PM, puis Architecte). C'est exactement le genre d'incohérence qui, sur un projet sans cette discipline documentaire, ne serait jamais détectée — ou seulement quand un utilisateur se plaindrait que "la doc ne dit pas ça".

**Et la boucle a été refermée** : le PRD a été corrigé, et la correction elle-même est tracée dans le journal de décisions, datée, avec son origine expliquée. La documentation n'est pas un instantané figé à la livraison — elle reste vivante et corrigible.

---

## 4. Preuve à l'appui : une rétrospective qui capitalise vraiment

La rétrospective de fin de cycle (`epic-1-retro`) ne se contente pas de dire "tout va bien". Elle liste cinq pièges d'outillage rencontrés pendant l'implémentation, avec pour chacun la manifestation concrète et le correctif :

| Piège rencontré | Conséquence si non documenté |
|---|---|
| Une variable d'environnement mal placée dans `docker-compose.yml` (code mort trompeur) | Aurait pu être réintroduite à la prochaine modification du fichier |
| `fs.existsSync` doit être synchrone dans le contexte de rendu PDF (la version asynchrone ne fonctionne pas) | Le prochain développeur — humain ou IA — aurait perdu du temps à redécouvrir la même contrainte |
| Un `<button>` imbriqué dans un `<Link>` (HTML invalide) | Aurait pu être recopié comme pattern dans une future liste |

Un bug a même été **détecté en revue de code avant la production** : des variables `NEXT_PUBLIC_*` placées dans la section `environment` de `docker-compose.yml`, alors qu'elles doivent être disponibles au moment du *build* et non du *run*. Sans effet réel, mais qui aurait pu faire croire que la fonctionnalité marchait alors qu'elle n'était câblée qu'à moitié.

Rien de spectaculaire individuellement — mais c'est exactement le type de connaissance qui s'évapore d'habitude.

---

## 5. Ce que BMAD impose, concrètement, à chaque story

Chaque story de la V1.1 (1.9, 1.10, 1.11) suit la même structure, et chacune contient :

- Un identifiant de **commit de référence** (`baseline_commit`), pour savoir sur quel état du code la story a été écrite
- Des **critères d'acceptation** formulés en Given/When/Then, donc testables sans ambiguïté
- L'**état du code avant** modification, décrit explicitement (pas supposé)
- Les **fichiers à modifier**, listés à l'avance — et seulement ceux-là
- Une section "**ce qui ne doit pas changer**" — une liste négative, aussi importante que la liste positive
- Des **références croisées** vers le PRD et l'architecture, avec le numéro de section exact
- En fin de story, les **notes de complétion** et la liste réelle des fichiers modifiés, remplie après coup

Ce format, répété identiquement sur les 11 stories du projet (V1.0 et V1.1 confondues), est ce qui permet la comparaison systématique qu'on a faite plus haut. Sans ce format, il n'y a rien à comparer.

---

## 6. Les deux limites honnêtes à mentionner

Un bon REX inclut ce qui n'a pas bien fonctionné — ça renforce la crédibilité du reste.

**a) BMAD vit dans l'outil, pas dans le projet.**
Le dossier `_bmad/` du repo ne contient que de la *configuration* (langue de sortie, chemins des artefacts, agents personnalisés) — pas les fichiers de définition des workflows eux-mêmes. Ceux-ci sont installés au niveau de l'éditeur (ici, Claude Code), pas versionnés avec le code. Conséquence concrète vécue sur ce projet : une tentative de rejouer un "workflow BMAD" depuis une interface de chat générique a échoué, parce que les fichiers réels n'étaient simplement pas accessibles depuis cet environnement. **BMAD suppose un outil compatible** (ici Claude Code) — ce n'est pas qu'un ensemble de documents qu'on peut suivre à la main.

**b) La discipline documentaire a un coût, et elle ne s'applique pas toute seule.**
La divergence sur FR-26 (section 3) montre que même avec BMAD, une mise à jour peut être oubliée. La traçabilité ne *garantit* pas la cohérence : elle la rend *détectable*. Quelqu'un doit encore faire l'effort de relire et de corriger — ce qui s'est produit ici, mais qui suppose une vigilance, pas un mécanisme automatique.

---

## 7. Pour la suite (Epic 2)

La rétrospective V1.1 a explicitement préparé l'Epic 2 (scan code-barres, intégration OpenFoodFacts/Yuka) :
- Liste des prérequis techniques à vérifier avant de démarrer (HTTPS Tailscale actif sur le NAS, faisabilité Yuka à investiguer)
- Confirmation qu'aucune décision d'architecture de la V1.0/V1.1 n'a besoin d'être remise en cause
- Une question ouverte assumée comme telle (faisabilité Yuka), pas masquée

C'est un autre angle utile pour le REX : BMAD ne se contente pas de clore un cycle, il **amorce explicitement le suivant**, avec ses inconnues déjà nommées.

---

## 8. Pistes de structure pour les slides

Quelques angles possibles, à toi de choisir ce qui résonne avec ton audience :

1. **Le problème que ça résout** : sur un projet IA "classique", la justification des choix se perd dans l'historique du chat. Ici, elle est dans le repo, à côté du code.
2. **La preuve par la maintenance** (pas par la création) : n'importe qui peut faire un beau cycle one-shot. La vraie preuve, c'est de le rejouer un mois plus tard sur un projet qui tourne déjà — et qu'il reste cohérent.
3. **Le moment "aha"** : montrer en direct (ou en capture) la divergence FR-26 trouvée puis corrigée. C'est concret, ça ne ment pas, et ça montre que la traçabilité n'est pas un argument marketing mais un outil de travail réel.
4. **Le contre-exemple honnête** : la limite "BMAD vit dans l'outil" évite de vendre BMAD comme une solution magique applicable n'importe où.
5. **La trace chiffrée** : 11 stories, 3 commits, 1 divergence détectée et corrigée, 5 pièges documentés — des chiffres simples, vérifiables, qui ancrent le propos.
