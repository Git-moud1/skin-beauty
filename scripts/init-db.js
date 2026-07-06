// Idempotent schema + seed for the Turso (libSQL) database.
//
//   npm run db:init
//   (or: node scripts/init-db.js)
//
// Safe to run any number of times: tables use CREATE TABLE IF NOT EXISTS,
// the admin/settings rows use INSERT ... OR IGNORE / ON CONFLICT DO NOTHING,
// and the sample products are gated by a one-time `_seeded` marker.
//
// Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from the environment. If they
// are not already set, it loads them from .env.local so `node scripts/init-db.js`
// works without any extra flags.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");

// --- Minimal .env.local loader (only for values not already in the env) ------
function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip surrounding single or double quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error(
    "\n✗ TURSO_DATABASE_URL is not set.\n" +
      "  Copy .env.example to .env.local and fill in your Turso URL + token, then re-run.\n"
  );
  process.exit(1);
}

// Owner (admin) starter credentials — per project spec. Changeable later in-app.
const ADMIN_PHONE = "31270133";
const ADMIN_PASSWORD = "12345678";

const client = createClient({ url, authToken });

// Adds a column only if the table doesn't already have it (idempotent migration).
async function addColumnIfMissing(table, column, alterSql) {
  const info = await client.execute(`PRAGMA table_info(${table})`);
  const exists = info.rows.some((r) => r.name === column);
  if (exists) {
    console.log(`• ${table}.${column} already present — skipped.`);
    return;
  }
  await client.execute(alterSql);
  console.log(`✓ Added column ${table}.${column}.`);
}

async function main() {
  // 1) Schema — identical to the original SQLite schema.
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT    NOT NULL,
        phone        TEXT    NOT NULL UNIQUE,
        password     TEXT    NOT NULL,
        role         TEXT    NOT NULL DEFAULT 'buyer',
        blocked      INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS products (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT    NOT NULL,
        price        REAL    NOT NULL,
        description  TEXT    DEFAULT '',
        image        TEXT    DEFAULT '',
        created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS orders (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id    INTEGER,
        product_name  TEXT    NOT NULL,
        price         REAL    NOT NULL,
        buyer_id      INTEGER,
        buyer_name    TEXT    NOT NULL,
        buyer_phone   TEXT    NOT NULL,
        buyer_deleted INTEGER NOT NULL DEFAULT 0,
        status        TEXT    NOT NULL DEFAULT 'new',
        created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT ''
      )`,
    ],
    "write"
  );

  // 1b) Migrations for databases created before these columns existed.
  // SQLite has no "ADD COLUMN IF NOT EXISTS", so we check PRAGMA table_info
  // first and only add what's missing (a constant DEFAULT is required to add a
  // NOT NULL column to a table that already has rows). Safe to run repeatedly.
  await addColumnIfMissing(
    "users",
    "blocked",
    "ALTER TABLE users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0"
  );
  await addColumnIfMissing(
    "orders",
    "buyer_deleted",
    "ALTER TABLE orders ADD COLUMN buyer_deleted INTEGER NOT NULL DEFAULT 0"
  );

  // 2) Owner (admin) account — only inserted if the phone is not taken.
  const admin = await client.execute({
    sql: "SELECT id FROM users WHERE phone = ?",
    args: [ADMIN_PHONE],
  });
  if (admin.rows.length === 0) {
    await client.execute({
      sql: "INSERT OR IGNORE INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)",
      args: [
        "Skin Beauty",
        ADMIN_PHONE,
        bcrypt.hashSync(ADMIN_PASSWORD, 10),
        "admin",
      ],
    });
    console.log("✓ Admin account created (phone " + ADMIN_PHONE + ").");
  } else {
    console.log("• Admin account already exists — left unchanged.");
  }

  // 3) Default contact / social settings — never overwrite existing values.
  const defaultSettings = {
    whatsapp: "48011609",
    snapchat: "routin4801",
    facebook: "",
    tiktok: "",
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await client.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING",
      args: [key, value],
    });
  }
  console.log("✓ Default settings ensured.");

  // 4) Sample products — seeded exactly once, gated by an atomic marker.
  const marker = await client.execute({
    sql: "INSERT OR IGNORE INTO settings (key, value) VALUES ('_seeded', '1')",
    args: [],
  });
  if (Number(marker.rowsAffected) === 1) {
    const sampleProducts = [
      {
        name: "Glow Serum Vitamin C",
        price: 850,
        description:
          "Sérum éclat à la vitamine C pour une peau lumineuse et unifiée.",
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Hydrating Snail Essence",
        price: 1200,
        description:
          "Essence hydratante à la bave d'escargot pour réparer et repulper.",
        image:
          "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Rose Water Toner",
        price: 620,
        description: "Tonique à l'eau de rose apaisant et rafraîchissant.",
        image:
          "https://images.unsplash.com/photo-1595872018818-97555653a011?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Cushion Cream SPF50",
        price: 950,
        description: "Cushion teinté protecteur pour un fini frais et naturel.",
        image:
          "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Green Tea Cleanser",
        price: 540,
        description:
          "Mousse nettoyante au thé vert, douce pour tous types de peau.",
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Ceramide Moisturizer",
        price: 1100,
        description:
          "Crème hydratante aux céramides pour une barrière cutanée renforcée.",
        image:
          "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      },
    ];
    await client.batch(
      sampleProducts.map((p) => ({
        sql: "INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)",
        args: [p.name, p.price, p.description, p.image],
      })),
      "write"
    );
    console.log(`✓ Seeded ${sampleProducts.length} sample products.`);
  } else {
    console.log("• Sample products already seeded — skipped.");
  }

  console.log("\n✅ Database ready.\n");
}

main()
  .catch((err) => {
    console.error("\n✗ init-db failed:", err.message || err, "\n");
    process.exit(1);
  })
  .finally(() => client.close());
