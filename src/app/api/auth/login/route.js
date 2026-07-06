import { NextResponse } from "next/server";
import { get } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/validation";

// Best-effort in-memory brute-force throttle. NOTE: on serverless (Vercel) this
// map is not shared across instances or cold starts, so it is one layer of
// defense-in-depth, not a hard guarantee — pair it with platform-level
// protection for production. A client is throttled after too many failed
// attempts inside the window; a successful login resets its counter.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map(); // key -> { count, resetAt }

function throttleKey(request, phone) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  return `${ip}:${phone}`;
}

function isThrottled(key) {
  const rec = failures.get(key);
  if (!rec) return false;
  if (Date.now() > rec.resetAt) {
    failures.delete(key);
    return false;
  }
  return rec.count >= MAX_FAILURES;
}

function recordFailure(key) {
  const now = Date.now();
  const rec = failures.get(key);
  if (!rec || now > rec.resetAt) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count += 1;
  }
}

export async function POST(request) {
  try {
    const { phone, password } = await request.json();
    const cleanPhone = normalizePhone(phone);
    const key = throttleKey(request, cleanPhone);

    if (isThrottled(key)) {
      return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
    }

    const row = await get("SELECT * FROM users WHERE phone = ?", [cleanPhone]);

    if (!row || !verifyPassword(String(password || ""), row.password)) {
      recordFailure(key);
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    // Blocked accounts cannot sign in (checked after the password so we never
    // reveal whether a given number exists).
    if (row.blocked) {
      return NextResponse.json({ error: "account_blocked" }, { status: 403 });
    }

    // Successful login clears any accumulated failure count for this client.
    failures.delete(key);

    const user = { id: row.id, name: row.name, phone: row.phone, role: row.role };
    await createSession(user);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
