import { NextResponse } from "next/server";
import { all } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Admin only: list clients (buyers) with blocked status + their order count,
// so the owner can search, block/unblock, reset passwords and delete accounts.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const users = await all(
    `SELECT u.id, u.name, u.phone, u.role, u.created_at, u.blocked,
            (SELECT COUNT(*) FROM orders o WHERE o.buyer_id = u.id) AS order_count
     FROM users u
     WHERE u.role <> 'admin'
     ORDER BY u.created_at DESC, u.id DESC`
  );
  return NextResponse.json({ users });
}
