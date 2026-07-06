import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidPrice } from "@/lib/validation";

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await get("SELECT * FROM products WHERE id = ?", [id]);
  if (!existing)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const { name, price, description, image } = await request.json();
    if (!name || String(name).trim().length < 1)
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    if (!isValidPrice(price))
      return NextResponse.json({ error: "invalid_price" }, { status: 400 });

    await run(
      "UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?",
      [
        String(name).trim(),
        Number(price),
        String(description || "").trim(),
        String(image ?? existing.image).trim(),
        id,
      ]
    );

    const product = await get("SELECT * FROM products WHERE id = ?", [id]);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  await run("DELETE FROM products WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
