import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

const getPhotosDir = () =>
  process.env.NODE_ENV === "production"
    ? "/data/photos"
    : path.join(process.cwd(), "data", "photos");

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = Math.random().toString(36).substring(2, 8);
  const filename = `${ts}_${rand}.${ext}`;

  const photosDir = getPhotosDir();
  await mkdir(photosDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const filePath = path.join(photosDir, filename);
  await writeFile(filePath, Buffer.from(bytes));

  return NextResponse.json({ path: filePath });
}
