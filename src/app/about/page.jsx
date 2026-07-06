"use client";

import Link from "next/link";
import { useLang } from "@/i18n/LanguageProvider";
import {
  IconSparkle,
  IconShield,
  IconHeart,
  IconLeaf,
  IconArrow,
} from "@/components/icons";

export default function AboutPage() {
  const { t, isRTL } = useLang();

  const values = [
    { Icon: IconShield, title: t("about.value1.title"), desc: t("about.value1.desc") },
    { Icon: IconLeaf, title: t("about.value2.title"), desc: t("about.value2.desc") },
    { Icon: IconHeart, title: t("about.value3.title"), desc: t("about.value3.desc") },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 end-[-6rem] h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute bottom-0 start-[-6rem] h-96 w-96 rounded-full bg-navy-200/30 blur-3xl" />
      </div>

      <div className="container-max section-pad py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-600 shadow-card ring-1 ring-rose-100">
            <IconSparkle className="h-4 w-4" />
            {t("brand.tagline")}
          </span>
          <h1 className="heading-serif mt-5 text-4xl font-bold text-navy-900 sm:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-navy-600">
            {t("about.p1")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-navy-500">
            {t("about.p2")}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
          {values.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="card animate-fade-up p-7 text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-card">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/#products" className="btn-rose">
            {t("hero.cta")}
            <IconArrow className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </div>
    </div>
  );
}
