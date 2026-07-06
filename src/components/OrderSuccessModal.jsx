"use client";

import { useEffect } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { IconCheck } from "@/components/icons";

export default function OrderSuccessModal({ product, onClose }) {
  const { t, price } = useLang();
  const panelRef = useFocusTrap();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[950] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-sm animate-scale-in rounded-4xl bg-white p-8 text-center shadow-soft"
      >
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-card">
          <IconCheck className="h-10 w-10" strokeWidth={2.4} />
        </div>
        <h2 className="heading-serif text-2xl font-bold text-navy-900">
          {t("order.success.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          {t("order.success.msg")}
        </p>
        {product && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl bg-blush px-4 py-3 text-sm">
            <span className="max-w-full break-words font-semibold text-navy-800">
              {product.name}
            </span>
            <span className="text-navy-300">·</span>
            <span className="font-bold text-rose-600">{price(product.price)}</span>
          </div>
        )}
        <button onClick={onClose} className="btn-rose mt-6 w-full">
          {t("order.success.close")}
        </button>
      </div>
    </div>
  );
}
