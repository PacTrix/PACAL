# PACAL — Project Context

> Ce fichier est chargé automatiquement par tous les skills BMAD à l'activation.
> Il fournit le contexte projet complet pour éviter de repartir de zéro à chaque session.

---

## Identité du projet

**Nom :** PACAL (Personal Alimentary CALorimeter)
**Objectif :** Application mobile-first de suivi alimentaire personnel, auto-hébergée sur NAS Synology.
**Utilisateur unique :** PAC (usage personnel, non multi-utilisateur)
**Stack :** T3 Stack — Next.js 15 App Router, tRPC, Drizzle ORM, Tailwind CSS v4, PostgreSQL
**Package manager :** pnpm
**Déploiement :** Docker sur NAS Synology DS923+, accès HTTPS via Tailscale

---

## Architecture clé

### Infrastructure
- **NAS Synology DS923+** : héberge le container Docker Next.js + PostgreSQL
- **Tailscale** : VPN mesh + certificat HTTPS Tailscale → URL prod `https://one.tailb67d71.ts.net` (requis pour BarcodeDetector et getUserMedia — Chrome n'expose ces API qu'en secure context)
- **Volume Docker** : `/data/photos` pour les photos, `/data/postgres` pour la DB
- **Pas de drizzle-kit sur le NAS** : migrations SQL manuelles dans `pacal/drizzle/`

### Base de données
- Table principale : `pacal_entry` (snake_case en SQL)
- **Règle Drizzle casing** : `casing: 'snake_case'` insère `_` avant les MAJUSCULES, **pas** avant les chiffres.
  - `kcalPer100g` → `kcal_per100g` (sans underscore avant `100`)
  - `photoPath1` → `photo_path1` (sans underscore avant `1`)
- Migrations actuelles : 0001 (init) → 0002 (V1.1) → 0003 (V1.2) → 0004 (V2, 7 colonnes OFF)

### Schéma V2 complet (migration 0004)
```sql
ALTER TABLE "pacal_entry" ADD COLUMN "barcode" varchar(50);
ALTER TABLE "pacal_entry" ADD COLUMN "nutriscore" varchar(2);
ALTER TABLE "pacal_entry" ADD COLUMN "nova" integer;
ALTER TABLE "pacal_entry" ADD COLUMN "greenscore" varchar(2);
ALTER TABLE "pacal_entry" ADD COLUMN "kcal_per100g" real;
ALTER TABLE "pacal_entry" ADD COLUMN "kcal_per_portion" real;
ALTER TABLE "pacal_entry" ADD COLUMN "of_incomplete" boolean DEFAULT false;
```

### Intégrations externes
- **OpenFoodFacts** : appel côté serveur via tRPC `products.lookup`, AbortController 5s, retourne `null` sur toute erreur
- **BarcodeDetector API** : native Chrome Android 83+, zero bundle. Requiert HTTPS (secure context). Guard : `useState(false)` + `useEffect(() => setCanScan("BarcodeDetector" in window), [])` (évite le mismatch SSR). Bouton toujours affiché, erreur explicite au clic si non supporté ou page en HTTP.

### Conventions code
- Tailwind v4 : couleurs custom via `@theme { --color-brand-orange: #F05C22; --color-brand-marine: #06466D; }`
- Composants : `src/components/features/entry-form/` (formulaires), `src/components/features/entry-history/` (liste)
- tRPC routers : `entries`, `products`, `export`
- Lib utilitaires : `src/lib/kcal.ts` (calcul auto kcal), `src/lib/openfoodfacts.ts` (fetch OFF), `src/lib/pdf.tsx` (rapport PDF)

---

## État du projet (2026-06-28)

### Versions livrées
| Version | Date | Statut |
|---------|------|--------|
| V1.0 | 2026-06-18 | ✅ déployé |
| V1.1 | 2026-06-26 | ✅ déployé |
| V1.2 | 2026-06-28 | ✅ déployé |
| V2 | 2026-06-28 | ✅ déployé (après bug-fixes story 2.6) |
| V2.5 | — | 🔲 backlog |

### Epic 1 — Capturer et restituer ses prises
**Status :** done. Stories 1.1 à 1.19 toutes complètes.
**Rétrospectives :** `epic-1-retro-2026-06-26.md`, `epic-1-v12-retro-2026-06-28.md`

### Epic 2 — Accélérer la saisie par scan et enrichissement nutritionnel
**Status :** in-progress (stories V2 en review, V2.5 en backlog)

| Story | Titre | Statut |
|-------|-------|--------|
| 2.1 | Scan code-barres EAN | review |
| 2.2 | Enrichissement OpenFoodFacts | review |
| 2.3 | Calcul auto kcal selon quantité | review |
| 2.4 | Persistance OFF + badge ⚠ | review |
| 2.5 | Vue détail + rapport PDF | review |
| 2.6 | Corrections post-déploiement V2 | review |
| 2.7 (backlog) | Cible calorique + créneaux horaires | backlog |
| 2.8 (backlog) | Alertes déséquilibre calorique | backlog |

---

## Fonctionnalités V2 (implémentées)

- **BarcodeScanner** : caméra arrière, détection EAN-13/EAN-8 en temps réel, visible uniquement si BarcodeDetector disponible
- **NutriscoreDisplay** : scores X·N·Y colorisés (A/B=vert, C=orange, D/E=rouge / nova 1-2=vert, 3=orange, 4=rouge)
- **Calcul auto kcal** : `computeKcal(qty, unit, kcalPer100g, kcalPerPortion)` — rules g/kg/dl/l/portion ; state `kcalManual` suspend l'auto-calc si saisie manuelle
- **Badge ⚠ historique** : affiché si `ofIncomplete === true && barcode !== null`
- **Export CSV** : 7 colonnes V2 ajoutées (barcode, nutriscore, nova, greenscore, kcal_per100g, kcal_per_portion, of_incomplete)
- **Rapport PDF** : composant `OFFRow` — barcode + scores X·N·Y colorisés via StyleSheet hex

---

## Contexte BMAD

**Méthodologie :** BMAD complète — PRD → Architecture → Epics → Stories → Dev → Review → Retro
**Objectif PAC :** Utiliser PACAL comme cas d'usage vivant pour vendre BMAD à ses clients
**Règle absolue :** Toutes les modifications passent par le workflow BMAD (stories créées, implémentées via `bmad-dev-story`, story files mis à jour)

### Artifacts planning
- `_bmad-output/planning-artifacts/prd-consolidated.md` — PRD V2 consolidé
- `_bmad-output/planning-artifacts/epics.md` — Epic 1 + Epic 2 (V2 + V2.5 backlog)
- `_bmad-output/planning-artifacts/architecture.md` — décisions d'architecture V1→V2

### Artifacts implémentation
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — statut de toutes les stories
- `_bmad-output/implementation-artifacts/stories/` — story files individuels

### Personas actifs
- **Amelia** (Dev) : implémentation stories via `bmad-dev-story`
- **Winston** (Architect) : décisions techniques via `bmad-create-architecture`
- **Alice** (PO) : validation stories et epics
- **John** (PM) : PRD via `bmad-prd`

---

## Prochaines étapes (V2.5 backlog)

1. Rétrospective Epic 2 V2 (`bmad-retrospective`)
2. Stories V2.5 : cible calorique + créneaux horaires + alertes (FR19–FR23)
3. Migration DB à prévoir pour V2.5 : table `settings`
