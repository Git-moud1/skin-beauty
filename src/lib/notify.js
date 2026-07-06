// Owner-only "new order" notifications.
//
// Sends an alert to the STORE OWNER (never to the customer) over two fully
// independent channels: WhatsApp (CallMeBot free API) and email (Resend).
//
// Design contract — this module must NEVER break the order flow:
//   • The order is already saved before this runs; notifications are best-effort.
//   • Each channel is isolated (its own error handling) and runs in parallel.
//   • A failure/timeout in one channel never affects the other, and nothing
//     here ever throws to the caller. All credentials come from env vars only.

const WHATSAPP_TIMEOUT_MS = 8000;

// Minimal HTML escaping so buyer-supplied text can't break the email markup.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTime(value) {
  try {
    const d = value ? new Date(value) : new Date();
    if (Number.isNaN(d.getTime())) return String(value ?? "");
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value ?? "");
  }
}

// --- Channel 1: WhatsApp via CallMeBot -------------------------------------
async function sendWhatsApp(order) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) {
    console.warn("[notify] CallMeBot not configured — skipping WhatsApp");
    return;
  }

  const text =
    `🛍️ طلب جديد!\n` +
    `المنتج: ${order.product_name}\n` +
    `السعر: ${order.price} أوقية\n` +
    `الزبونة: ${order.buyer_name}\n` +
    `الهاتف: ${order.buyer_phone}\n` +
    `الوقت: ${formatTime(order.created_at)}`;

  const url =
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(text)}` +
    `&apikey=${encodeURIComponent(apikey)}`;

  // Abort if CallMeBot is slow so it can never delay/hang anything.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WHATSAPP_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`CallMeBot HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

// --- Channel 2: Email via Resend -------------------------------------------
async function sendEmail(order) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  if (!apiKey || !to) {
    console.warn("[notify] Resend not configured — skipping email");
    return;
  }
  // Resend's free tier lets you send from their shared onboarding address
  // without verifying a domain. Override with RESEND_FROM once you verify one.
  const from = process.env.RESEND_FROM || "Skin Beauty <onboarding@resend.dev>";

  // Imported dynamically so a missing/broken package can only ever affect
  // this one channel — never the order route or the WhatsApp channel.
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const time = formatTime(order.created_at);
  const row = (label, value) =>
    `<tr>
       <td style="padding:12px 24px;color:#8a94b0;font-size:14px;">${label}</td>
       <td style="padding:12px 24px;color:#1f295a;font-weight:700;text-align:left;" dir="ltr">${value}</td>
     </tr>`;

  const html = `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#faf7f5;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0e6ea;">
      <div style="background:linear-gradient(135deg,#e11d6d,#be185d);color:#ffffff;padding:20px 24px;">
        <h1 style="margin:0;font-size:20px;">🛍️ طلب جديد</h1>
        <p style="margin:4px 0 0;font-size:13px;opacity:.9;">Skin Beauty — لوحة الطلبات</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${row("المنتج", escapeHtml(order.product_name))}
        ${row("السعر", `${escapeHtml(order.price)} أوقية`)}
        ${row("الزبونة", escapeHtml(order.buyer_name))}
        ${row("الهاتف", escapeHtml(order.buyer_phone))}
        ${row("الوقت", escapeHtml(time))}
      </table>
    </div>
  </div>`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `🛍️ طلب جديد — ${order.product_name}`,
    html,
  });
  if (error) throw new Error(error.message || "Resend error");
}

// Fire both channels in parallel; log failures, never throw.
export async function notifyOwnerNewOrder(order) {
  try {
    const results = await Promise.allSettled([
      sendWhatsApp(order),
      sendEmail(order),
    ]);
    const channels = ["WhatsApp", "Email"];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(
          `[notify] ${channels[i]} notification failed:`,
          r.reason?.message || r.reason
        );
      }
    });
  } catch (err) {
    // Extremely defensive: allSettled shouldn't reject, but never let anything
    // bubble out of here.
    console.error("[notify] unexpected notification error:", err);
  }
}
