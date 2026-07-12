"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import {
  compressImage,
  describeFile,
  extForFile,
  RECOVERABLE_CODES,
} from "@/lib/imageCompress";
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
  const [uploadInfo, setUploadInfo] = useState(""); // diagnostics for the selected file
  const [imageError, setImageError] = useState(""); // exact failure, shown in the UI
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

    const info = describeFile(file); // { type, sizeKB, name } — never throws
    setUploading(true);
    setProgress(0);
    setImageError("");
    setUploadInfo(`${info.type} · ${info.sizeKB} KB`);
    console.info("[image] selected:", info);

    // 1) Compress in the browser. On a *recoverable* failure (a displayable
    //    format we simply couldn't re-encode), fall back to uploading the
    //    ORIGINAL file so a usable image is never lost.
    let payload = null;
    let usedOriginal = false;
    try {
      payload = await compressImage(file);
      console.info("[image] compressed:", {
        from: `${payload.naturalWidth}×${payload.naturalHeight} ${payload.inputType} ${payload.inputSizeKB}KB`,
        to: `${payload.width}×${payload.height} ${payload.contentType} ${payload.outputSizeKB}KB`,
      });
      setUploadInfo(
        `${payload.naturalWidth}×${payload.naturalHeight} · ${payload.inputType} ${payload.inputSizeKB}KB → ${payload.contentType} ${payload.outputSizeKB}KB`
      );
    } catch (err) {
      const code = err?.code || err?.message || "compress_failed";
      console.warn("[image] compression failed:", code, err);
      if (RECOVERABLE_CODES.has(code)) {
        console.info("[image] falling back to uploading the original file");
        payload = {
          blob: file,
          contentType: file.type || "application/octet-stream",
          ext: extForFile(file),
        };
        usedOriginal = true;
        setUploadInfo(`${info.type} · ${info.sizeKB}KB — ${t("admin.product.original")}`);
      } else {
        // not_image / too_large / heic_unsupported → hard stop, no upload.
        setImageError(`${info.type} · ${info.sizeKB}KB — ${code}`);
        toast.error(tError(code));
        setUploading(false);
        return;
      }
    }

    // Instant local preview (compressed blob, or the raw original file).
    const previewSrc = payload.previewUrl || URL.createObjectURL(payload.blob);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = previewSrc;
    setPreview(previewSrc);

    // 2) Upload. If it fails, abort cleanly — keep the previously committed
    //    image (if editing) and NEVER let the form save an empty/broken URL.
    try {
      const url = await uploadImage(payload, setProgress);
      setImage(url);
      console.info("[image] upload complete:", url, usedOriginal ? "(original)" : "");
    } catch (err) {
      const code = err?.message || err?.code || "server_error";
      console.error("[image] upload failed:", code, err);
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setPreview(image); // revert to the last committed image (may be empty)
      setImageError(`${info.type} · ${info.sizeKB}KB — ${code}`);
      toast.error(tError(code));
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    // Guard: never save while an upload is running or with an empty image URL.
    if (uploading) return;
    if (!image) {
      setImageError(t("admin.product.imageRequired"));
      toast.error(t("admin.product.imageRequired"));
      return;
    }
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

            {/* Diagnostics: exact type · size · dimensions of the selected file,
                and the exact error if compression/upload failed. */}
            {uploadInfo && !imageError && (
              <p dir="ltr" className="mt-2 break-all text-start font-mono text-[11px] leading-tight text-navy-400">
                {uploadInfo}
              </p>
            )}
            {imageError && (
              <p dir="ltr" className="mt-2 break-all text-start font-mono text-[11px] leading-tight text-rose-600">
                {imageError}
              </p>
            )}
            {!image && !uploading && (
              <p className="mt-2 text-xs text-navy-400">
                {t("admin.product.imageRequired")}
              </p>
            )}
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
              disabled={busy || uploading || !image}
            >
              {busy ? t("common.loading") : t("admin.product.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
