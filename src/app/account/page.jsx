"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { useAuthModal } from "@/components/AuthModal";
import AccountForm from "@/components/AccountForm";
import { IconBag, IconUser } from "@/components/icons";

function StatusPill({ status }) {
  const { t } = useLang();
  const map = {
    new: "bg-rose-100 text-rose-700",
    seen: "bg-navy-100 text-navy-700",
    done: "bg-green-100 text-green-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] || map.new}`}>
      {t(`status.${status}`)}
    </span>
  );
}

export default function AccountPage() {
  const { t, price, dateTime } = useLang();
  const { user, loading, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!loading && isAdmin) router.replace("/admin");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (user && !isAdmin) {
      fetch("/api/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setOrders(d.orders || []))
        .catch(() => {});
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="container-max section-pad py-24 text-center text-navy-500">
        {t("common.loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-max section-pad flex flex-col items-center gap-4 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-400">
          <IconUser className="h-8 w-8" />
        </span>
        <p className="text-lg font-medium text-navy-600">{t("nav.login")}</p>
        <button onClick={() => openAuth("login")} className="btn-rose">
          {t("auth.login")}
        </button>
      </div>
    );
  }

  return (
    <div className="container-max section-pad py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="heading-serif text-3xl font-bold text-navy-900 sm:text-4xl">
          {t("account.title")}
        </h1>
        <p className="mt-2 text-navy-500">{t("account.subtitle")}</p>
      </header>

      <AccountForm />

      {/* My orders */}
      <section className="mt-12">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-navy-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-600">
            <IconBag className="h-5 w-5" />
          </span>
          {t("account.myOrders")}
        </h2>

        {orders.length === 0 ? (
          <div className="card p-10 text-center text-navy-500">
            {t("account.noOrders")}
          </div>
        ) : (
          <div className="grid gap-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="card flex w-full max-w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 p-4 sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold text-navy-900 sm:truncate">
                    {o.product_name}
                  </p>
                  <p className="text-xs text-navy-500">{dateTime(o.created_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-bold tabular-nums text-rose-600">
                    {price(o.price)}
                  </span>
                  <StatusPill status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
