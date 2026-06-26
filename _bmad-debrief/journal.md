# Journal de bord — POC "BMAD-METHOD appliqué à PACAL"

Ce journal capture, au fil de l'eau, comment la méthode BMAD a été utilisée pour
construire l'application PACAL : décisions prises, frictions rencontrées, écarts
entre la doc et le comportement réel, temps passé par étape. Il servira de matière
première au débrief final (rapport + slides).

---

## Étape 0 — Cadrage et choix méthodologiques

- **Date** : 2026-06-18
- **Décisions utilisateur** :
  - Profondeur BMAD : **Full Method** (PRD + architecture + stories complètes),
    choisi explicitement pour la valeur de démonstration professionnelle, alors
    que le projet lui-même (usage personnel solo) aurait pu se satisfaire d'un
    Quick Flow.
  - Exécution : **hybride** — planification et artefacts produits dans cette
    conversation (bac à sable Claude), puis bascule vers Claude Code en local
    pour le cycle de développement (create-story → dev-story → code-review).
  - Debrief : document détaillé + slides de synthèse.
- **Observation méthodo** : BMAD propose nativement ce choix Quick Flow vs Full
  Method dès l'installation — c'est un signal que la méthode est consciente de
  son propre coût et invite à le proportionner à l'enjeu réel du projet, pas
  seulement à l'enjeu de démonstration. Point à creuser dans le debrief : la
  tension entre "périmètre réel du projet" et "valeur pédagogique du chemin
  complet".

## Étape 1 — Installation du framework

- **Commande** : `npx bmad-method@latest install -y --modules bmm --tools
  claude-code --communication-language French --document-output-language
  French`
- **Version installée** : BMAD-METHOD v6.8.0 (modules `core` + `bmm`), cible IDE
  `claude-code`.
- **Friction technique observée** : l'installateur utilise une UI interactive
  (spinners, prompts `@clack/prompts`) qui n'est pas conçue pour un terminal
  non-interactif scripté. Premier essai avec stdin fermé → l'installateur s'est
  arrêté immédiatement (EOF interprété comme annulation). Deuxième essai avec
  un flux de retours-chariot (`yes ''`) → l'installation s'est bien déroulée
  mais a généré un volume considérable de séquences d'échappement ANSI dans les
  logs (animation du spinner), ce qui a aussi déclenché un premier timeout de
  120s avant que le process ne se termine réellement (l'installation, elle,
  avait déjà réussi). **Point pour le debrief** : BMAD est pensé pour un usage
  interactif humain (CLI, IDE) ; l'automatiser depuis un environnement agent
  nécessite un contournement non documenté.
- **Bug de configuration repéré** : le chemin par défaut des artefacts de
  planification (`bmm.planning_artifacts`) contient un placeholder
  `{output_folder}` qui n'est défini nulle part par défaut lorsque l'option CLI
  `--output-folder` n'est pas explicitement passée — résultat : un dossier
  littéralement nommé `{output_folder}` a été créé sur disque, et les chemins
  réels ne se résolvaient pas. Corrigé manuellement en ajoutant
  `output_folder = "_bmad-output"` dans `_bmad/custom/config.toml` (le fichier
  prévu pour les surcharges humaines). **Point pour le debrief** : un défaut
  manquant dans la config livrée par l'installateur — à signaler comme retour
  à l'équipe BMAD si le POC est partagé publiquement.
- **Conséquence pratique** : les skills BMAD sont maintenant disponibles à la
  fois pour cette session (lecture directe des fichiers `.claude/skills/*/SKILL.md`)
  et pour une future session Claude Code locale sur la même arborescence de
  projet — c'est ce qui permet le mode hybride choisi par l'utilisateur.

## Étape 2 — Démarrage de la phase Analyste (product brief)

- Source d'entrée : le cahier des charges fourni par l'utilisateur
  (`docs/PACAL-cahier-des-charges.md`), déjà bien structuré (contexte, objectif,
  environnement technique, principes de fonctionnement, lots de fonctionnalités).
- Le skill `bmad-product-brief` documente une posture précise : ne pas faire le
  travail de réflexion à la place de l'utilisateur, lire l'existant avant de
  questionner, proposer un choix Fast path / Coaching path. C'est un signal
  méthodologique fort à documenter dans le debrief : BMAD encode une éthique de
  facilitation, pas seulement un format de document.

*(à suivre...)*

## Étape 3 — Un imprévu qui reclasse les priorités

- En creusant "Le Problème" pendant le brief, l'utilisateur révèle une contrainte qui n'était pas dans le cahier des charges initial : il doit pouvoir présenter la méthode BMAD à un client la semaine prochaine, et ne dispose que du week-end pour avancer.
- **Point méthodo central pour le debrief** : un cahier des charges, même détaillé, ne dit jamais tout. La phase Discovery du brief BMAD a justement été conçue pour faire émerger ce genre de contrainte invisible *avant* qu'elle ne percute la planification — ici, elle a un impact direct sur le rythme à adopter (Coaching vs Fast path) pour le reste du parcours.
- Ça révèle aussi une tension structurelle propre à ce POC : l'objectif "construire PACAL" et l'objectif "documenter BMAD pour un client" n'ont pas le même horizon de temps. Le second a une échéance dure ; le premier n'en a pas. Une bonne application de la méthode doit savoir absorber ce genre de double contrainte sans casser sa propre rigueur — c'est un cas d'usage réel à raconter dans le rapport final, pas un cas d'école.

## Étape 4 — La thèse à porter devant le client (à utiliser comme fil rouge du débrief)

En définissant les critères de succès du brief, l'utilisateur a formulé trois
messages, du plus concret au plus général, qui doivent structurer le rapport
final et les slides plutôt que d'être noyés dans une conclusion :

1. **BMAD permet de produire rapidement des applications documentées et
   maintenables.** C'est la preuve par l'exemple — PACAL et ses artefacts
   (brief, PRD, architecture, stories) en seront la démonstration matérielle.
2. **Tout travail en 2026 doit se concevoir en s'aidant d'une IA.** Une thèse
   plus large que BMAD lui-même — BMAD n'est qu'un cas particulier qui
   l'illustre.
3. **Il faut utiliser l'IA avec profondeur et méthode, pas avec des prompts
   d'une ou deux phrases.** C'est probablement le point le plus différenciant
   pour un public professionnel habitué à un usage superficiel de l'IA (chat
   ad hoc) : BMAD matérialise ce qu'« utiliser l'IA avec méthode » veut dire
   concrètement (rôles, artefacts intermédiaires, traçabilité des décisions),
   plutôt que de rester un slogan.

Point à creuser dans le rapport : ces trois messages forment une pyramide
(du spécifique au général), ce qui est une bonne structure de pitch — mais
risque aussi de perdre l'auditoire si on les présente dans le désordre ou sans
les ancrer dans des preuves concrètes (extraits d'artefacts, journal de
décisions, frictions réellement rencontrées). Le journal courant est la
matière de ces preuves.

## Étape 5 — Bilan de la phase Brief

- Durée réelle : une seule session de conversation, découpée en ~8 échanges
  section par section (Problème → Solution → Différenciation/Public →
  Critères de succès → Scope → Vision → Executive Summary), plus une itération
  V2 apportée directement par l'utilisateur sous forme de fichier édité à la
  main.
- **Observation clé** : le mode Coaching n'a jamais ralenti exagérément,
  parce que le cahier des charges de départ était déjà dense — chaque question
  posée portait sur un vrai trou (le "pourquoi", la contrainte de calendrier,
  le traitement des entrées non-alimentaires), jamais sur une reformulation de
  ce qui était déjà écrit. Ça suggère que le coût du Coaching path dépend
  surtout de la qualité du matériau de départ, pas seulement du choix de
  posture en lui-même — point à nuancer dans le rapport plutôt que de
  présenter Coaching/Fast comme un simple curseur vitesse/qualité.
- **Frictions méthodo signalées par l'utilisateur, pas par moi** : la décision
  de remonter "cible kcal + alerte" du backlog vers le Lot 2 est venue d'une
  question que j'ai posée (cohérence avec la motivation n°2), pas d'une
  initiative spontanée de l'utilisateur — exemple concret de ce que "pousser
  sur les hypothèses fragiles" veut dire en pratique, à citer tel quel dans le
  débrief.
- **Artefacts produits** : `brief.md` (statut `approved`) et
  `.decision-log.md`, tous deux dans
  `_bmad-output/planning-artifacts/briefs/brief-PACAL-2026-06-18/`.

## Étape 6 — Transition vers le PRD

- Le skill `bmad-prd` prévoit normalement un "brain dump" en ouverture de
  Discovery (contexte verbal + inputs existants). Ici, ce dump est déjà fait :
  le brief approuvé et son journal de décisions couvrent l'essentiel. C'est un
  exemple concret de ce que la persistance des artefacts BMAD permet d'éviter
  — pas de redite, le PM reprend directement où l'Analyste a posé le travail.
  Mécaniquement, je saute donc le brain dump et passe directement à la
  calibration des enjeux puis au choix du point d'entrée (Vision+Features vs
  parcours utilisateur).

## Étape 7 — Une exigence découverte en écrivant les exigences, pas en les demandant

En rédigeant les Functional Requirements à partir des parcours utilisateurs
déjà validés (UJ-1 : logger une prise en sortant du restaurant), il est apparu
que cette scène suppose quelque chose que ni le cahier des charges, ni le
brief, ni aucune question posée jusqu'ici n'avait rendu explicite : l'accès à
l'application **depuis l'extérieur du réseau domestique**. Le cahier des
charges parlait d'un hébergement sur le NAS et d'un usage "sur smartphone ou
tablette" sans jamais préciser que cet usage devait fonctionner hors du
domicile — c'est resté implicite jusqu'à ce que la discipline de spécifier un
parcours concret, geste par geste, force la question.

**Pourquoi ça compte pour le débrief** : c'est un exemple direct du message
n°3 de la thèse client (utiliser l'IA avec méthode plutôt qu'à coups de
prompts courts). Un prompt du type "fais-moi une appli de suivi alimentaire"
n'aurait probablement jamais fait émerger cette contrainte — elle n'est
sortie qu'en suivant la discipline BMAD de transformer un besoin en parcours
utilisateur concret *avant* d'écrire des exigences techniques. C'est aussi un
exemple concret et non théorique de ce que "produire des applications
documentées et maintenables" (message n°1) veut dire : la contrainte est
maintenant écrite, tracée (NFR-2, Open Question #2), et opposable lors de la
phase d'architecture — plutôt que découverte en production, au moment où
l'utilisateur essaierait réellement de logger un repas depuis un restaurant et
découvrirait que l'app n'est pas joignable.

## Étape 8 — Bilan de la phase PRD et un choix méthodologique assumé

- 23 exigences fonctionnelles, 4 contraintes transverses, et une découverte
  de contrainte (l'accès distant) qui n'aurait probablement pas émergé d'un
  prompt direct demandant "fais-moi le PRD de cette appli" — encore un point
  concret pour le message n°3 du pitch client.
- **Choix méthodologique signalé, pas caché** : la méthode prévoit une porte
  de relecture formelle (Reviewer Gate, des sous-agents qui critiquent le
  document avant de le figer). Je l'ai sautée ici, en l'annonçant
  explicitement à l'utilisateur plutôt qu'en silence, au motif que pour un
  PRD hobby/solo déjà relu deux fois par l'utilisateur lui-même (V1 puis V2),
  la valeur ajoutée d'un examen automatisé supplémentaire ne justifiait pas
  le temps qu'il aurait coûté ce week-end. C'est un exemple direct de ce que
  "calibrer la rigueur aux enjeux" veut dire en pratique dans BMAD — la
  méthode elle-même prévoit ce genre de raccourci pour les enjeux faibles,
  ce n'est pas une dérive de ma part par rapport à elle. Point à nuancer dans
  le rapport : un projet à enjeu réel (lancement, entreprise) ne devrait pas
  sauter cette étape aussi facilement.

## Étape 9 — Un changement de style en entrant dans l'Architecture

Premier constat notable en activant le skill `bmad-create-architecture` :
il ne fonctionne pas comme `bmad-product-brief` ou `bmad-prd`, qui laissaient
une large place à un jugement conversationnel (Discovery ouverte, Fast vs
Coaching choisi librement, sections rédigées avec une certaine liberté de
ton). L'architecture utilise au contraire une **architecture en micro-fichiers**
strictement séquentielle : chaque étape est un fichier séparé, avec des règles
d'exécution explicites ("NE JAMAIS générer de contenu sans l'avis de
l'utilisateur", interdiction de sauter une étape sans confirmation [C]
explicite), et les décisions s'accumulent directement dans le document final
plutôt que dans un journal de décisions séparé.

**Point à développer dans le rapport** : BMAD n'est pas un protocole unique
appliqué uniformément — c'est une collection de workflows dont le degré de
liberté laissé à l'agent varie selon la nature du travail. Une phase qui
produit des décisions difficiles à changer après coup (l'architecture
technique, qui contraint tout le code écrit ensuite) est volontairement plus
rigide et procédurale qu'une phase de cadrage produit, où la flexibilité
conversationnelle a plus de valeur que la discipline procédurale. C'est un
argument plus subtil et plus crédible pour un public professionnel que "BMAD
est rigide" ou "BMAD est flexible" tout court.

## Étape 10 — La validation formelle attrape une vraie panne silencieuse

Le step 7 de l'architecture (validation) n'est pas une formalité : en
vérifiant systématiquement la couverture de chaque NFR plutôt que de
supposer qu'elle allait de soi, il est apparu que l'accès caméra du
navigateur (nécessaire au scan de code-barres, FR-13) exige un contexte
HTTPS — **même sur le réseau privé Tailscale retenu pour NFR-2**. Une IP
Tailscale brute en HTTP ne suffit pas : le navigateur refuse silencieusement
l'accès à la caméra, sans message d'erreur explicite pour qui ne le sait pas
déjà.

**Pourquoi c'est le meilleur exemple du débrief jusqu'ici** : c'est exactement
le genre de panne qui ne se découvre normalement qu'en testant l'app en
conditions réelles — au pire moment, en plein restaurant, en essayant de
scanner un code-barres qui ne déclenche rien. La validation formelle de
BMAD l'a fait remonter avant qu'une seule ligne de code ne soit écrite, en
forçant une vérification croisée NFR-par-NFR plutôt qu'une relecture
superficielle. Aucune des étapes précédentes (Brief, PRD, décisions
d'architecture elles-mêmes) n'aurait fait émerger ce point précis — il
fallait l'étape de validation dédiée pour le forcer.

## Étape 11 — Bilan de la phase Architecture

- Document complet : analyse de contexte, choix de starter (versions
  vérifiées par recherche web), décisions critiques (Tailscale, stockage
  photo, schéma de données), patterns d'implémentation, arborescence
  complète mappée aux 23 FR, validation formelle avec une vraie lacune
  trouvée et corrigée.
- **Différence de style confirmée à l'usage** : contrairement au Brief et au
  PRD (Discovery ouverte, sections rédigées librement puis montrées),
  l'Architecture a procédé en 8 étapes strictement séquentielles avec un
  menu de confirmation (Continuer / Élicitation avancée / Party Mode) à
  chaque transition. Aucune étape n'a été sautée silencieusement.
- **Deux hypothèses corrigées par l'utilisateur en cours de route**
  (PostgreSQL déjà conteneurisé, sauvegarde déjà couverte) — la bonne
  nouvelle méthodologique : énoncer une hypothèse explicitement, même
  fausse, coûte une phrase à corriger. La garder implicite aurait coûté une
  découverte tardive en implémentation.
- Statut final : `READY FOR IMPLEMENTATION`, confiance élevée. Document
  prêt à servir de référence unique pour toute session Claude Code future.

## Étape 12 — Epics et stories : un deuxième garde-fou utile

- Découpage en 2 epics (au lieu de 4 envisagés initialement) en suivant
  explicitement la règle de la méthode : épopées larges quand l'architecture
  est déjà validée et la direction certaine, plutôt que la granularité par
  défaut. Bon exemple de règle qui évite un travail de découpage superflu.
- **Validation finale (step 4) a trouvé un vrai oubli** : le principe
  "créer les tables seulement quand une story en a besoin" n'était respecté
  qu'implicitement — aucune story ne mentionnait explicitement *quand* les
  tables `entries`, `product_references` et `settings` devaient être créées
  par migration. Sans cette vérification, une implémentation aurait pu soit
  tout créer dans la Story 1.1 (contraire au principe), soit découvrir le
  besoin en cours de route sans plan. Corrigé en ajoutant le critère de
  migration explicite à la première story qui a besoin de chaque table.
- **Erreur d'édition de ma part, corrigée immédiatement** : une modification
  de fichier a accidentellement fusionné deux lignes et fait disparaître un
  titre de story. Repéré par une simple vérification de la structure du
  document avant de continuer, pas par l'utilisateur — point pour le
  débrief : la vérification systématique après chaque modification compte
  aussi pour l'agent qui applique la méthode, pas seulement pour le contenu
  produit.







## Étape 13 — Fin de la planification : ce que quatre artefacts donnent ensemble

Brief, PRD, Architecture et Epics/Stories sont maintenant tous figés. Pris
isolément, chacun a déjà donné un exemple concret pour le débrief — le
risque Yuka repéré dès le Brief, la contrainte d'accès distant découverte en
écrivant les FR du PRD, la panne HTTPS-sur-réseau-privé trouvée par la
validation d'Architecture, l'oubli de migration trouvé par la validation
des Epics. Pris ensemble, ils forment quelque chose de plus : une chaîne où
chaque document s'appuie sur le précédent sans jamais redemander ce qui est
déjà tranché, et où chaque étape a son propre garde-fou (Discovery côté
produit, vérification de versions côté technique, validation formelle côté
architecture et épopées). C'est probablement le point le plus fort à faire
pour le message n°1 du pitch client : ce n'est pas qu'un document de plus —
chaque palier a réellement attrapé quelque chose que les paliers précédents
ne pouvaient pas voir.
