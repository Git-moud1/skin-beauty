import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { get } from "./db";

const COOKIE_NAME = "sb_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// The signing key must come from the environment. In production a missing
// SESSION_SECRET is fatal (fail closed) so we never sign sessions with a known,
// public value; locally we fall back to a dev-only key for zero-config setup.
// Resolved lazily + memoized so this never runs (or throws) during `next build`.
let cachedSecret;
function getSecret() {
  if (cachedSecret) return cachedSecret;
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set in production. Add it to your Vercel environment variables."
    );
  }
  cachedSecret = new TextEncoder().encode(
    s || "skin-beauty-dev-secret-change-me-in-production-2026"
  );
  return cachedSecret;
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export async function createSession(user) {
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Opt-in only: the store is designed to run locally over http://localhost,
    // where a Secure cookie would never be sent back. Enable COOKIE_SECURE=1
    // when deploying behind HTTPS.
    secure: process.env.COOKIE_SECURE === "1",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Returns the safe (password-stripped) current user, or null. */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const user = await get(
      "SELECT id, name, phone, role, created_at FROM users WHERE id = ?",
      [payload.uid]
    );
    return user || null;
  } catch {
    return null;
  }
}

/** Throws-style guard helper for API routes: returns user or null (caller returns 401). */
export async function requireUser() {
  return getCurrentUser();
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}
