import { NextResponse } from "next/server";
import client, { all } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const KEYS = ["whatsapp", "snapchat", "facebook", "tiktok"];

async function readSettings() {
  const rows = await all("SELECT key, value FROM settings");
  const out = {};
  // Only expose public contact/social keys (skip internal markers like _seeded).
  for (const { key, value } of rows) {
    if (KEYS.includes(key)) out[key] = value;
  }
  return out;
}

// Public: contact / social links for the footer.
export async function GET() {
  return NextResponse.json({ settings: await readSettings() });
}

// Admin: update contact / social links.
export async function PUT(request) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    // Upsert every provided key atomically (batch runs in one transaction).
    const statements = [];
    for (const key of KEYS) {
      if (key in body) {
        statements.push({
          sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
          args: [key, String(body[key] ?? "").trim()],
        });
      }
    }
    if (statements.length) await client.batch(statements, "write");
    return NextResponse.json({ settings: await readSettings() });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
