import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidPrice } from "@/lib/validation";

// Public: list all products (newest first).
export async function GET() {
  const products = await all(
    "SELECT * FROM products ORDER BY created_at DESC, id DESC"
  );
  return NextResponse.json({ products });
}

// Admin only: create a product.
export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const { name, price, description, image } = await request.json();
    if (!name || String(name).trim().length < 1)
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    if (!isValidPrice(price))
      return NextResponse.json({ error: "invalid_price" }, { status: 400 });

    const info = await run(
      "INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)",
      [
        String(name).trim(),
        Number(price),
        String(description || "").trim(),
        String(image || "").trim(),
      ]
    );

    const product = await get("SELECT * FROM products WHERE id = ?", [
      Number(info.lastInsertRowid),
    ]);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
