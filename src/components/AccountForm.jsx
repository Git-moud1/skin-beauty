"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { IconUser, IconShield, IconEye, IconEyeOff } from "@/components/icons";

export default function AccountForm() {
  const { t, tError, isRTL } = useLang();
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "server_error");
      setUser(data.user);
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t("account.saved"));
    } catch (err) {
      toast.error(tError(err.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
      {/* Personal info */}
      <div className="card p-6 sm:p-7">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-navy-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-600">
            <IconUser className="h-5 w-5" />
          </span>
          {t("account.info")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="ac-name">
              {t("auth.name")}
            </label>
            <input
              id="ac-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="ac-phone">
              {t("auth.phone")}
            </label>
            <input
              id="ac-phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="numeric"
              dir="ltr"
              style={{ textAlign: isRTL ? "right" : "left" }}
              autoComplete="tel"
              required
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6 sm:p-7">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-navy-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-100 text-navy-700">
            <IconShield className="h-5 w-5" />
          </span>
          {t("account.security")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="ac-cpw">
              {t("account.currentPassword")}
            </label>
            <input
              id="ac-cpw"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="ac-npw">
              {t("account.newPassword")}
            </label>
            <div className="relative">
              <input
                id="ac-npw"
                className="input pe-14"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
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
            <p className="mt-1.5 text-xs text-navy-500">
              {t("account.changePasswordHint")}
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <button type="submit" className="btn-rose w-full sm:w-auto" disabled={busy}>
          {busy ? t("common.loading") : t("account.save")}
        </button>
      </div>
    </form>
  );
}
