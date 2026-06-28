---
id: "1.19"
title: "Charte graphique et logo"
status: "done"
epic: "Epic 1 — V1.2"
fr: ["FR-35"]
dependencies: []
---

# Story 1.19 : Charte graphique et logo

## User Story

As a utilisateur,
I want retrouver une identité visuelle cohérente avec ma palette de couleurs et mon logo,
So que l'application soit reconnaissable et agréable à utiliser (FR-35).

## Contexte

**Palette définie :**
- Titres (h1–h3, labels de section, noms de champs) : `#F05C22` (orange)
- Textes courants et saisies : `#06466D` (bleu marine)

**Logo :** fichier fourni par l'utilisateur, à placer dans `pacal/public/logo.png`.

**Emplacements du logo :**
- En-tête de l'application (à côté du titre "PACAL"), sur toutes les pages.
- En-tête du rapport PDF (`RapportPDF`).

## Acceptance Criteria

**Given** que je navigue sur n'importe quelle page de l'application
**When** la page se charge
**Then** les titres (h1–h3, labels de section) s'affichent en `#F05C22`
**And** les textes courants, valeurs de champs, et placeholders s'affichent en `#06466D`
**And** le logo est visible dans l'en-tête à côté du titre "PACAL"

**Given** que je génère un rapport PDF
**When** le PDF est rendu
**Then** le logo est affiché en en-tête du document PDF, à côté ou au-dessus du titre du rapport

**And** dans tous les cas, l'application reste lisible (contraste suffisant sur fond blanc)

## Notes d'implémentation

### Fichier logo
- Copier le logo fourni dans `pacal/public/logo.png`.
- Format recommandé : PNG avec transparence (le fond circulaire est blanc/transparent).
- Dans l'en-tête web : `<Image src="/logo.png" alt="PACAL" width={40} height={40} />` (Next.js Image).

### Couleurs Tailwind
Déclarer les couleurs custom dans `tailwind.config.ts` (ou `tailwind.config.js`) :
```ts
theme: {
  extend: {
    colors: {
      brand: {
        orange: '#F05C22',
        marine: '#06466D',
      }
    }
  }
}
```
Utiliser `text-brand-orange` pour les titres, `text-brand-marine` pour les textes/inputs.

### Rapport PDF
Dans `RapportPDF` (composant `@react-pdf/renderer`) :
- Ajouter une `<Image src="..." />` en en-tête — nécessite de passer le chemin absolu du fichier logo au composant (lu côté serveur dans `/api/rapport`).
- Appliquer les couleurs `#F05C22` et `#06466D` aux styles du PDF (`StyleSheet.create`).

### Scope
- Appliquer la charte à toutes les pages existantes : `/`, `/historique`, `/entrees/[id]`, `/export`, `/rapport`, `/a-propos` (Story 1.16).
- Priorité : l'en-tête (logo + couleur du titre PACAL) en premier, puis les pages dans l'ordre d'importance UX.

## Implémentation réelle (2026-06-28)

**Fichiers modifiés :**
- `src/styles/globals.css` — variables Tailwind v4 dans `@theme { --color-brand-orange: #F05C22; --color-brand-marine: #06466D; }`
- `src/components/ui/Nav.tsx` — titre PACAL en `text-brand-orange`, liens actifs en `text-brand-orange`, logo `<Image>` ajouté
- `src/app/page.tsx` — titre en `text-brand-orange`
- `src/lib/pdf.tsx` — couleurs hex appliquées au `StyleSheet`, logo chargé depuis `public/logo.png`

**Note Tailwind v4 :** la syntaxe `tailwind.config.ts` avec `extend.colors` n'est plus utilisée en v4. Les couleurs custom se définissent dans le CSS via `@theme`, utilisables comme classes utilitaires (`text-brand-orange`, `bg-brand-marine`). C'est un écart par rapport aux notes d'implémentation du plan.

**Logo côté PDF :** `LOGO_PATH = path.join(process.cwd(), 'public', 'logo.png')` avec `fs.existsSync()` — le PDF se génère normalement si le fichier est absent (dégradé gracieux).

**Statut logo :** le logo a été partagé par l'utilisateur comme image inline dans la conversation. Il doit être copié manuellement par l'utilisateur dans `pacal/public/logo.png`. La Nav et le PDF dégradent gracieusement si le fichier est absent.

**Validation :** TypeScript ✓, build ✓, testé en production (couleurs visibles sur mobile et desktop). Logo non encore déployé (copie manuelle requise par l'utilisateur).

### Pré-requis
- L'utilisateur doit fournir le fichier logo (partagé dans la conversation, à sauvegarder manuellement dans `pacal/public/logo.png`).
