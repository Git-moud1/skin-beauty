import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/auth";

// Token route for Vercel Blob CLIENT uploads. The browser asks this endpoint to
// mint a short-lived upload token; the file itself never passes through the
// server, so the ~4.5 MB serverless body limit does not apply.
//
// Security: only an authenticated admin can obtain a token, and the token is
// scoped to image content types and a hard size ceiling.

export async function POST(request) {
  // No Blob token configured (local dev) → signal the client to use the
  // multipart /api/upload fallback instead of client upload.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "blob_not_configured" },
      { status: 501 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        const admin = await requireAdmin();
        if (!admin) throw new Error("forbidden");
        return {
          allowedContentTypes: ["image/webp", "image/jpeg", "image/png"],
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 MB — compressed images are far smaller
          addRandomSuffix: false, // the client already supplies a unique name
        };
      },
      // Fired by Vercel via webhook once the upload finishes. Nothing to persist
      // here — the product record stores the returned URL on save.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const code = err?.message === "forbidden" ? "forbidden" : "server_error";
    return NextResponse.json(
      { error: code },
      { status: code === "forbidden" ? 403 : 400 }
    );
  }
}
