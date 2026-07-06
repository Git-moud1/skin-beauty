// One-off catalog importer: copies the photos from images_web/ into
// public/products/ (static assets that deploy to Vercel) and inserts them as
// products with names, French descriptions and prices in Ouguiya (MRU).
//
//   npm run db:import
//
// Idempotent: re-running removes the old Unsplash demo products and any rows
// this script previously inserted (image starts with /products/), then inserts
// the current catalog fresh — so you can tweak names/prices and re-run safely.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

// --- Load TURSO_* from .env.local if not already in the environment ----------
function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
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
  console.error("\n✗ TURSO_DATABASE_URL is not set (see .env.local).\n");
  process.exit(1);
}

const SRC_DIR = path.join(process.cwd(), "images_web");
const DEST_DIR = path.join(process.cwd(), "public", "products");

// original file in images_web/  ->  clean public filename + product details.
// Prices are in Ouguiya (MRU).
const CATALOG = [
  { file: "WhatsApp Image 2026-07-05 at 5.39.38 PM.jpeg", slug: "medicube-egf-nad-firming-serum.jpeg",
    name: "Medicube EGF NAD Firming Serum", price: 1900,
    description: "Sérum raffermissant EGF + NAD à l'extrait de collagène. Redensifie la peau et lisse les rides pour un teint plus ferme et rebondi." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.38 PM (1).jpeg", slug: "haruharu-black-rice-mineral-sunscreen.jpeg",
    name: "Haruharu Wonder Black Rice Mineral Sunscreen SPF50+", price: 1300,
    description: "Écran solaire minéral pur au riz noir, SPF50+/PA++++. Protection très haute, sans parfum, idéal pour peaux sensibles." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM.jpeg", slug: "somebymi-super-matcha-pore-toner.jpeg",
    name: "SOME BY MI Super Matcha Pore Tightening Toner", price: 1100,
    description: "Tonique resserrant à 83% de matcha. Élimine l'excès de sébum et affine le grain de peau pour des pores nets." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM (1).jpeg", slug: "anua-azelaic-acid-15-cica-serum.jpeg",
    name: "Anua Azelaic Acid 15 + Cica Calming Serum", price: 1250,
    description: "Sérum apaisant intense à l'acide azélaïque 15% + Cica. Calme les rougeurs, unifie et purifie les peaux réactives." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM (2).jpeg", slug: "embryolisse-lait-creme-concentre.jpeg",
    name: "Embryolisse Lait-Crème Concentré", price: 1400,
    description: "Soin hydratant multi-fonctions culte : crème, base de maquillage, masque et démaquillant. Aloe vera + karité, non comédogène." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM (3).jpeg", slug: "eucerin-pigment-control-sun-fluid.jpeg",
    name: "Eucerin Sun Pigment Control SPF50+ Sun Fluid", price: 1600,
    description: "Fluide solaire anti-hyperpigmentation au Thiamidol breveté. Prévient et réduit les taches brunes, très haute protection." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM (4).jpeg", slug: "karseell-maca-power-hair-set.jpeg",
    name: "Karseell Maca Power — Coffret Cheveux (4 pièces)", price: 2800,
    description: "Rituel réparateur complet : shampoing, après-shampoing, masque collagène et huile de maca. Répare les cheveux secs et abîmés." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM (5).jpeg", slug: "eucerin-q10-revitalize-night-cream.jpeg",
    name: "Eucerin Q10 Revitalize Night Cream", price: 1500,
    description: "Crème de nuit anti-rides au Coenzyme Q10 + Pro-Rétinol. Raffermit et lisse pendant le sommeil, sans parfum." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM (6).jpeg", slug: "dove-body-scrub-gommage.jpeg",
    name: "Dove Body Scrub — Gommage Corps", price: 750,
    description: "Gommage corps exfoliant au beurre de karité. Peau douce, lisse et nourrie. Plusieurs parfums gourmands disponibles." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.39 PM (7).jpeg", slug: "acm-novophane-anti-chute-lotion.jpeg",
    name: "ACM Novophane Reactional — Lotion Anti-Chute", price: 1700,
    description: "Lotion sans rinçage anti-chute réactionnelle. Freine la chute, accélère la repousse et redonne vitalité aux cheveux fatigués." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM.jpeg", slug: "eucerin-anti-pigment-routine-set.jpeg",
    name: "Eucerin Anti-Pigment — Routine Anti-Taches (Coffret)", price: 3200,
    description: "Routine complète anti-taches : sérum, gel nettoyant exfoliant 2% AHA, fluide solaire SPF50+ et soin corps. Teint unifié et lumineux." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (1).jpeg", slug: "glutagenc-arencia-vitamin-c-set.jpeg",
    name: "GlutaGenC + Arencia Vitamin C — Coffret Éclat", price: 1500,
    description: "Duo anti-taches tenaces : capsules de glutathion + booster Vitamine C. Éclaircit, unifie et illumine le teint en profondeur." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (2).jpeg", slug: "eucerin-anti-pigment-serum-duo-set.jpeg",
    name: "Eucerin Anti-Pigment Serum Duo (Coffret 3 pièces)", price: 2600,
    description: "Sérum duo anti-taches au Thiamidol, gel nettoyant 2% AHA et fluide solaire SPF50+. Premiers résultats visibles en 2 semaines." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (3).jpeg", slug: "eucerin-roughness-relief-body-set.jpeg",
    name: "Eucerin Roughness Relief — Soin Corps (Lotion + Crème)", price: 1800,
    description: "Duo corps à l'urée + céramides pour peaux très sèches et rugueuses. Lisse, hydrate 72h et adoucit les zones rêches." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (4).jpeg", slug: "haruharu-triple-aha-cleansing-gel.jpeg",
    name: "Haruharu Wonder Black Rice Triple AHA Cleansing Gel", price: 950,
    description: "Gel nettoyant doux au riz noir + triple AHA. Nettoie en douceur, exfolie légèrement et lisse le grain de peau. Sans parfum." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (5).jpeg", slug: "vital-proteins-collagen-peptides.jpeg",
    name: "Vital Proteins Collagen Peptides", price: 2400,
    description: "Peptides de collagène (20 g/portion) pour peau, cheveux, ongles et articulations. Sans goût, issu d'élevage en pâturage." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (6).jpeg", slug: "larocheposay-pure-vitamin-c12-serum.jpeg",
    name: "La Roche-Posay Pure Vitamin C12 Serum", price: 1900,
    description: "Sérum anti-rides concentré en Vitamine C pure. Renove l'éclat, lisse et anti-oxydant. Conçu pour les peaux sensibles." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (7).jpeg", slug: "nubian-african-black-soap-body-wash.jpeg",
    name: "Nubian Heritage African Black Soap — Body Wash", price: 850,
    description: "Gel douche au savon noir africain, aloe vera et avoine. Nettoie l'excès de sébum et réduit les boutons du dos et des épaules." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.40 PM (8).jpeg", slug: "eos-shea-better-body-lotion.jpeg",
    name: "eos Shea Better 24H Moisture Body Lotion", price: 900,
    description: "Lait corps hydratation 24h au beurre de karité et 7 huiles nourrissantes. Fond instantanément, parfums délicats au choix." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.41 PM.jpeg", slug: "now-c1000-zinc-immune.jpeg",
    name: "NOW C-1000 Zinc Immune (180 capsules)", price: 1600,
    description: "Complément immunité : 1000 mg de Vitamine C + 15 mg de Zinc. Protection antioxydante, formule végétarienne." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.41 PM (1).jpeg", slug: "anua-heartleaf-silky-sun-cream.jpeg",
    name: "Anua Heartleaf Silky Moisture Sun Cream SPF50+", price: 1200,
    description: "Crème solaire hydratante au heartleaf, SPF50+/PA++++. Fini soyeux non gras, apaise et protège les peaux sensibles." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.41 PM (2).jpeg", slug: "maryandmay-vegan-wash-off-mask-set.jpeg",
    name: "Mary & May Vegan Wash Off Mask — Mini Coffret (5 masques)", price: 1350,
    description: "Coffret de 5 masques vegan à rincer : Blackberry, Calendula, Citron, Rose et Cica Tea Tree. Éclat, hydratation et apaisement." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.41 PM (3).jpeg", slug: "anua-niacinamide-txa-tone-boost-toner.jpeg",
    name: "Anua Niacinamide TXA Tone Boost Brightening Toner", price: 1150,
    description: "Tonique éclat au Niacinamide + TXA. Illumine, unifie le teint et estompe les taches pour une peau lumineuse." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.41 PM (4).jpeg", slug: "gillette-venus-shave-cream-olay.jpeg",
    name: "Gillette Venus Smooth Shave Cream (Olay)", price: 650,
    description: "Crème à raser douce à l'aloe et Olay. Rasage tout en douceur, peau lisse et hydratée sans tiraillements." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.41 PM (5).jpeg", slug: "celimax-pore-dark-spot-sunscreen.jpeg",
    name: "Celimax Pore + Dark Spot Brightening Sunscreen SPF50+", price: 1250,
    description: "Écran solaire éclaircissant SPF50+/PA++++ au Niacinamide 5% + acide tranexamique. Estompe pores et taches, tous types de peau." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.41 PM (6).jpeg", slug: "anua-peach-70-niacin-serum.jpeg",
    name: "Anua Peach 70 Niacin Serum", price: 1300,
    description: "Sérum éclat à 70% d'extrait de pêche + niacinamide. Illumine, nourrit et donne un teint frais et radieux." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.42 PM.jpeg", slug: "anua-rice-7-ceramide-serum.jpeg",
    name: "Anua Rice 7 + Ceramide Hydrating Barrier Serum", price: 1300,
    description: "Sérum barrière hydratant au riz + céramides. Renforce la barrière cutanée, repulpe et laisse la peau douce et souple." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.42 PM (1).jpeg", slug: "larocheposay-mela-b3-set.jpeg",
    name: "La Roche-Posay Mela B3 — Coffret Anti-Taches (Gel + Sérum)", price: 2900,
    description: "Duo anti-taches au Melasyl + Niacinamide : gel micro-peeling et sérum concentré. Corrige les taches brunes et unifie le teint." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.42 PM (2).jpeg", slug: "missha-m-perfect-cover-bb-cream.jpeg",
    name: "Missha M Perfect Cover BB Cream SPF42 (No.13)", price: 1100,
    description: "BB crème couvrante SPF42/PA+++, teinte Bright Beige. Couvre les imperfections et hydrate pour un fini naturel impeccable." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.42 PM (3).jpeg", slug: "feather-piany-face-razors.jpeg",
    name: "Feather Piany Face — Rasoirs Visage (Made in Japan)", price: 400,
    description: "Rasoirs de finition pour le visage avec garde de sécurité. Retire le duvet en douceur, fabriqués au Japon." },
  { file: "WhatsApp Image 2026-07-05 at 5.39.42 PM (4).jpeg", slug: "roundlab-birch-juice-tone-up-sunscreen.jpeg",
    name: "Round Lab Birch Juice Moisturizing Tone-Up Sunscreen SPF50+", price: 1250,
    description: "Écran solaire hydratant à la sève de bouleau, SPF50+/PA++++. Effet tone-up lumineux et hydratation longue durée." },
];

const client = createClient({ url, authToken });

async function main() {
  // Copy images into public/products/
  if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
  let copied = 0;
  for (const item of CATALOG) {
    const src = path.join(SRC_DIR, item.file);
    if (!fs.existsSync(src)) {
      console.warn("  ! missing source image:", item.file);
      continue;
    }
    fs.copyFileSync(src, path.join(DEST_DIR, item.slug));
    copied++;
  }
  console.log(`✓ Copied ${copied}/${CATALOG.length} images to public/products/`);

  // Clean slate: remove old demo products + anything previously imported here.
  const delDemo = await client.execute({
    sql: "DELETE FROM products WHERE image LIKE 'https://images.unsplash.com%'",
    args: [],
  });
  const delPrev = await client.execute({
    sql: "DELETE FROM products WHERE image LIKE '/products/%'",
    args: [],
  });
  console.log(
    `✓ Removed ${Number(delDemo.rowsAffected)} demo + ${Number(delPrev.rowsAffected)} previously-imported products`
  );

  // Insert the catalog (atomic batch).
  await client.batch(
    CATALOG.map((item) => ({
      sql: "INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)",
      args: [item.name, item.price, item.description, `/products/${item.slug}`],
    })),
    "write"
  );
  console.log(`✓ Inserted ${CATALOG.length} products.`);

  const total = await client.execute("SELECT COUNT(*) AS c FROM products");
  console.log(`\n✅ Catalog ready — ${Number(total.rows[0].c)} products in store.\n`);
}

main()
  .catch((err) => {
    console.error("\n✗ import-products failed:", err.message || err, "\n");
    process.exit(1);
  })
  .finally(() => client.close());
