import { readFile } from "fs/promises";
import path from "path";
import { type NextRequest, NextResponse } from "next/server";
import { zipSync, type Zippable } from "fflate";
import { and, asc, gte, lte } from "drizzle-orm";

import { db } from "~/server/db";
import { entries } from "~/server/db/schema";

const getPhotosDir = () =>
  process.env.NODE_ENV === "production"
    ? "/data/photos"
    : path.join(process.cwd(), "data", "photos");

const CSV_HEADER =
  "id,timestamp,condition,description,weight_g,calories,estimation_status,note,photo_file\n";

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toPhotoFilename(timestamp: Date, originalPath: string): string {
  const ext = path.extname(originalPath).toLowerCase() || ".jpg";
  // Replace colons so the filename is valid on Windows
  return timestamp.toISOString().replace(/:/g, "-") + ext;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const conditions = [];
  if (fromParam) conditions.push(gte(entries.timestamp, new Date(fromParam)));
  if (toParam) conditions.push(lte(entries.timestamp, new Date(toParam)));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(entries)
          .where(and(...conditions))
          .orderBy(asc(entries.timestamp))
      : await db.select().from(entries).orderBy(asc(entries.timestamp));

  // Build CSV (BOM for Excel compatibility)
  let csv = "﻿" + CSV_HEADER;
  const photoMap = new Map<string, string>(); // originalPath → zipFilename

  for (const row of rows) {
    let photoFile = "";
    if (row.photoPath) {
      const originalFilename = row.photoPath.split("/").pop() ?? "";
      const zipName = toPhotoFilename(new Date(row.timestamp), originalFilename);
      photoMap.set(row.photoPath, zipName);
      photoFile = `photos/${zipName}`;
    }

    csv +=
      [
        escapeCsv(String(row.id)),
        escapeCsv(new Date(row.timestamp).toISOString()),
        escapeCsv(row.condition),
        escapeCsv(row.description),
        escapeCsv(row.weightG != null ? String(row.weightG) : ""),
        escapeCsv(row.calories != null ? String(row.calories) : ""),
        escapeCsv(row.estimationStatus),
        escapeCsv(row.note),
        escapeCsv(photoFile),
      ].join(",") + "\n";
  }

  // Build ZIP entries
  const zippable: Zippable = {
    "entries.csv": [
      new TextEncoder().encode(csv),
      { level: 6 },
    ],
  };

  const photosDir = getPhotosDir();
  for (const [originalPath, zipName] of photoMap.entries()) {
    const originalFilename = originalPath.split("/").pop() ?? "";
    const filePath = path.join(photosDir, originalFilename);
    try {
      const data = await readFile(filePath);
      zippable[`photos/${zipName}`] = [new Uint8Array(data), { level: 0 }];
    } catch {
      // Photo missing on disk — skip it, CSV reference stays
    }
  }

  const zipData = zipSync(zippable);

  return new NextResponse(zipData, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="pacal-export.zip"',
    },
  });
}
