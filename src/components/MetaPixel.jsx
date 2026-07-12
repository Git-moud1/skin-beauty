"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Read at build time from the environment — never hardcode the id.
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Meta Pixel loader + PageView tracker.
//
// Mounted once in the root layout so it runs on every customer page (both the
// Arabic RTL and French LTR routes). It:
//   1. loads fbevents.js and fires the initial PageView, and
//   2. re-fires PageView on client-side navigation — the App Router does NOT
//      reload the page between routes, so fbq would otherwise only ever see the
//      first page the visitor landed on.
//
// It renders nothing (and tracks nothing) when the id is missing, or on /admin
// pages — tracking is for customers only.
export default function MetaPixel() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const disabled = !PIXEL_ID || isAdmin;

  // Skip the very first run: the inline init script below already fires the
  // initial PageView. From then on, every route change fires one manually.
  const initialized = useRef(false);

  useEffect(() => {
    if (disabled) return;
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname, disabled]);

  if (disabled) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
