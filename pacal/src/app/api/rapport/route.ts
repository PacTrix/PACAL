import { type NextRequest, NextResponse } from "next/server";
import { and, asc, gte, lte } from "drizzle-orm";

import { db } from "~/server/db";
import { entries } from "~/server/db/schema";
import { renderRapport } from "~/lib/pdf";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const from = fromParam ? new Date(fromParam) : null;
  const to = toParam ? new Date(toParam) : null;

  const conditions = [];
  if (from) conditions.push(gte(entries.timestamp, from));
  if (to) conditions.push(lte(entries.timestamp, to));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(entries)
          .where(and(...conditions))
          .orderBy(asc(entries.timestamp))
      : await db.select().from(entries).orderBy(asc(entries.timestamp));

  const buffer = await renderRapport(rows, from, to);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="pacal-rapport.pdf"',
    },
  });
}
