"use client";

import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import {
  IconWhatsApp,
  IconEye,
  IconCheck,
  IconTrash,
  IconBell,
  IconBan,
} from "@/components/icons";

function StatusPill({ status }) {
  const { t } = useLang();
  const map = {
    new: "bg-rose-100 text-rose-700 ring-rose-200",
    seen: "bg-navy-100 text-navy-700 ring-navy-200",
    done: "bg-green-100 text-green-700 ring-green-200",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${map[status] || map.new}`}
    >
      {status === "new" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
      )}
      {t(`status.${status}`)}
    </span>
  );
}

export default function OrdersPanel({ orders, onChange }) {
  const { t, tError, price, dateTime, lang } = useLang();
  const toast = useToast();

  function whatsappLink(order) {
    const phone = "222" + String(order.buyer_phone).replace(/\D/g, "");
    const msg =
      lang === "ar"
        ? `مرحباً ${order.buyer_name}، بخصوص طلبكِ من Skin Beauty:\n${order.product_name} - ${price(order.price)}`
        : `Bonjour ${order.buyer_name}, concernant votre commande Skin Beauty :\n${order.product_name} - ${price(order.price)}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  async function setStatus(order, status) {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("server_error");
      onChange();
    } catch (err) {
      toast.error(tError(err.message));
    }
  }

  async function remove(order) {
    if (!window.confirm(t("admin.order.delete") + " ?")) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("server_error");
      onChange();
    } catch (err) {
      toast.error(tError(err.message));
    }
  }

  if (orders.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-300">
          <IconBell className="h-7 w-7" />
        </span>
        <p className="text-navy-500">{t("admin.orders.empty")}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-navy-900">
        {t("admin.orders.title")}
      </h2>

      <div className="grid gap-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className={`card p-4 transition sm:p-5 ${
              o.status === "new" ? "ring-2 ring-rose-200" : ""
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="min-w-0 break-words text-lg font-bold text-navy-900 sm:truncate">
                    {o.product_name}
                  </p>
                  <StatusPill status={o.status} />
                </div>
                <p className="mt-1 font-bold tabular-nums text-rose-600">
                  {price(o.price)}
                </p>
              </div>
              <p className="shrink-0 text-xs text-navy-500">
                {dateTime(o.created_at)}
              </p>
            </div>

            {/* Buyer details */}
            <div className="mt-3 grid gap-2 rounded-2xl bg-blush p-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-navy-500">{t("admin.order.buyer")}: </span>
                <span className="font-semibold text-navy-900">{o.buyer_name}</span>
                {o.buyer_deleted ? (
                  <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-600">
                    <IconBan className="h-3 w-3" />
                    {t("admin.order.deletedAccount")}
                  </span>
                ) : null}
              </div>
              <div>
                <span className="text-navy-500">{t("admin.order.phone")}: </span>
                <span className="font-semibold tabular-nums text-navy-900" dir="ltr">
                  {o.buyer_phone}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href={whatsappLink(o)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex bg-[#25D366] text-white shadow-sm hover:brightness-105 !px-4 !py-2"
              >
                <IconWhatsApp className="h-4 w-4" />
                {t("admin.order.whatsapp")}
              </a>
              {o.status === "new" && (
                <button
                  onClick={() => setStatus(o, "seen")}
                  className="btn-ghost !px-4 !py-2"
                >
                  <IconEye className="h-4 w-4" />
                  {t("admin.order.markSeen")}
                </button>
              )}
              {o.status !== "done" && (
                <button
                  onClick={() => setStatus(o, "done")}
                  className="btn-ghost !px-4 !py-2"
                >
                  <IconCheck className="h-4 w-4" />
                  {t("admin.order.markDone")}
                </button>
              )}
              <button
                onClick={() => remove(o)}
                aria-label={t("admin.order.delete")}
                className="ms-auto grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
