import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

// Serves product images uploaded to data/uploads. Works in dev and production.
export async function GET(request, { params }) {
  const { name } = await params;

  // Prevent path traversal: allow only a plain filename.
  const safe = path.basename(String(name || ""));
  if (safe !== name) return new Response("Not found", { status: 404 });

  const ext = path.extname(safe).toLowerCase();
  const type = TYPES[ext];
  if (!type) return new Response("Not found", { status: 404 });

  const filePath = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(filePath)) return new Response("Not found", { status: 404 });

  const data = fs.readFileSync(filePath);
  return new Response(data, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
