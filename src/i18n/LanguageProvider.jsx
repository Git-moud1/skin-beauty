"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  translations,
  LANGS,
  DEFAULT_LANG,
  formatPrice,
  formatDateTime,
} from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  // Restore saved language on mount.
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("sb_lang") : null;
    if (saved && LANGS[saved]) setLang(saved);
    setReady(true);
  }, []);

  // Keep <html lang/dir> in sync so RTL/LTR flips everywhere.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
  }, [lang]);

  const changeLang = useCallback((next) => {
    if (!LANGS[next]) return;
    setLang(next);
    try {
      localStorage.setItem("sb_lang", next);
    } catch {}
  }, []);

  const t = useCallback(
    (key) => {
      const dict = translations[lang] || translations[DEFAULT_LANG];
      return dict[key] ?? translations[DEFAULT_LANG][key] ?? key;
    },
    [lang]
  );

  const value = {
    lang,
    dir: LANGS[lang].dir,
    isRTL: LANGS[lang].dir === "rtl",
    ready,
    changeLang,
    t,
    price: (amount) => formatPrice(amount, lang),
    dateTime: (v) => formatDateTime(v, lang),
    // Translate a server error code into a localized message.
    tError: (code) => {
      const dict = translations[lang] || translations[DEFAULT_LANG];
      return dict[`err.${code}`] ?? dict["err.server_error"];
    },
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
