"use client";

// Browser-side image compression, run BEFORE any upload.
//
// Goals (must behave identically on Android Chrome, iPhone/Safari and desktop
// Chrome/Edge/Firefox):
//   - Resize the longest edge down to MAX_EDGE (never upscale smaller images).
//   - Re-encode to WebP q~0.85; fall back to JPEG where WebP export is missing.
//   - Respect EXIF orientation so phone photos are never sideways.
//   - Accept HEIC/HEIF from iPhones when the browser can decode it, and throw a
//     clear, translatable code when it cannot (instead of failing silently).
//   - Reject non-images and oversized inputs with clear codes.
//
// Thrown errors carry a stable `.code` that maps to an `err.*` translation key.

export const MAX_EDGE = 1600; // px — cap on the longest side
export const QUALITY = 0.85; // WebP / JPEG quality
export const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB raw input ceiling

class ImageError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function looksLikeHeic(file) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return (
    type.includes("heic") ||
    type.includes("heif") ||
    /\.(heic|heif)$/.test(name)
  );
}

function isImageInput(file) {
  const type = (file.type || "").toLowerCase();
  // Some Android/iOS pickers hand back HEIC with an empty MIME type, so fall
  // back to the extension check for those.
  return type.startsWith("image/") || looksLikeHeic(file);
}

/**
 * Decode a file into an <img>. Browsers apply EXIF orientation by default
 * (CSS image-orientation: from-image), so naturalWidth/Height and the pixels
 * drawn to a canvas are already upright on every modern browser.
 */
function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    const cleanup = () => URL.revokeObjectURL(url);

    const done = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        cleanup();
        reject(new ImageError(looksLikeHeic(file) ? "heic_unsupported" : "decode_failed"));
        return;
      }
      resolve({ img, cleanup });
    };

    // Prefer decode() (rejects cleanly on undecodable formats like HEIC on
    // non-Safari); fall back to load/error events for older browsers.
    img.onload = done;
    img.onerror = () => {
      cleanup();
      reject(new ImageError(looksLikeHeic(file) ? "heic_unsupported" : "decode_failed"));
    };
    img.src = url;
    if (typeof img.decode === "function") {
      img.decode().then(done).catch(() => {
        // Leave onload/onerror to settle; if the image genuinely can't decode,
        // onerror fires. If decode() rejected only due to detachment, onload
        // still resolves it.
      });
    }
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Compress an image File in the browser.
 * @returns {Promise<{blob: Blob, contentType: string, ext: string, previewUrl: string}>}
 */
export async function compressImage(file) {
  if (!file || typeof file === "string") throw new ImageError("no_file");
  if (!isImageInput(file)) throw new ImageError("not_image");
  if (file.size > MAX_INPUT_BYTES) throw new ImageError("too_large");

  const { img, cleanup } = await decodeImage(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImageError("decode_failed");
    // White backdrop so the JPEG fallback (no alpha) never turns transparent
    // pixels black. Product photos are opaque, so this is a no-op for them.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Try WebP; browsers without WebP canvas export (older Safari) silently
    // return PNG, so detect that and fall back to JPEG.
    let blob = await canvasToBlob(canvas, "image/webp", QUALITY);
    let contentType = "image/webp";
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", QUALITY);
      contentType = "image/jpeg";
      ext = "jpg";
    }
    if (!blob) throw new ImageError("compress_failed");

    return { blob, contentType, ext, previewUrl: URL.createObjectURL(blob) };
  } finally {
    cleanup();
  }
}
