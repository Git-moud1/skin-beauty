"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/i18n/LanguageProvider";
import {
  IconWhatsApp,
  IconSnapchat,
  IconFacebook,
  IconTikTok,
  IconBag,
  IconHeart,
} from "@/components/icons";

export default function Footer() {
  const { t } = useLang();
  const [settings, setSettings] = useState({
    whatsapp: "48011609",
    snapchat: "routin4801",
    facebook: "",
    tiktok: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => d.settings && setSettings((s) => ({ ...s, ...d.settings })))
      .catch(() => {});
  }, []);

  const waNumber = (settings.whatsapp || "").replace(/\D/g, "");
  const socials = [
    settings.snapchat && {
      href: `https://snapchat.com/add/${settings.snapchat}`,
      label: "Snapchat",
      Icon: IconSnapchat,
      color: "hover:bg-yellow-400 hover:text-navy-900",
    },
    settings.facebook && {
      href: settings.facebook,
      label: "Facebook",
      Icon: IconFacebook,
      color: "hover:bg-blue-600 hover:text-white",
    },
    settings.tiktok && {
      href: settings.tiktok,
      label: "TikTok",
      Icon: IconTikTok,
      color: "hover:bg-navy-900 hover:text-white",
    },
  ].filter(Boolean);

  return (
    <footer className="mt-16 border-t border-navy-50 bg-gradient-to-b from-white to-blush">
      <div className="container-max section-pad py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-card">
                <IconBag className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="brand-script text-2xl text-navy-900">
                  Skin Beauty
                </span>
                <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-rose-500">
                  {t("brand.tagline")}
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-500">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick links + contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-navy-900">
              {t("footer.contact")}
            </h3>
            <a
              href={`https://wa.me/222${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn inline-flex bg-[#25D366] text-white shadow-soft hover:brightness-105"
            >
              <IconWhatsApp className="h-5 w-5" />
              {t("footer.whatsapp")} · {settings.whatsapp}
            </a>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <Link
                href="/about"
                className="text-navy-600 transition hover:text-rose-600"
              >
                {t("footer.about")}
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-navy-900">
              {t("footer.follow")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-white text-navy-700 shadow-card ring-1 ring-navy-50 transition-all duration-200 hover:-translate-y-1 ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-navy-50 pt-6 text-sm text-navy-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Skin Beauty. {t("footer.rights")}
          </p>
          <p className="flex items-center gap-1.5">
            {t("footer.madeWith")}
            <IconHeart className="h-4 w-4 text-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
