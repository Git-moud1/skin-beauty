import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Loads the target client and guards against acting on a missing user or on any
// admin/owner account (protects the owner from locking themselves out).
async function loadClient(id) {
  const target = await get("SELECT id, role FROM users WHERE id = ?", [id]);
  if (!target) return { error: "not_found", status: 404 };
  if (target.role === "admin") return { error: "forbidden", status: 403 };
  return { target };
}

// Admin only: block or unblock a client. A blocked client can neither log in
// nor place orders (both enforced server-side).
export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const { blocked } = await request.json();
    const guard = await loadClient(id);
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    await run("UPDATE users SET blocked = ? WHERE id = ?", [
      blocked ? 1 : 0,
      id,
    ]);
    return NextResponse.json({ ok: true, blocked: blocked ? 1 : 0 });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// Admin only: permanently delete a client account. Their orders are kept for
// history/stats but detached and flagged as belonging to a deleted account
// (the buyer name/phone snapshot on each order is preserved).
export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const guard = await loadClient(id);
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    await run(
      "UPDATE orders SET buyer_deleted = 1, buyer_id = NULL WHERE buyer_id = ?",
      [id]
    );
    await run("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
