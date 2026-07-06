import { NextResponse, after } from "next/server";
import { all, get, run } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { normalizePhone, isValidPhone, isValidName } from "@/lib/validation";
import { notifyOwnerNewOrder } from "@/lib/notify";

// Admin: list all orders (newest first). Buyer: list own orders.
export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.role === "admin") {
    const orders = await all(
      "SELECT * FROM orders ORDER BY created_at DESC, id DESC"
    );
    const countRow = await get(
      "SELECT COUNT(*) AS c FROM orders WHERE status = 'new'"
    );
    return NextResponse.json({ orders, newCount: countRow.c });
  }

  const orders = await all(
    "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC, id DESC",
    [user.id]
  );
  return NextResponse.json({ orders });
}

// Buyer places an order (must be logged in).
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // A blocked account can hold a session but must not be able to place orders.
  const account = await get("SELECT blocked FROM users WHERE id = ?", [user.id]);
  if (account?.blocked)
    return NextResponse.json({ error: "account_blocked" }, { status: 403 });

  try {
    const { productId, buyerName, buyerPhone } = await request.json();
    const product = await get("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);
    if (!product)
      return NextResponse.json({ error: "product_not_found" }, { status: 404 });

    // The buyer confirms the number to be contacted on (their sign-up number
    // may be wrong). Fall back to the account name if none was provided.
    const contactPhone = normalizePhone(buyerPhone);
    if (!isValidPhone(contactPhone))
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    const contactName = isValidName(buyerName)
      ? String(buyerName).trim()
      : user.name;

    const info = await run(
      `INSERT INTO orders (product_id, product_name, price, buyer_id, buyer_name, buyer_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'new')`,
      [product.id, product.name, product.price, user.id, contactName, contactPhone]
    );

    const order = await get("SELECT * FROM orders WHERE id = ?", [
      Number(info.lastInsertRowid),
    ]);

    // Notify the OWNER only (WhatsApp + email), after the response is sent so
    // it never blocks or breaks the order. Best-effort: failures are logged,
    // the saved order and the dashboard alert are unaffected.
    after(() => notifyOwnerNewOrder(order));

    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
