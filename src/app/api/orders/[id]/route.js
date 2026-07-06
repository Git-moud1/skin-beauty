import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const ALLOWED = ["new", "seen", "done"];

// Admin: update an order's status (new -> seen -> done).
export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const { status } = await request.json();
    if (!ALLOWED.includes(status))
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });

    await run("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    const order = await get("SELECT * FROM orders WHERE id = ?", [id]);
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  await run("DELETE FROM orders WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
