"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import {
  IconClose,
  IconKey,
  IconEye,
  IconEyeOff,
  IconWhatsApp,
  IconCheck,
  IconSpinner,
} from "@/components/icons";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function ClientResetModal({ client, onClose }) {
  const { t, tError, lang } = useLang();
  const toast = useToast();
  const [password, setPassword] = useState(generatePassword);
  const [showPw, setShowPw] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const panelRef = useFocusTrap({ autoFocus: false });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${client.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "server_error");
      setDone(true);
      toast.success(t("admin.reset.done"));
    } catch (err) {
      toast.error(tError(err.message));
    } finally {
      setBusy(false);
    }
  }

  const waNumber = "222" + String(client.phone || "").replace(/\D/g, "");
  const waMsg =
    lang === "ar"
      ? `مرحباً ${client.name}، تمت إعادة تعيين كلمة مرور حسابكِ في Skin Beauty.\nكلمة المرور الجديدة: ${password}`
      : `Bonjour ${client.name}, le mot de passe de votre compte Skin Beauty a été réinitialisé.\nNouveau mot de passe : ${password}`;
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("admin.reset.title")}
    >
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={busy ? undefined : onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-4xl bg-white shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-navy-50 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <IconKey className="h-5 w-5 text-rose-500" />
            {t("admin.reset.title")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("product.close")}
            className="grid h-11 w-11 place-items-center rounded-full text-navy-500 transition hover:bg-navy-50 hover:text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Client identity */}
          <div className="mb-4 rounded-2xl bg-blush p-3 text-sm">
            <span className="font-semibold text-navy-900">{client.name}</span>
            <span className="mx-2 text-navy-300">·</span>
            <span className="tabular-nums text-navy-700" dir="ltr">
              {client.phone}
            </span>
          </div>

          {!done ? (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-sm text-navy-500">{t("admin.reset.subtitle")}</p>
              <div>
                <label className="label" htmlFor="cr-pw">
                  {t("account.newPassword")}
                </label>
                <div className="relative" dir="ltr">
                  <input
                    id="cr-pw"
                    name="cr-pw"
                    className="input pe-28 font-mono tracking-wide"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPw ? "text" : "password"}
                    dir="ltr"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                  />
                  <div className="absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center">
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "hide" : "show"}
                      className="grid h-10 w-10 place-items-center rounded-full text-navy-500 transition hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      {showPw ? (
                        <IconEyeOff className="h-5 w-5" />
                      ) : (
                        <IconEye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassword(generatePassword())}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      {t("admin.reset.generate")}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-rose w-full" disabled={busy}>
                {busy ? (
                  <>
                    <IconSpinner className="h-5 w-5 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <IconKey className="h-5 w-5" />
                    {t("admin.reset.confirm")}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-600">
                <IconCheck className="h-8 w-8" strokeWidth={2.4} />
              </div>
              <p className="text-sm text-navy-500">{t("admin.reset.doneHint")}</p>
              <p
                className="select-all rounded-2xl bg-navy-50 px-4 py-3 text-lg font-bold tracking-wider text-navy-900"
                dir="ltr"
              >
                {password}
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex w-full bg-[#25D366] text-white shadow-soft hover:brightness-105"
              >
                <IconWhatsApp className="h-5 w-5" />
                {t("admin.reset.sendWhatsapp")}
              </a>
              <button onClick={onClose} className="btn-ghost w-full">
                {t("product.close")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
