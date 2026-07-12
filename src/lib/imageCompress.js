"use client";

// Browser-side image compression, run BEFORE any upload.
//
// Goals (must behave identically on Android Chrome, iPhone/Safari and desktop
// Chrome/Edge/Firefox):
//   - Resize the longest edge down to MAX_EDGE (never upscale smaller images),
//     with NO assumption about shape (tall screenshots, squares all work).
//   - Re-encode to WebP q~0.85; fall back to JPEG where WebP export is missing.
//   - Respect EXIF orientation so phone photos are never sideways.
//   - Flatten transparency onto white so PNG/WebP alpha never turns black in the
//     JPEG fallback (a classic silent-failure source).
//   - Accept HEIC/HEIF from iPhones when decodable, throw a clear code when not.
//   - Reject non-images and oversized inputs with clear codes.
//
// Thrown errors carry a stable `.code` that maps to an `err.*` translation key.
// Nothing here fails silently: every path either returns a blob or throws a
// coded error the caller logs + surfaces.

export const MAX_EDGE = 1600; // px — cap on the longest side
export const QUALITY = 0.85; // WebP / JPEG quality
export const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB raw input ceiling

export class ImageError extends Error {
  constructor(code, cause) {
    super(code);
    this.name = "ImageError";
    this.code = code;
    if (cause) this.cause = cause;
  }
}

// Codes for which uploading the ORIGINAL file instead is worth trying (the
// format is browser-displayable, we just couldn't re-encode it client-side).
export const RECOVERABLE_CODES = new Set(["decode_failed", "compress_failed"]);

function looksLikeHeic(file) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return type.includes("heic") || type.includes("heif") || /\.(heic|heif)$/.test(name);
}

function isImageInput(file) {
  const type = (file.type || "").toLowerCase();
  // Some Android/iOS pickers hand back HEIC with an empty MIME type, so fall
  // back to the extension check for those.
  return type.startsWith("image/") || looksLikeHeic(file);
}

/** Best-effort extension for an original file (used by the upload fallback). */
export function extForFile(file) {
  const type = (file.type || "").toLowerCase();
  const byType = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  }[type];
  if (byType) return byType;
  const m = /\.([a-z0-9]+)$/.exec((file.name || "").toLowerCase());
  return m ? m[1] : "bin";
}

/** Lightweight, always-safe metadata for logging/UI (never throws). */
export function describeFile(file) {
  return {
    type: file?.type || "(none)",
    sizeKB: file ? Math.round(file.size / 1024) : 0,
    name: file?.name || "(unnamed)",
  };
}

/**
 * Decode a file into an <img>. Browsers apply EXIF orientation by default
 * (CSS image-orientation: from-image), so naturalWidth/Height and the pixels
 * drawn to a canvas are already upright on every modern browser. onload/onerror
 * are used (not decode()) because they are the most consistent across browsers.
 */
function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    let settled = false;

    const finish = (ok) => {
      if (settled) return;
      settled = true;
      if (ok && img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve({ img, cleanup: () => URL.revokeObjectURL(url) });
      } else {
        URL.revokeObjectURL(url);
        reject(new ImageError(looksLikeHeic(file) ? "heic_unsupported" : "decode_failed"));
      }
    };

    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, type, quality);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Compress an image File in the browser.
 * @returns {Promise<{blob: Blob, contentType: string, ext: string,
 *   previewUrl: string, width: number, height: number,
 *   inputType: string, inputSizeKB: number, outputSizeKB: number}>}
 * @throws {ImageError} with a coded `.code`
 */
export async function compressImage(file) {
  if (!file || typeof file === "string") throw new ImageError("no_file");
  if (!isImageInput(file)) throw new ImageError("not_image");
  if (file.size > MAX_INPUT_BYTES) throw new ImageError("too_large");

  const { img, cleanup } = await decodeImage(file);
  try {
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    // Shape-agnostic: scale by the longest edge, never upscale.
    const scale = Math.min(1, MAX_EDGE / Math.max(naturalW, naturalH));
    const width = Math.max(1, Math.round(naturalW * scale));
    const height = Math.max(1, Math.round(naturalH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImageError("compress_failed");

    // White backdrop flattens any alpha channel (PNG/WebP/screenshots) so the
    // JPEG fallback never produces black regions, and product photos sit on the
    // site's white cards cleanly.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Try WebP first; browsers without WebP canvas export (older Safari) return
    // PNG for that request, so detect the mismatch and fall back to JPEG.
    let blob = await canvasToBlob(canvas, "image/webp", QUALITY);
    let contentType = "image/webp";
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", QUALITY);
      contentType = "image/jpeg";
      ext = "jpg";
    }
    if (!blob || blob.size === 0) throw new ImageError("compress_failed");

    return {
      blob,
      contentType,
      ext,
      previewUrl: URL.createObjectURL(blob),
      width,
      height,
      naturalWidth: naturalW,
      naturalHeight: naturalH,
      inputType: file.type || "(none)",
      inputSizeKB: Math.round(file.size / 1024),
      outputSizeKB: Math.round(blob.size / 1024),
    };
  } finally {
    cleanup();
  }
}
