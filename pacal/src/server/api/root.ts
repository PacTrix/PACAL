import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { entriesRouter } from "~/server/api/routers/entries";
import { productsRouter } from "~/server/api/routers/products";
import { settingsRouter } from "~/server/api/routers/settings";
import { exportRouter } from "~/server/api/routers/export";
import { reportRouter } from "~/server/api/routers/report";

export const appRouter = createTRPCRouter({
  entries: entriesRouter,
  products: productsRouter,
  settings: settingsRouter,
  export: exportRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
