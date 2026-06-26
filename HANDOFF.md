# PACAL — reprise en local avec Claude Code

Ce projet contient la planification BMAD complète (Brief → PRD →
Architecture → Epics/Stories), prête à être implémentée.

## Pour démarrer

1. Décompresse cette archive dans le dossier où tu veux développer PACAL
   (par exemple `~/dev/pacal`).
2. Ouvre ce dossier avec Claude Code (`claude` en ligne de commande, ou
   l'app desktop/mobile pointée sur ce dossier).
3. Les skills BMAD sont déjà installés dans `.claude/skills/` — Claude Code
   les détectera automatiquement, exactement comme dans cette conversation.

## Où sont les choses

- `docs/PACAL-cahier-des-charges.md` — le cahier des charges d'origine.
- `_bmad-output/planning-artifacts/briefs/.../brief.md` — brief produit (approuvé).
- `_bmad-output/planning-artifacts/prds/.../prd.md` — PRD (final, 23 FR + 4 NFR).
- `_bmad-output/planning-artifacts/architecture.md` — décisions d'architecture (complet, READY FOR IMPLEMENTATION).
- `_bmad-output/planning-artifacts/epics.md` — 2 epics, 13 stories prêtes au développement.
- `_bmad-debrief/` — le journal de bord pour ton débrief BMAD, inclus ici
  pour ton usage. Si tu mets PACAL sous git, ajoute ce dossier au
  `.gitignore` plutôt que de le livrer avec le code — ce n'est pas un
  artefact du projet, c'est la matière de ton rapport client.

## Première chose à faire avant tout code

**Activer Tailscale et les certificats HTTPS sur le NAS** (Story 1.2) —
c'est un prérequis d'infrastructure, pas une story de code. Sans ça, le
scan de code-barres (Epic 2) échouera silencieusement plus tard, même si
tout le reste fonctionne.

## Pour lancer le développement

Dans Claude Code, tu peux simplement dire quelque chose comme :

> "Continue le projet PACAL : initialise-le avec le starter T3 défini dans
> l'architecture (Story 1.1), puis enchaîne sur les stories suivantes."

Les skills `bmad-sprint-planning` (pour initialiser le suivi),
`bmad-create-story` (pour détailler une story avant de coder),
`bmad-dev-story` (pour implémenter) et `bmad-code-review` (pour relire)
devraient s'enclencher automatiquement au fil de la conversation — comme
les skills de planification l'ont fait ici.

## Si quelque chose ne colle pas en cours de route

Le réflexe BMAD : ne pas improviser une nouvelle convention, mais corriger
`architecture.md` ou `epics.md` directement, et continuer. Le
`.decision-log.md` de chaque phase de planification garde la trace du
raisonnement si tu veux comprendre pourquoi une décision a été prise.
