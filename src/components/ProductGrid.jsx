"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { useAuthModal } from "@/components/AuthModal";
import { useToast } from "@/context/ToastProvider";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import OrderContactModal from "@/components/OrderContactModal";
import OrderSuccessModal from "@/components/OrderSuccessModal";
import { fbTrack, fbTrackPurchaseOnce, FB_CURRENCY } from "@/lib/fbpixel";
import { IconSearch, IconSparkle } from "@/components/icons";

export default function ProductGrid() {
  const { t, tError } = useLang();
  const { user } = useAuth();
  const { requireAuth } = useAuthModal();
  const toast = useToast();

  const [products, setProducts] = useState(null); // null = loading
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [contactFor, setContactFor] = useState(null); // product awaiting contact info
  const [orderingId, setOrderingId] = useState(null); // id of product being ordered
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return null;
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const placeOrder = useCallback(
    async (product, contact) => {
      setOrderingId(product.id);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            buyerName: contact.name,
            buyerPhone: contact.phone,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "server_error");

        // Purchase fires only after the order is actually created, and only
        // once per order id (guards against confirmation-screen reloads).
        const order = data.order;
        fbTrackPurchaseOnce(order?.id, {
          value: order?.price ?? product.price,
          currency: FB_CURRENCY,
          content_ids: [product.id],
          content_type: "product",
        });

        setContactFor(null);
        setDetail(null);
        setSuccess(product);
      } catch (err) {
        toast.error(tError(err.message));
      } finally {
        setOrderingId(null);
      }
    },
    [toast, tError]
  );

  // Buying requires login, then we ask which number to be contacted on.
  const handleBuy = useCallback(
    (product) => {
      // Tapping "Buy" is the add-to-cart intent for this single-item store.
      fbTrack("AddToCart", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: product.price,
        currency: FB_CURRENCY,
      });
      requireAuth(() => {
        setDetail(null);
        setContactFor(product);
        // Checkout begins once the contact/confirmation form is shown.
        fbTrack("InitiateCheckout", {
          value: product.price,
          currency: FB_CURRENCY,
          num_items: 1,
          content_ids: [product.id],
          content_type: "product",
        });
      });
    },
    [requireAuth]
  );

  return (
    <section id="products" className="container-max section-pad scroll-mt-24 py-14 sm:py-20">
      {/* Section header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600">
          <IconSparkle className="h-3.5 w-3.5" />
          {t("brand.tagline")}
        </span>
        <h2 className="heading-serif text-3xl font-bold text-navy-900 sm:text-4xl">
          {t("products.title")}
        </h2>
        <p className="mt-3 max-w-xl text-navy-500">{t("products.subtitle")}</p>

        {/* Search */}
        <div className="relative mt-7 w-full max-w-md">
          <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-navy-300">
            <IconSearch className="h-5 w-5" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("products.search")}
            className="input !rounded-full ps-12"
            aria-label={t("products.search")}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered === null ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="shimmer aspect-square" />
              <div className="space-y-3 p-5">
                <div className="shimmer h-4 w-3/4 rounded" />
                <div className="shimmer h-4 w-1/3 rounded" />
                <div className="shimmer h-10 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-300">
            <IconSparkle className="h-8 w-8" />
          </span>
          <p className="text-lg font-medium text-navy-500">
            {t("products.empty")}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-navy-500">
            {filtered.length} {t("products.count")}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                onBuy={handleBuy}
                onDetails={setDetail}
                busy={orderingId === p.id}
              />
            ))}
          </div>
        </>
      )}

      {detail && (
        <ProductModal
          product={detail}
          onClose={() => setDetail(null)}
          onBuy={handleBuy}
          busy={orderingId === detail.id}
        />
      )}
      {contactFor && (
        <OrderContactModal
          product={contactFor}
          defaultName={user?.name || ""}
          defaultPhone={user?.phone || ""}
          busy={orderingId === contactFor.id}
          onConfirm={(contact) => placeOrder(contactFor, contact)}
          onClose={() => setContactFor(null)}
        />
      )}
      {success && (
        <OrderSuccessModal product={success} onClose={() => setSuccess(null)} />
      )}
    </section>
  );
}
