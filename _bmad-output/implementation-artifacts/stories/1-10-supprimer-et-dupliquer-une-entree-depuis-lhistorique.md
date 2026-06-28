# Story 1.10: Supprimer et dupliquer une entrée depuis l'historique

---
baseline_commit: b735961c5c33596cfb6dca85503f2d20b0f86195
---

Status: review

## Story

As a utilisateur,
I want pouvoir supprimer une entrée erronée ou en dupliquer une pour réutiliser son contenu,
so that je peux corriger mon historique et accélérer la saisie d'entrées similaires (FR-25, FR-26).

## Acceptance Criteria

**Suppression (FR-25) :**

1. **Given** que je suis sur la vue historique  
   **When** je choisis de supprimer une entrée  
   **Then** une confirmation explicite m'est demandée avant la suppression

2. **And** après confirmation, l'entrée disparaît de l'historique, des exports et des rapports

3. **And** la photo associée (si elle existe) est également supprimée du volume `data/photos/`

**Duplication (FR-26) :**

4. **Given** que je suis sur la vue historique  
   **When** je choisis de dupliquer une entrée  
   **Then** une nouvelle entrée est créée immédiatement avec les mêmes valeurs (description, poids, calories, condition, note)

5. **And** l'horodatage de la nouvelle entrée est celui de l'instant de la duplication (pas celui de l'entrée source)

6. **And** la photo de l'entrée source n'est pas copiée — `photoPath` est null sur la nouvelle entrée

7. **And** l'entrée source reste inchangée

8. **And** la liste se rafraîchit après la suppression ou la duplication

## Tasks / Subtasks

- [x] Task 1 : Ajouter `entries.delete` dans le routeur tRPC (AC: 2, 3)
  - [x] Nouvelle procédure `delete` dans `src/server/api/routers/entries.ts`
  - [x] Input : `z.object({ id: z.number() })`
  - [x] Récupérer l'entrée pour obtenir `photoPath` avant suppression
  - [x] Si `photoPath` non null et fichier existant : `fs.unlink` (non bloquant si absent — log warning, pas d'erreur)
  - [x] Supprimer la ligne en base avec Drizzle (`db.delete(entries).where(eq(entries.id, input.id))`)
  - [x] `TRPCError NOT_FOUND` si l'entrée n'existe pas

- [x] Task 2 : Modifier `EntryList.tsx` — ajouter les actions sur chaque carte (AC: 1, 2, 4, 5, 6, 7, 8)
  - [x] Chaque `<li>` présente : lien vers édition (existant) + bouton Supprimer + bouton Dupliquer
  - [x] Bouton Supprimer : appelle `entries.delete.useMutation()` avec `window.confirm` avant la mutation
  - [x] Bouton Dupliquer : appelle `entries.create.useMutation()` avec les valeurs de l'entrée source et `timestamp: new Date()`
  - [x] Les deux mutations invalident `entries.list` après succès (`utils.entries.list.invalidate()`)
  - [x] Pendant la mutation en cours : boutons désactivés ou indicateur discret (éviter double-clic)

## Dev Notes

### Contexte

Story indépendante de 1.9 et 1.11 — peut être implémentée dans n'importe quel ordre.

### Fichiers à modifier (UPDATE uniquement)

| Fichier | Rôle actuel | Modification |
|---------|-------------|--------------|
| `pacal/src/server/api/routers/entries.ts` | CRUD entrées (list, getById, create, update) | Ajout de la procédure `delete` |
| `pacal/src/components/features/entry-history/EntryList.tsx` | Liste des entrées avec lien vers édition | Ajout boutons Supprimer et Dupliquer sur chaque carte |

### État actuel de EntryList.tsx

Chaque entrée est un `<Link href={/entrees/${entry.id}}>` qui enveloppe toute la carte. **Problème de structure :** un `<button>` imbriqué dans un `<a>` est invalide HTML. La carte existante doit être restructurée pour séparer la zone cliquable (lien vers édition) des boutons d'action.

**Restructuration recommandée :**

```tsx
<li key={entry.id} className="flex items-stretch gap-1 rounded-lg border border-gray-200">
  {/* Zone principale — lien vers édition */}
  <Link href={`/entrees/${entry.id}`} className="flex-1 flex flex-col gap-0.5 px-4 py-3 hover:bg-gray-50">
    {/* ... contenu existant identique ... */}
  </Link>

  {/* Zone actions */}
  <div className="flex flex-col gap-1 border-l border-gray-100 px-2 py-2 justify-center">
    <button onClick={() => handleDuplicate(entry)} ...>Dupliquer</button>
    <button onClick={() => handleDelete(entry.id)} ...>Supprimer</button>
  </div>
</li>
```

### Implémentation de entries.delete côté serveur

```ts
delete: publicProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const [entry] = await ctx.db
      .select()
      .from(entries)
      .where(eq(entries.id, input.id));
    if (!entry) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Entrée introuvable" });
    }
    if (entry.photoPath) {
      try {
        await fs.unlink(entry.photoPath);
      } catch {
        // Fichier absent — non bloquant
      }
    }
    await ctx.db.delete(entries).where(eq(entries.id, input.id));
  }),
```

Import à ajouter en tête de `entries.ts` : `import fs from "fs/promises";`

### Implémentation de la duplication côté frontend

La duplication réutilise `entries.create` existant — **aucune nouvelle procédure tRPC** :

```ts
const duplicateMutation = api.entries.create.useMutation({
  onSuccess: () => utils.entries.list.invalidate(),
});

const handleDuplicate = (entry: typeof data[number]) => {
  duplicateMutation.mutate({
    timestamp: new Date(),
    condition: entry.condition as EntryCondition,
    description: entry.description ?? undefined,
    weightG: entry.weightG ?? undefined,
    calories: entry.calories ?? undefined,
    note: entry.note ?? undefined,
    // photoPath volontairement absent
  });
};
```

### Confirmation de suppression

`window.confirm` est suffisant pour ce cas mono-utilisateur — pas besoin de modal :

```ts
const handleDelete = (id: number) => {
  if (!window.confirm("Supprimer cette entrée ? Cette action est irréversible.")) return;
  deleteMutation.mutate({ id });
};
```

### Import de types nécessaires dans EntryList.tsx

```ts
import { type EntryCondition } from "~/server/db/schema";
```

### Chemin des photos (cohérence avec la route photos existante)

La route `src/app/api/photos/route.ts` stocke le chemin **absolu** dans `photoPath` (ex. `/data/photos/2026-06-26T...jpg`). `fs.unlink` dans le routeur doit utiliser ce chemin directement — pas de recomposition avec `getPhotosDir()`.

### Ce qui NE doit PAS changer

- Le lien vers `/entrees/[id]` pour l'édition doit rester fonctionnel
- La logique de `api.entries.list.useQuery()` et ses états `isPending`/`isError` restent identiques
- Aucune autre page ni composant modifié
- Aucune migration de schéma requise

### References

- [Source: architecture.md — Addendum V1.1 — FR-25] Suppression avec fs.unlink non bloquant, confirmation window.confirm
- [Source: architecture.md — Addendum V1.1 — FR-26] Réutilisation de entries.create, pas de nouvelle procédure
- [Source: pacal/src/server/api/routers/entries.ts] Routeur existant — ajouter delete à la suite de update
- [Source: pacal/src/components/features/entry-history/EntryList.tsx] Composant à restructurer
- [Source: pacal/src/app/api/photos/route.ts] Confirmation que photoPath est un chemin absolu

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Amelia — bmad-dev-story, 2026-06-26)

### Debug Log References

### Completion Notes List

- ✅ `entries.ts` : procédure `delete` ajoutée — récupère l'entrée, supprime le fichier photo (fs.unlink non bloquant), supprime la ligne DB
- ✅ `EntryList.tsx` : restructuré — `<Link>` flex-1 pour l'édition + zone actions droite avec boutons Dupliquer/Supprimer
- ✅ Résolution du problème `<button>` dans `<a>` : carte découpée en deux zones distinctes (lien + boutons)
- ✅ Duplication via `entries.create` existant (pas de nouvelle procédure) — photoPath non transmis
- ✅ Boutons désactivés pendant mutation en cours (`isBusy`)
- ✅ Invalidation `entries.list` après suppression et duplication
- ✅ TypeScript clean (pnpm typecheck sans erreur)

### File List

- pacal/src/server/api/routers/entries.ts (modifié)
- pacal/src/components/features/entry-history/EntryList.tsx (modifié)
