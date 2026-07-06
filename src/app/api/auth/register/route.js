import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import {
  normalizePhone,
  isValidPhone,
  isValidPassword,
  isValidName,
} from "@/lib/validation";

export async function POST(request) {
  try {
    const { name, phone, password } = await request.json();

    if (!isValidName(name))
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    if (!isValidPhone(phone))
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    if (!isValidPassword(password))
      return NextResponse.json({ error: "invalid_password" }, { status: 400 });

    const cleanPhone = normalizePhone(phone);
    const exists = await get("SELECT id FROM users WHERE phone = ?", [
      cleanPhone,
    ]);
    if (exists)
      return NextResponse.json({ error: "phone_taken" }, { status: 409 });

    const info = await run(
      "INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, 'buyer')",
      [name.trim(), cleanPhone, hashPassword(password)]
    );

    const user = await get(
      "SELECT id, name, phone, role FROM users WHERE id = ?",
      [Number(info.lastInsertRowid)]
    );

    await createSession(user);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
