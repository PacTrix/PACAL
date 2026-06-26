import { readFile } from "fs/promises";
import path from "path";
import { type NextRequest, NextResponse } from "next/server";

const getPhotosDir = () =>
  process.env.NODE_ENV === "production"
    ? "/data/photos"
    : path.join(process.cwd(), "data", "photos");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Protection contre le path traversal
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png"
    : ext === ".webp" ? "image/webp"
    : "image/jpeg";

  const filePath = path.join(getPhotosDir(), filename);

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
