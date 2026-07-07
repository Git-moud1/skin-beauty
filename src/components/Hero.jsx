"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import {
  IconSparkle,
  IconShield,
  IconTruck,
  IconHeart,
  IconArrow,
} from "@/components/icons";

/* Small 4-point sparkle used for the twinkling accents around the logo. */
function Sparkle({ className = "", style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`pointer-events-none absolute animate-twinkle ${className}`}
      style={style}
    >
      <path
        d="M12 0c.6 5.4 3 7.8 12 12-9 4.2-11.4 6.6-12 12-.6-5.4-3-7.8-12-12 9-4.2 11.4-6.6 12-12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Hero() {
  const { t, isRTL } = useLang();
  const cardRef = useRef(null);
  const frame = useRef(0);

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

  // 3D tilt — pointer-driven, rAF-throttled. Disabled for touch devices and
  // for users who prefer reduced motion (mobile stays calm & smooth).
  const onPointerMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotY = (px - 0.5) * 14; // deg
    const rotX = (0.5 - py) * 14; // deg

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      card.style.setProperty("--rx", `${rotX.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${rotY.toFixed(2)}deg`);
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });
  }, []);

  const onPointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(frame.current);
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  }, []);

  const badges = [
    { Icon: IconShield, label: t("hero.badge1") },
    { Icon: IconTruck, label: t("hero.badge2") },
    { Icon: IconHeart, label: t("hero.badge3") },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient + soft decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 animate-gradient-shift bg-[length:300%_300%]"
          style={{
            backgroundImage:
              "linear-gradient(120deg, #fff7fb 0%, #ffe6ef 22%, #eef1fb 48%, #fff5f8 72%, #fffdfb 100%)",
          }}
        />
        <div className="absolute -top-24 end-[-6rem] h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] start-[-6rem] h-96 w-96 rounded-full bg-navy-200/35 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-cream" />
      </div>

      <div className="container-max section-pad grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:py-24">
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

        {/* Visual — animated pseudo-3D logo showcase */}
        <div className="relative mx-auto w-full max-w-[24rem] animate-hero-in [perspective:1200px] sm:max-w-[26rem]">
          {/* Pulsing rose halo behind the logo */}
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 animate-glow-pulse rounded-[3rem] blur-2xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 45%, rgba(255,111,161,0.55), rgba(191,18,89,0.25) 45%, transparent 72%)",
            }}
          />

          {/* Tilt card */}
          <div
            ref={cardRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="group relative [transform-style:preserve-3d] will-change-transform"
            style={{
              transform:
                "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
              transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Idle float wrapper (composes with the tilt) */}
            <div className="animate-float-slow [transform-style:preserve-3d]">
              {/* Glass frame */}
              <div className="glass relative rounded-[2.2rem] p-3 shadow-[0_30px_70px_-24px_rgba(191,18,89,0.45),0_10px_30px_-12px_rgba(31,41,90,0.25)] ring-1 ring-white/70 [transform-style:preserve-3d]">
                {/* Logo, lifted for depth */}
                <div
                  className="overflow-hidden rounded-[1.7rem] bg-white ring-1 ring-rose-100/70"
                  style={{ transform: "translateZ(45px)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/hero-logo.webp"
                    alt={t("hero.logoAlt")}
                    width={1146}
                    height={1502}
                    fetchPriority="high"
                    decoding="async"
                    className="block h-auto w-full select-none"
                    draggable={false}
                  />
                </div>

                {/* Soft moving glare that follows the cursor */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 rounded-[1.7rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(240px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.55), transparent 60%)",
                  }}
                />
              </div>
            </div>

            {/* Sparkle accents (lifted in 3D for magic) */}
            <Sparkle
              className="-top-3 end-6 h-6 w-6 text-rose-400"
              style={{ transform: "translateZ(70px)", animationDelay: "0.2s" }}
            />
            <Sparkle
              className="top-10 start-[-0.75rem] h-4 w-4 text-navy-300"
              style={{ transform: "translateZ(60px)", animationDelay: "1.1s" }}
            />
            <Sparkle
              className="bottom-6 end-[-0.5rem] h-5 w-5 text-rose-300"
              style={{ transform: "translateZ(65px)", animationDelay: "1.9s" }}
            />
            <Sparkle
              className="-bottom-2 start-10 h-3.5 w-3.5 text-rose-400"
              style={{ transform: "translateZ(55px)", animationDelay: "2.6s" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
