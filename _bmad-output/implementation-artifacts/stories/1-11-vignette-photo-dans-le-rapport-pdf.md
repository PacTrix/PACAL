# Story 1.11: Vignette photo dans le rapport PDF

---
baseline_commit: b735961c5c33596cfb6dca85503f2d20b0f86195
---

Status: review

## Story

As a utilisateur,
I want voir une vignette des photos dans le rapport PDF,
so that je peux identifier visuellement les prises sans ouvrir l'export séparément (FR-27).

## Acceptance Criteria

1. **Given** que je génère un rapport PDF contenant des entrées avec et sans photo  
   **When** le PDF est rendu  
   **Then** chaque ligne d'entrée présente 3 colonnes : heure | contenu textuel | photo

2. **And** une entrée avec photo affiche une vignette d'environ 2 cm de hauteur dans la colonne droite, avec le ratio d'aspect préservé (pas de déformation)

3. **And** une entrée sans photo laisse la colonne droite vide (pas de placeholder ni d'icône)

4. **And** la vignette ne provoque pas de saut de page intempestif

5. **And** si une photo est référencée en base mais absente du disque, la colonne droite reste vide sans faire planter la génération du PDF

## Tasks / Subtasks

- [x] Task 1 : Mettre à jour les styles dans `src/lib/pdf.tsx` (AC: 1, 2, 3)
  - [x] Ajouter `Image` aux imports `@react-pdf/renderer`
  - [x] Ajouter `import fs from "fs";` pour `fs.existsSync`
  - [x] Supprimer le style `photo` (mention textuelle "Photo jointe" — remplacé par la vignette)
  - [x] Ajouter styles : `entryRow`, `colTime`, `colContent`, `colPhoto`, `thumbnail`
  - [x] Définir `colPhoto` à `width: 57` (≈ 2 cm à 72 dpi : 2 × 28.35 ≈ 56.7, arrondi à 57)

- [x] Task 2 : Refactoriser le layout de chaque entrée en 3 colonnes (AC: 1, 2, 3, 4, 5)
  - [x] Remplacer la structure `entry` → `entryHeader` + `description` + `metrics` + `note` par un `View` row à 3 colonnes
  - [x] Colonne gauche (`colTime`) : heure uniquement
  - [x] Colonne centrale (`colContent`, `flex: 1`) : condition + description + métriques + note (logique identique à V1.0, réindentée)
  - [x] Colonne droite (`colPhoto`) : `Image` si photo présente et fichier existant, `View` vide sinon
  - [x] Supprimer le `Text style={styles.photo}` ("Photo jointe") devenu obsolète

## Dev Notes

### Contexte

Story indépendante de 1.9 et 1.10. Modification localisée dans `src/lib/pdf.tsx` uniquement.

### Fichier à modifier (UPDATE uniquement)

| Fichier | Rôle actuel | Modification |
|---------|-------------|--------------|
| `pacal/src/lib/pdf.tsx` | Génération rapport PDF via @react-pdf/renderer | Refactoring layout 2→3 colonnes + ajout Image vignette |

### État actuel de pdf.tsx — layout entry

Le layout actuel utilise `marginLeft: 40` pour simuler l'indentation sous l'heure :

```
entry (View)
├── entryHeader (View, flexDirection: "row")
│   ├── time (Text, width: 40)          ← heure
│   └── condition (Text)                ← condition
├── description (Text, marginLeft: 40)  ← description
├── metrics (View, marginLeft: 40)      ← poids + calories
├── note (Text, marginLeft: 40)         ← note
└── photo (Text, marginLeft: 40)        ← "Photo jointe" (à supprimer)
```

### Layout cible — 3 colonnes

```
entry (View)
└── entryRow (View, flexDirection: "row", alignItems: "flex-start")
    ├── colTime (View, width: 40)
    │   └── time (Text)
    ├── colContent (View, flex: 1)
    │   ├── condition (Text)
    │   ├── description (Text) [si présent]
    │   ├── metrics (View) [si présent]
    │   └── note (Text) [si présent]
    └── colPhoto (View, width: 57)
        └── Image height: 57, objectFit: "contain" [si photo présente et fichier existant]
            OU View vide [sinon]
```

### Styles à ajouter / modifier

```ts
entryRow: {
  flexDirection: "row",
  alignItems: "flex-start",
},
colTime: {
  width: 40,
},
colContent: {
  flex: 1,
  paddingRight: 4,
},
colPhoto: {
  width: 57,
},
thumbnail: {
  height: 57,
  objectFit: "contain",
},
```

Styles à **supprimer** : `entryHeader`, `time` (width absorbé par `colTime`), `indent`, `description` (marginLeft), `metrics` (marginLeft), `note` (marginLeft), `photo`.

Styles à **conserver** : `page`, `title`, `subtitle`, `dayHeader`, `entry`, `condition`, `metricItem`, `metricLabel`, `metricValue`, `badge`, `badgeMesure`, `footer`.

### Logique d'affichage de la vignette

```tsx
colPhoto (View):
  if (entry.photoPath && fs.existsSync(entry.photoPath)):
    <Image src={entry.photoPath} style={styles.thumbnail} />
  else:
    <View /> {/* cellule vide */}
```

`@react-pdf/renderer` version 3+ accepte un chemin de fichier local absolu dans `src` de `Image` — la génération se fait côté serveur Node.js (route `GET /api/rapport`), l'accès filesystem est direct.

### Calcul des 2 cm en points PDF

1 cm = 28.346 pt  
2 cm = 56.69 pt ≈ **57 pt**

La hauteur `57` est utilisée à la fois pour `colPhoto.width` et `thumbnail.height` — la vignette est dans un carré de 57×57 pt maximum, le ratio d'aspect de la photo est préservé par `objectFit: "contain"`.

### Gestion d'erreur fichier absent (AC: 5)

`fs.existsSync` (synchrone) est acceptable ici car `renderToBuffer` s'exécute en contexte serveur Node.js, pas dans un Worker Edge. Si le fichier est absent, la colonne reste vide — même politique de tolérance que FR-25 pour `fs.unlink`.

**Note :** utiliser `fs` (non-promises) pour `existsSync` plutôt que `fs/promises` — seul `existsSync` synchrone permet le test inline dans le JSX de `@react-pdf/renderer` (qui n'est pas async).

### Restructuration de colContent

Le contenu textuel de la colonne centrale reprend **exactement** la logique V1.0, sans les `marginLeft: 40` (absorbés par la structure de colonnes) :

```tsx
<View style={styles.colContent}>
  <Text style={styles.condition}>{conditionLabel}</Text>
  {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
  {(entry.weightG != null || entry.calories != null) ? (
    <View style={styles.metrics}>
      {/* ... métriques identiques V1.0 ... */}
    </View>
  ) : null}
  {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
</View>
```

Les styles `description`, `metrics`, `note` voient leur `marginLeft: 40` supprimé — ils héritent du positionnement de `colContent`.

### Ce qui NE doit PAS changer

- La fonction `renderRapport` et son export restent identiques (signature inchangée)
- La route `src/app/api/rapport/route.ts` n'est pas modifiée
- Les fonctions utilitaires `formatTime`, `groupByDay`, `capitalize` restent identiques
- Le type `Entry` reste identique
- Toutes les sections du PDF (titre, sous-titre, jours, footer) restent identiques

### References

- [Source: architecture.md — Addendum V1.1 — FR-27] Décision layout 3 colonnes, 57pt, objectFit contain, fs.existsSync non bloquant
- [Source: prd.md §11.3 — FR-27] Colonne photo toujours présente, vide si pas de photo
- [Source: pacal/src/lib/pdf.tsx] Fichier complet à refactoriser — lire avant d'écrire
- [Source: pacal/src/app/api/rapport/route.ts] Route serveur inchangée

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Amelia — bmad-dev-story, 2026-06-26)

### Debug Log References

### Completion Notes List

- ✅ `pdf.tsx` : layout refactorisé en 3 colonnes (entryRow → colTime/colContent/colPhoto)
- ✅ `Image` importé depuis `@react-pdf/renderer`, `fs` (synchrone) importé pour `existsSync`
- ✅ Colonne photo width: 57pt (≈ 2 cm), height: 57pt, objectFit: "contain"
- ✅ Colonne photo toujours rendue (View vide si pas de photo ou fichier absent)
- ✅ `hasPhoto = !!entry.photoPath && fs.existsSync(entry.photoPath)` — tolérant aux fichiers manquants
- ✅ Mention textuelle "Photo jointe" supprimée (style `photo` retiré)
- ✅ Signatures de `RapportPDF` et `renderRapport` inchangées — route `/api/rapport` non modifiée
- ✅ TypeScript clean (pnpm typecheck sans erreur)

### File List

- pacal/src/lib/pdf.tsx (modifié)
