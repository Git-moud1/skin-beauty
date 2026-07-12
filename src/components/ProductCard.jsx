"use client";

import Image from "next/image";
import { useLang } from "@/i18n/LanguageProvider";
import { IconBag, IconEye, IconSparkle, IconSpinner } from "@/components/icons";

export default function ProductCard({ product, index = 0, onBuy, onDetails, busy }) {
  const { t, price } = useLang();

  return (
    <article
      className="group card animate-fade-up overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
      style={{ animationDelay: `${Math.min(index * 55, 400)}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-blush">
        <button
          type="button"
          onClick={() => onDetails(product)}
          className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
          aria-label={`${t("product.details")}: ${product.name}`}
        />
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
            priority={index < 4}
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-rose-200">
            <IconSparkle className="h-16 w-16" />
          </div>
        )}

        {/* Quick view badge on hover */}
        <span className="pointer-events-none absolute end-3 top-3 z-[2] flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy-700 opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <IconEye className="h-3.5 w-3.5" />
          {t("product.details")}
        </span>

        {/* Soft gradient at bottom for depth */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy-900/10 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-base font-semibold leading-snug text-navy-900">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold tabular-nums text-rose-600">
            {price(product.price)}
          </span>
        </div>

        <button
          onClick={() => onBuy(product)}
          disabled={busy}
          className="btn-rose mt-1 w-full !py-2.5"
        >
          {busy ? (
            <>
              <IconSpinner className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </>
          ) : (
            <>
              <IconBag className="h-4 w-4" />
              {t("product.buy")}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
