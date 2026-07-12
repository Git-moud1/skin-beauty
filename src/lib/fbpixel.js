// Thin, crash-proof wrapper around the Meta Pixel (fbq).
//
// Every helper checks that we're in the browser AND that window.fbq actually
// exists before calling it — so if an ad blocker blocks fbevents.js, or the
// script simply hasn't loaded yet, tracking silently no-ops instead of throwing
// and breaking the store.

// The currency for the whole store. Meta wants an ISO code; MRU = Mauritanian
// Ouguiya. Kept here so every event uses exactly the same value.
export const FB_CURRENCY = "MRU";

export function fbTrack(event, params = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params);
  } catch {
    // Analytics must never break the app.
  }
}

// Purchase must fire exactly once per order, even if the buyer reloads the
// confirmation screen. We remember which order ids have already been reported
// in sessionStorage (per-tab, cleared when the tab closes).
export function fbTrackPurchaseOnce(orderId, params = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (orderId == null) return;

  const key = `fb_purchase_${orderId}`;
  try {
    if (window.sessionStorage.getItem(key)) return; // already tracked
    window.sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage can be unavailable (private mode / blocked). Fall through
    // and fire anyway — a page reload resets component state, so a genuine
    // duplicate is unlikely without it.
  }

  fbTrack("Purchase", params);
}
