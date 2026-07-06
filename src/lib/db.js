import { createClient } from "@libsql/client";

// Turso (hosted libSQL) connection. libSQL is SQLite-compatible but its API is
// ASYNC (await client.execute({ sql, args })), unlike the old synchronous
// better-sqlite3. Credentials come from the environment — never hardcode them.
//
// The schema is NOT created here (that would run on every cold start). Run the
// idempotent `scripts/init-db.js` once to create tables and seed data.
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error(
    "TURSO_DATABASE_URL is not set. Copy .env.example to .env.local and fill it in " +
      "(see the setup steps in README)."
  );
}

// Reuse a single client across hot reloads (dev) and warm serverless
// invocations (Vercel) instead of opening a new connection every time.
const client = globalThis.__skinBeautyClient ?? createClient({ url, authToken });
globalThis.__skinBeautyClient = client;

/** Run a query and return all matching rows (array, possibly empty). */
export async function all(sql, args = []) {
  const res = await client.execute({ sql, args });
  return res.rows;
}

/** Run a query and return the first row, or null if there are none. */
export async function get(sql, args = []) {
  const res = await client.execute({ sql, args });
  return res.rows[0] ?? null;
}

/**
 * Run a write (INSERT/UPDATE/DELETE) and return the full result set, which
 * exposes `rowsAffected` and `lastInsertRowid` (a BigInt — wrap in Number()).
 */
export async function run(sql, args = []) {
  return client.execute({ sql, args });
}

export default client;
