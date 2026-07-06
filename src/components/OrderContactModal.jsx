"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { isValidPhone, normalizePhone } from "@/lib/validation";
import { IconClose, IconBag, IconSpinner } from "@/components/icons";

// Asks the buyer which number to be contacted on (prefilled from their account
// but editable — the sign-up number may not be the best one to reach them).
export default function OrderContactModal({
  product,
  defaultName = "",
  defaultPhone = "",
  busy = false,
  onConfirm,
  onClose,
}) {
  const { t, price, isRTL } = useLang();
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [error, setError] = useState("");
  const panelRef = useFocusTrap({ autoFocus: false });

  function submit(e) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError(t("err.invalid_phone"));
      return;
    }
    setError("");
    onConfirm({ name: name.trim(), phone: normalizePhone(phone) });
  }

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("order.contact.title")}
    >
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={busy ? undefined : onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-4xl bg-white shadow-soft"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-rose-50 via-white to-navy-50 px-6 pb-5 pt-7 text-center sm:px-8">
          <button
            onClick={onClose}
            disabled={busy}
            aria-label={t("product.close")}
            className="absolute end-3 top-3 grid h-11 w-11 place-items-center rounded-full text-navy-500 transition hover:bg-navy-50 hover:text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-40"
          >
            <IconClose className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-card">
            <IconBag className="h-7 w-7" />
          </div>
          <h2 className="heading-serif text-2xl font-bold text-navy-900">
            {t("order.contact.title")}
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            {t("order.contact.subtitle")}
          </p>
        </div>

        {/* Product summary */}
        <div className="mx-6 -mt-1 mb-1 flex items-center gap-3 rounded-2xl bg-blush p-3 sm:mx-8">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-navy-50">
            {product?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy-900">
              {product?.name}
            </p>
            <p className="text-sm font-bold tabular-nums text-rose-600">
              {product ? price(product.price) : ""}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 pb-7 pt-3 sm:px-8">
          <div>
            <label className="label" htmlFor="oc-name">
              {t("auth.name")}
            </label>
            <input
              id="oc-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.namePlaceholder")}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="label" htmlFor="oc-phone">
              {t("order.contact.phone")}
            </label>
            <input
              id="oc-phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("auth.phonePlaceholder")}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
            <p className="mt-1.5 text-xs text-navy-500">
              {t("order.contact.phoneHint")}
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn-ghost flex-1"
            >
              {t("order.contact.cancel")}
            </button>
            <button type="submit" className="btn-rose flex-[1.4]" disabled={busy}>
              {busy ? (
                <>
                  <IconSpinner className="h-5 w-5 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <IconBag className="h-5 w-5" />
                  {t("order.contact.confirm")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
