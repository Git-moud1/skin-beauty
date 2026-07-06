"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "@/context/AuthProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { normalizePhone, isValidPhone } from "@/lib/validation";
import {
  IconClose,
  IconEye,
  IconEyeOff,
  IconSparkle,
  IconWhatsApp,
} from "./icons";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const pendingCb = useRef(null);

  // If already logged in, run the action immediately; otherwise open the modal.
  const requireAuth = useCallback(
    (cb) => {
      if (user) {
        cb?.();
        return;
      }
      pendingCb.current = cb || null;
      setMode("login");
      setOpen(true);
    },
    [user]
  );

  const openAuth = useCallback((initialMode = "login") => {
    pendingCb.current = null;
    setMode(initialMode);
    setOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    const cb = pendingCb.current;
    pendingCb.current = null;
    // Defer so state settles before the follow-up action (e.g. placing order).
    if (cb) setTimeout(cb, 60);
  }, []);

  return (
    <AuthModalContext.Provider value={{ requireAuth, openAuth }}>
      {children}
      {open && (
        <AuthModalView
          mode={mode}
          setMode={setMode}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

function AuthModalView({ mode, setMode, onClose, onSuccess }) {
  const { t, tError, isRTL, lang } = useLang();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const firstFieldRef = useRef(null);
  // Modal focuses its own first field, so let the trap skip auto-focus.
  const panelRef = useFocusTrap({ autoFocus: false });

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [mode]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Load the shop WhatsApp number for the "forgot password" flow.
  useEffect(() => {
    if (!isForgot) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setWhatsapp(d.settings?.whatsapp || "48011609"))
      .catch(() => setWhatsapp("48011609"));
  }, [isForgot]);

  // Pre-filled WhatsApp reset request to the shop owner.
  const waShop = (whatsapp || "48011609").replace(/\D/g, "");
  const cleanPhone = normalizePhone(phone);
  const forgotMsg =
    lang === "ar"
      ? `مرحباً، لقد نسيتُ كلمة مرور حسابي في Skin Beauty.\nرقم حسابي: ${cleanPhone}\nالرجاء إعادة تعيينها من فضلكم.`
      : `Bonjour, j'ai oublié le mot de passe de mon compte Skin Beauty.\nMon numéro de compte : ${cleanPhone}\nMerci de bien vouloir le réinitialiser.`;
  const forgotWaHref = `https://wa.me/222${waShop}?text=${encodeURIComponent(forgotMsg)}`;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(name, phone, password);
      else await login(phone, password);
      onSuccess();
    } catch (err) {
      setError(tError(err.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        isForgot
          ? t("auth.forgot.title")
          : isRegister
          ? t("auth.title.register")
          : t("auth.title.login")
      }
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-4xl bg-white shadow-soft"
      >
        {/* Decorative header */}
        <div className="relative bg-gradient-to-br from-rose-50 via-white to-navy-50 px-8 pb-6 pt-8 text-center">
          <button
            onClick={onClose}
            aria-label={t("product.close")}
            className="absolute end-3 top-3 grid h-11 w-11 place-items-center rounded-full text-navy-500 transition hover:bg-navy-50 hover:text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <IconClose className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-card">
            <IconSparkle className="h-7 w-7" />
          </div>
          <h2 className="heading-serif text-2xl font-bold text-navy-900">
            {isForgot
              ? t("auth.forgot.title")
              : isRegister
              ? t("auth.title.register")
              : t("auth.title.login")}
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            {isForgot
              ? t("auth.forgot.subtitle")
              : isRegister
              ? t("auth.subtitle.register")
              : t("auth.subtitle.login")}
          </p>
        </div>

        {isForgot ? (
          <div className="space-y-4 px-8 pb-8 pt-2">
            <div>
              <label className="label" htmlFor="am-fphone">
                {t("auth.phone")}
              </label>
              <input
                id="am-fphone"
                ref={firstFieldRef}
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("auth.phonePlaceholder")}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                style={{ textAlign: isRTL ? "right" : "left" }}
                required
              />
            </div>

            <p className="rounded-2xl bg-rose-50/70 px-4 py-3 text-sm leading-relaxed text-navy-600">
              {t("auth.forgot.hint")}
            </p>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
              >
                {error}
              </p>
            )}

            <a
              href={forgotWaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!isValidPhone(phone)) {
                  e.preventDefault();
                  setError(t("err.invalid_phone"));
                }
              }}
              className="btn inline-flex w-full bg-[#25D366] text-white shadow-soft hover:brightness-105"
            >
              <IconWhatsApp className="h-5 w-5" />
              {t("auth.forgot.whatsapp")}
            </a>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("login");
              }}
              className="w-full text-center text-sm font-medium text-navy-600 transition hover:text-rose-600"
            >
              {t("auth.forgot.back")}
            </button>
          </div>
        ) : (
        <form onSubmit={submit} className="space-y-4 px-8 pb-8 pt-2">
          {isRegister && (
            <div>
              <label className="label" htmlFor="am-name">
                {t("auth.name")}
              </label>
              <input
                id="am-name"
                ref={firstFieldRef}
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("auth.namePlaceholder")}
                autoComplete="name"
                required
              />
            </div>
          )}
          <div>
            <label className="label" htmlFor="am-phone">
              {t("auth.phone")}
            </label>
            <input
              id="am-phone"
              ref={isRegister ? null : firstFieldRef}
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("auth.phonePlaceholder")}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              style={{ textAlign: isRTL ? "right" : "left" }}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="am-pw">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="am-pw"
                className="input pe-14"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                type={showPw ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "hide" : "show"}
                className="absolute end-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-navy-500 transition hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                {showPw ? (
                  <IconEyeOff className="h-5 w-5" />
                ) : (
                  <IconEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMode("forgot");
            }}
            className="-mt-1 block w-full text-end text-sm font-medium text-rose-600 transition hover:text-rose-700"
          >
            {t("auth.forgot.link")}
          </button>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn-rose w-full" disabled={busy}>
            {busy
              ? t("common.loading")
              : isRegister
              ? t("auth.register")
              : t("auth.login")}
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMode(isRegister ? "login" : "register");
            }}
            className="w-full text-center text-sm font-medium text-navy-600 transition hover:text-rose-600"
          >
            {isRegister ? t("auth.toLogin") : t("auth.toRegister")}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
