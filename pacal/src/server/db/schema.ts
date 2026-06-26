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

// Table principale des entrées (FR-1 à FR-8)
export const entries = createTable(
  "entry",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    timestamp: d.timestamp({ withTimezone: true }).notNull(),
    description: d.text(),
    weightG: d.real(),
    calories: d.real(),
    estimationStatus: d
      .text({ enum: ESTIMATION_STATUSES })
      .notNull()
      .default("estime"),
    condition: d.text({ enum: ENTRY_CONDITIONS }).notNull(),
    note: d.text(),
    photoPath: d.text(),
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
