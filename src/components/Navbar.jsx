"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { useAuthModal } from "@/components/AuthModal";
import {
  IconUser,
  IconMenu,
  IconClose,
  IconBag,
  IconGlobe,
  IconSparkle,
  IconLeaf,
  IconShield,
} from "@/components/icons";

function LangSwitch({ block = false }) {
  const { lang, changeLang } = useLang();
  return (
    <div
      className={`inline-flex items-center rounded-full bg-navy-50 p-1 ${
        block ? "w-full justify-center" : ""
      }`}
      role="group"
      aria-label="Language"
    >
      {[
        { code: "fr", label: "FR" },
        { code: "ar", label: "ع" },
      ].map((l) => (
        <button
          key={l.code}
          onClick={() => changeLang(l.code)}
          aria-pressed={lang === l.code}
          className={`min-w-[42px] rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
            lang === l.code
              ? "bg-white text-navy-900 shadow-sm"
              : "text-navy-500 hover:text-navy-800"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { t } = useLang();
  const { user, isAdmin, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change.
  useEffect(() => setMenuOpen(false), [pathname]);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
  ];

  // Mobile menu links (with icons + role-based entries).
  const mobileLinks = [
    { href: "/", label: t("nav.home"), Icon: IconSparkle },
    { href: "/about", label: t("nav.about"), Icon: IconLeaf },
    ...(isAdmin ? [{ href: "/admin", label: t("nav.admin"), Icon: IconShield }] : []),
    ...(user && !isAdmin
      ? [{ href: "/account", label: t("nav.account"), Icon: IconUser }]
      : []),
  ];

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header
      className={`sticky top-0 z-[500] transition-all duration-300 ${
        scrolled
          ? "glass shadow-[0_4px_30px_-12px_rgba(31,41,90,0.18)]"
          : "bg-cream/80 backdrop-blur-sm"
      }`}
    >
      <nav className="container-max section-pad">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-card transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <IconBag className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="brand-script text-[1.7rem] leading-none text-navy-900">
                Skin Beauty
              </span>
              <span className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-rose-500">
                {t("brand.tagline")}
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-rose-600"
                      : "text-navy-700 hover:text-rose-600"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "text-rose-600"
                    : "text-navy-700 hover:text-rose-600"
                }`}
              >
                {t("nav.admin")}
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LangSwitch />
            </div>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href={isAdmin ? "/admin" : "/account"}
                  className="btn-ghost !px-4 !py-2"
                >
                  <IconUser className="h-4 w-4" />
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-navy-500 transition hover:text-rose-600"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="btn-rose hidden !px-5 !py-2.5 md:inline-flex"
              >
                <IconUser className="h-4 w-4" />
                {t("nav.login")}
              </button>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-navy-800 shadow-sm ring-1 ring-navy-100 transition hover:ring-rose-200 md:hidden"
            >
              {menuOpen ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <IconMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-navy-50 bg-white/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden ${
          menuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container-max section-pad flex flex-col gap-1.5 py-4">
          {mobileLinks.map(({ href, label, Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold transition ${
                  active
                    ? "bg-rose-50 text-rose-600"
                    : "text-navy-800 hover:bg-navy-50"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    active ? "bg-rose-100 text-rose-600" : "bg-navy-50 text-navy-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
              </Link>
            );
          })}

          <div className="my-2 h-px bg-navy-50" />

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-navy-50/60 px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-navy-600">
              <IconGlobe className="h-4 w-4 shrink-0" />
              {t("nav.language")}
            </span>
            <LangSwitch />
          </div>

          {user ? (
            <button onClick={handleLogout} className="btn-outline mt-1 w-full">
              {t("nav.logout")}
            </button>
          ) : (
            <button
              onClick={() => openAuth("login")}
              className="btn-rose mt-1 w-full"
            >
              <IconUser className="h-4 w-4" />
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
