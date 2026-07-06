"use client";

import Link from "next/link";
import { useLang } from "@/i18n/LanguageProvider";
import {
  IconSparkle,
  IconShield,
  IconTruck,
  IconHeart,
  IconArrow,
} from "@/components/icons";

export default function Hero() {
  const { t, isRTL } = useLang();

  // Reliable in-page scroll (Next <Link href="#hash"> often doesn't scroll on
  // mobile browsers). scrollIntoView respects the section's scroll-mt offset.
  function scrollToProducts(e) {
    e.preventDefault();
    const el = document.getElementById("products");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#products");
    }
  }

  const badges = [
    { Icon: IconShield, label: t("hero.badge1") },
    { Icon: IconTruck, label: t("hero.badge2") },
    { Icon: IconHeart, label: t("hero.badge3") },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Soft decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 end-[-6rem] h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] start-[-6rem] h-96 w-96 rounded-full bg-navy-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-blush via-cream to-cream" />
      </div>

      <div className="container-max section-pad grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:py-24">
        {/* Text */}
        <div className="text-center lg:text-start">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-600 shadow-card ring-1 ring-rose-100">
            <IconSparkle className="h-4 w-4" />
            {t("hero.eyebrow")}
          </span>

          <h1 className="mt-5 animate-fade-up text-4xl font-bold leading-[1.12] text-navy-900 [animation-delay:80ms] sm:text-5xl lg:text-6xl">
            <span className="heading-serif">{t("hero.title")}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg animate-fade-up text-base leading-relaxed text-navy-500 [animation-delay:160ms] lg:mx-0 lg:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex animate-fade-up flex-col items-center gap-3 [animation-delay:240ms] sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#products"
              onClick={scrollToProducts}
              className="btn-rose w-full sm:w-auto"
            >
              {t("hero.cta")}
              <IconArrow className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </a>
            <Link href="/about" className="btn-ghost w-full sm:w-auto">
              {t("hero.cta2")}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex animate-fade-up flex-wrap justify-center gap-x-6 gap-y-3 [animation-delay:320ms] lg:justify-start">
            {badges.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-navy-600"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-rose-500 shadow-sm ring-1 ring-rose-100">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="relative animate-scale-in [animation-delay:120ms]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] shadow-soft ring-1 ring-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80"
              alt="Korean skincare"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/25 to-transparent" />
          </div>

          {/* Floating price/rating cards */}
          <div className="absolute -bottom-4 start-2 flex animate-float items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-soft backdrop-blur sm:start-[-1rem]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-600">
              <IconHeart className="h-5 w-5" />
            </span>
            <div className="text-start leading-tight">
              <p className="text-sm font-bold text-navy-900">100%</p>
              <p className="text-xs text-navy-500">K-Beauty</p>
            </div>
          </div>
          <div className="absolute -top-3 end-2 hidden animate-float items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 shadow-soft backdrop-blur [animation-delay:1.5s] sm:end-[-1rem] sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-100 text-navy-700">
              <IconSparkle className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-navy-900">Glow ✦</p>
          </div>
        </div>
      </div>
    </section>
  );
}
