import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { isValidPassword } from "@/lib/validation";

// Admin only: reset a client's password (owner-assisted "forgot password").
export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const { newPassword } = await request.json();
    if (!isValidPassword(newPassword))
      return NextResponse.json({ error: "invalid_password" }, { status: 400 });

    const target = await get("SELECT id, role FROM users WHERE id = ?", [id]);
    if (!target)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    // Admin accounts change their own password from the Account tab, not here.
    if (target.role === "admin")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    await run("UPDATE users SET password = ? WHERE id = ?", [
      hashPassword(newPassword),
      id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
