"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { compressImage } from "@/lib/imageCompress";
import { uploadImage } from "@/lib/uploadImage";
import { IconClose, IconSparkle, IconEdit } from "@/components/icons";

export default function ProductFormModal({ product, onClose, onSaved }) {
  const { t, tError } = useLang();
  const toast = useToast();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [description, setDescription] = useState(product?.description || "");
  const [image, setImage] = useState(product?.image || "");
  const [preview, setPreview] = useState(product?.image || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const previewRef = useRef(null); // object URL to revoke
  const panelRef = useFocusTrap();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, [onClose]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    // Reset the input so re-picking the same file fires onChange again.
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      // 1) Compress + resize in the browser (WebP/JPEG, EXIF-corrected).
      const compressed = await compressImage(file);
      // Instant local preview from the compressed blob.
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = compressed.previewUrl;
      setPreview(compressed.previewUrl);

      // 2) Upload straight to Blob (with multipart fallback), tracking progress.
      const url = await uploadImage(compressed, setProgress);
      setImage(url);
    } catch (err) {
      // Revert the preview to the last committed image so we never save a URL
      // that doesn't match what's shown.
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setPreview(image);
      toast.error(tError(err.message || err.code));
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
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-rose-200">
                    <IconSparkle className="h-8 w-8" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-navy-900/45 text-xs font-semibold text-white backdrop-blur-sm">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                    <span dir="ltr" className="tabular-nums">{progress}%</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.heic,.heif"
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
                {uploading && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-[width] duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
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
