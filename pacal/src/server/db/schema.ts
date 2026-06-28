import { index, pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `pacal_${name}`);

// Valeurs fixes des conditions de prise (FR-4)
export const ENTRY_CONDITIONS = [
  "chez_moi",
  "au_bureau",
  "au_resto_business",
  "au_resto_amis",
  "chez_des_gens",
] as const;

export type EntryCondition = (typeof ENTRY_CONDITIONS)[number];

export const ENTRY_CONDITION_LABELS: Record<EntryCondition, string> = {
  chez_moi: "Chez moi",
  au_bureau: "Au bureau",
  au_resto_business: "Au resto (business)",
  au_resto_amis: "Au resto (amis)",
  chez_des_gens: "Chez des gens",
};

export const ESTIMATION_STATUSES = ["estime", "mesure"] as const;
export type EstimationStatus = (typeof ESTIMATION_STATUSES)[number];

// Unités de quantité (FR-30)
export const ENTRY_UNITS = ["g", "kg", "dl", "l", "portion"] as const;
export type EntryUnit = (typeof ENTRY_UNITS)[number];

// Types de note (FR-31)
export const NOTE_TYPES = ["aliment", "médicament", "sommeil", "autre"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

// Table principale des entrées
export const entries = createTable(
  "entry",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    timestamp: d.timestamp({ withTimezone: true }).notNull(),
    description: d.text(),
    quantity: d.integer(),
    unit: d.varchar({ length: 10 }),
    calories: d.real(),
    estimationStatus: d
      .text({ enum: ESTIMATION_STATUSES })
      .notNull()
      .default("estime"),
    condition: d.text({ enum: ENTRY_CONDITIONS }).notNull(),
    note: d.text(),
    noteType: d.varchar({ length: 20 }),
    photoPath1: d.text(),
    photoPath2: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("entry_timestamp_idx").on(t.timestamp)]
);

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
