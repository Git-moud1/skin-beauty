import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import {
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  normalizePhone,
  isValidPhone,
  isValidName,
  isValidPassword,
} from "@/lib/validation";

export async function PUT(request) {
  const current = await getCurrentUser();
  if (!current)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { name, phone, currentPassword, newPassword } = await request.json();

    if (!isValidName(name))
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    if (!isValidPhone(phone))
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

    const cleanPhone = normalizePhone(phone);

    // Phone must stay unique across other users.
    const clash = await get(
      "SELECT id FROM users WHERE phone = ? AND id <> ?",
      [cleanPhone, current.id]
    );
    if (clash)
      return NextResponse.json({ error: "phone_taken" }, { status: 409 });

    // Optional password change requires the current password.
    if (newPassword) {
      if (!isValidPassword(newPassword))
        return NextResponse.json({ error: "invalid_password" }, { status: 400 });
      const row = await get("SELECT password FROM users WHERE id = ?", [
        current.id,
      ]);
      if (!verifyPassword(String(currentPassword || ""), row.password))
        return NextResponse.json(
          { error: "wrong_current_password" },
          { status: 403 }
        );
      await run("UPDATE users SET password = ? WHERE id = ?", [
        hashPassword(newPassword),
        current.id,
      ]);
    }

    await run("UPDATE users SET name = ?, phone = ? WHERE id = ?", [
      name.trim(),
      cleanPhone,
      current.id,
    ]);

    const user = await get(
      "SELECT id, name, phone, role FROM users WHERE id = ?",
      [current.id]
    );
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
