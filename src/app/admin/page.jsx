"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { useAuthModal } from "@/components/AuthModal";
import { useToast } from "@/context/ToastProvider";
import OrdersPanel from "@/components/admin/OrdersPanel";
import ProductsPanel from "@/components/admin/ProductsPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import ClientsPanel from "@/components/admin/ClientsPanel";
import AccountForm from "@/components/AccountForm";
import {
  IconBell,
  IconBox,
  IconGear,
  IconUser,
  IconShield,
  IconKey,
} from "@/components/icons";

const POLL_MS = 12000;

export default function AdminPage() {
  const { t } = useLang();
  const { user, loading, isAdmin } = useAuth();
  const { openAuth } = useAuthModal();
  const toast = useToast();
  const router = useRouter();

  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);
  const prevNewRef = useRef(0);

  const loadOrders = useCallback(
    async (notify = false) => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setOrders(data.orders || []);
        const count = data.newCount ?? 0;
        if (notify && count > prevNewRef.current) {
          toast.info(`${t("admin.newOrders")}: ${count}`);
        }
        prevNewRef.current = count;
        setNewCount(count);
      } catch {}
    },
    [toast, t]
  );

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      setSettings(data.settings || {});
    } catch {}
  }, []);

  // Initial load (admin only).
  useEffect(() => {
    if (loading) return;
    if (!isAdmin) return;
    Promise.all([loadOrders(), loadProducts(), loadSettings()]).then(() =>
      setLoaded(true)
    );
  }, [loading, isAdmin, loadOrders, loadProducts, loadSettings]);

  // Poll for new orders (near-instant notification).
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(() => loadOrders(true), POLL_MS);
    return () => clearInterval(id);
  }, [isAdmin, loadOrders]);

  if (loading) {
    return (
      <div className="container-max section-pad py-24 text-center text-navy-500">
        {t("common.loading")}
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container-max section-pad flex flex-col items-center gap-4 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-navy-50 text-navy-400">
          <IconShield className="h-8 w-8" />
        </span>
        <p className="text-lg font-medium text-navy-600">
          {t("nav.admin")} — {t("nav.login")}
        </p>
        <button onClick={() => openAuth("login")} className="btn-rose">
          {t("auth.login")}
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "orders", label: t("admin.tab.orders"), Icon: IconBell, badge: newCount },
    { id: "products", label: t("admin.tab.products"), Icon: IconBox },
    { id: "clients", label: t("admin.tab.clients"), Icon: IconKey },
    { id: "settings", label: t("admin.tab.settings"), Icon: IconGear },
    { id: "account", label: t("admin.tab.account"), Icon: IconUser },
  ];

  return (
    <div className="container-max section-pad py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="heading-serif text-3xl font-bold text-navy-900 sm:text-4xl">
          {t("admin.title")}
        </h1>
        <p className="mt-2 text-navy-500">{t("admin.subtitle")}</p>
      </header>

      {/* Tabs — wrap to multiple rows on small screens so none are hidden */}
      <div className="mb-8 flex flex-wrap gap-2 rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-navy-50">
        {tabs.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              if (id === "orders") loadOrders();
            }}
            className={`relative flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all sm:px-4 ${
              tab === id
                ? "bg-navy-800 text-white shadow-sm"
                : "text-navy-600 hover:bg-navy-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {badge > 0 && (
              <span
                className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[11px] font-bold ${
                  tab === id ? "bg-rose-500 text-white" : "bg-rose-500 text-white"
                } animate-pulse`}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panels */}
      {!loaded ? (
        <div className="py-20 text-center text-navy-500">{t("common.loading")}</div>
      ) : (
        <div className="animate-fade-in">
          {tab === "orders" && (
            <OrdersPanel orders={orders} onChange={() => loadOrders()} />
          )}
          {tab === "products" && (
            <ProductsPanel products={products} onChange={loadProducts} />
          )}
          {tab === "clients" && <ClientsPanel />}
          {tab === "settings" && (
            <SettingsPanel
              settings={settings}
              onChange={(s) => setSettings(s)}
            />
          )}
          {tab === "account" && (
            <div className="max-w-4xl">
              <AccountForm />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
