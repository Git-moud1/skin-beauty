import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";

// Local fallback location (dev without a Blob token). On Vercel this filesystem
// is read-only/ephemeral, so production uses Vercel Blob instead (see below).
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

// Server-side allow-list: only these image types are accepted, and the stored
// extension comes from the verified MIME type (never from the client filename).
const ALLOWED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string")
      return NextResponse.json({ error: "no_file" }, { status: 400 });

    const ext = ALLOWED[file.type];
    if (!ext)
      return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "too_large" }, { status: 400 });

    // Unique, server-generated name — the client filename is never trusted.
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

    // Production (and any environment with a Blob token): persist to Vercel Blob
    // so uploads survive on serverless. Returns a permanent public HTTPS URL.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`products/${filename}`, file, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false, // our filename is already unique
        // token is read from BLOB_READ_WRITE_TOKEN automatically
      });
      return NextResponse.json({ url: blob.url });
    }

    // No token → zero-config local dev: write to data/uploads, served by
    // /api/media/[name].
    if (!fs.existsSync(UPLOAD_DIR))
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    return NextResponse.json({ url: `/api/media/${filename}` });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
