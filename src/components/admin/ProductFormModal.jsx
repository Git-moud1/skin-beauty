"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { IconClose, IconSparkle, IconEdit } from "@/components/icons";

export default function ProductFormModal({ product, onClose, onSaved }) {
  const { t, tError } = useLang();
  const toast = useToast();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [description, setDescription] = useState(product?.description || "");
  const [image, setImage] = useState(product?.image || "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
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

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "server_error");
      setImage(data.url);
    } catch (err) {
      toast.error(tError(err.message));
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price), description, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "server_error");
      onSaved(data.product);
    } catch (err) {
      toast.error(tError(err.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? t("admin.products.edit") : t("admin.products.add")}
    >
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative max-h-[92vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-4xl bg-white shadow-soft"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-50 bg-white/95 px-6 py-4 backdrop-blur">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <IconEdit className="h-5 w-5 text-rose-500" />
            {isEdit ? t("admin.products.edit") : t("admin.products.add")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("product.close")}
            className="grid h-11 w-11 place-items-center rounded-full text-navy-500 transition hover:bg-navy-50 hover:text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4 p-6">
          {/* Image uploader */}
          <div>
            <label className="label">{t("admin.product.image")}</label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-blush ring-1 ring-navy-100">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-rose-200">
                    <IconSparkle className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-outline w-full"
                  disabled={uploading}
                >
                  {uploading ? t("admin.product.uploading") : t("admin.product.upload")}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="pf-name">
              {t("admin.product.name")}
            </label>
            <input
              id="pf-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("admin.product.namePlaceholder")}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="pf-price">
              {t("admin.product.price")}
            </label>
            <input
              id="pf-price"
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t("admin.product.pricePlaceholder")}
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="pf-desc">
              {t("admin.product.description")}
            </label>
            <textarea
              id="pf-desc"
              className="input min-h-[90px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("admin.product.descPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              {t("admin.product.cancel")}
            </button>
            <button
              type="submit"
              className="btn-rose flex-1"
              disabled={busy || uploading}
            >
              {busy ? t("common.loading") : t("admin.product.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
