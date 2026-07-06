"use client";

import { useEffect } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { IconClose, IconBag, IconSparkle, IconSpinner } from "@/components/icons";

export default function ProductModal({ product, onClose, onBuy, busy }) {
  const { t, price } = useLang();
  const panelRef = useFocusTrap();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative grid w-full max-w-3xl animate-scale-in overflow-hidden rounded-4xl bg-white shadow-soft md:grid-cols-2"
      >
        <button
          onClick={onClose}
          aria-label={t("product.close")}
          className="absolute end-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-navy-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <IconClose className="h-5 w-5" />
        </button>

        {/* Image */}
        <div className="relative aspect-square bg-blush md:aspect-auto">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[280px] w-full items-center justify-center text-rose-200">
              <IconSparkle className="h-20 w-20" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col p-6 sm:p-8">
          <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            <IconSparkle className="h-3.5 w-3.5" />
            {t("brand.tagline")}
          </span>
          <h2 className="heading-serif text-2xl font-bold leading-snug text-navy-900">
            {product.name}
          </h2>
          <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-navy-500">
            {product.description || ""}
          </p>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-navy-50 pt-5">
            <span className="text-2xl font-bold tabular-nums text-rose-600">
              {price(product.price)}
            </span>
          </div>
          <button
            onClick={() => onBuy(product)}
            disabled={busy}
            className="btn-rose mt-4 w-full"
          >
            {busy ? (
              <>
                <IconSpinner className="h-5 w-5 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <IconBag className="h-5 w-5" />
                {t("product.orderNow")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
