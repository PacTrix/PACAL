import fs from "fs/promises";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { entries, ENTRY_CONDITIONS, ENTRY_UNITS, NOTE_TYPES } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const createEntrySchema = z.object({
  timestamp: z.date(),
  condition: z.enum(ENTRY_CONDITIONS),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
  unit: z.enum(ENTRY_UNITS).optional(),
  calories: z.number().nonnegative().optional(),
  note: z.string().optional(),
  noteType: z.enum(NOTE_TYPES).optional(),
  photoPath1: z.string().optional(),
  photoPath2: z.string().optional(),
});

export const updateEntrySchema = z.object({
  id: z.number(),
  timestamp: z.date(),
  condition: z.enum(ENTRY_CONDITIONS),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
  unit: z.enum(ENTRY_UNITS).optional(),
  calories: z.number().nonnegative().optional(),
  note: z.string().optional(),
  noteType: z.enum(NOTE_TYPES).optional(),
  photoPath1: z.string().nullable().optional(),
  photoPath2: z.string().nullable().optional(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export const entriesRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(entries).orderBy(desc(entries.timestamp));
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [entry] = await ctx.db
        .select()
        .from(entries)
        .where(eq(entries.id, input.id));
      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Entrée introuvable" });
      }
      return entry;
    }),

  create: publicProcedure
    .input(createEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const [entry] = await ctx.db
        .insert(entries)
        .values({
          timestamp: input.timestamp,
          condition: input.condition,
          description: input.description,
          quantity: input.quantity,
          unit: input.unit,
          calories: input.calories,
          note: input.note,
          noteType: input.noteType,
          photoPath1: input.photoPath1,
          photoPath2: input.photoPath2,
        })
        .returning();
      return entry;
    }),

  update: publicProcedure
    .input(updateEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const [entry] = await ctx.db
        .update(entries)
        .set({
          timestamp: input.timestamp,
          condition: input.condition,
          description: input.description ?? null,
          quantity: input.quantity ?? null,
          unit: input.unit ?? null,
          calories: input.calories ?? null,
          note: input.note ?? null,
          noteType: input.noteType ?? null,
          photoPath1: input.photoPath1 ?? null,
          photoPath2: input.photoPath2 ?? null,
        })
        .where(eq(entries.id, input.id))
        .returning();
      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Entrée introuvable" });
      }
      return entry;
    }),

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
      for (const p of [entry.photoPath1, entry.photoPath2]) {
        if (p) {
          try { await fs.unlink(p); } catch { /* absent du volume — non bloquant */ }
        }
      }
      await ctx.db.delete(entries).where(eq(entries.id, input.id));
    }),
});
