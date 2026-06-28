import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { lookupProduct } from "~/lib/openfoodfacts";

export const productsRouter = createTRPCRouter({
  lookup: publicProcedure
    .input(z.object({ barcode: z.string().min(1) }))
    .query(async ({ input }) => {
      return lookupProduct(input.barcode);
    }),
});
