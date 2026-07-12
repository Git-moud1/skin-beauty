"use client";

import { upload } from "@vercel/blob/client";

// Uploads an already-compressed image blob and returns its public URL.
//
// Primary path: Vercel Blob CLIENT upload — the file streams straight from the
// browser to Blob storage, bypassing the ~4.5 MB serverless request-body limit
// entirely. Auth + type/size limits are enforced by /api/blob/upload.
//
// Fallback path (local dev without a Blob token, or if client upload fails):
// a plain multipart POST to /api/upload, which writes to the local disk. Both
// paths report progress via onProgress(percent 0..100).

function randomName(ext) {
  const rand =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(6)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      : Math.random().toString(16).slice(2, 14);
  return `${Date.now()}-${rand}.${ext}`;
}

function uploadMultipart(blob, ext, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const file = new File([blob], randomName(ext), { type: contentType });
    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url);
      else reject(new Error(data.error || "server_error"));
    };
    xhr.onerror = () => reject(new Error("server_error"));
    xhr.send(fd);
  });
}

export async function uploadImage({ blob, contentType, ext }, onProgress) {
  onProgress?.(0);
  try {
    const result = await upload(`products/${randomName(ext)}`, blob, {
      access: "public",
      contentType,
      handleUploadUrl: "/api/blob/upload",
      onUploadProgress: (e) => onProgress?.(Math.round(e.percentage)),
    });
    console.info("[upload] client upload OK →", result.url);
    return result.url;
  } catch (clientErr) {
    // Client upload unavailable (e.g. dev without BLOB_READ_WRITE_TOKEN) or it
    // failed mid-flight — fall back to the multipart route.
    console.warn("[upload] client upload failed, trying multipart:", clientErr);
    try {
      const url = await uploadMultipart(blob, ext, contentType, onProgress);
      console.info("[upload] multipart upload OK →", url);
      return url;
    } catch (multipartErr) {
      // Surface the most specific real error we have. The multipart route
      // returns coded server errors (invalid_type, too_large, forbidden, …).
      console.error("[upload] multipart upload also failed:", multipartErr);
      throw multipartErr;
    }
  }
}
