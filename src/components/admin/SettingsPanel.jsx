"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import {
  IconWhatsApp,
  IconSnapchat,
  IconFacebook,
  IconTikTok,
} from "@/components/icons";

export default function SettingsPanel({ settings, onChange }) {
  const { t, tError } = useLang();
  const toast = useToast();
  const [form, setForm] = useState({
    whatsapp: settings.whatsapp || "",
    snapchat: settings.snapchat || "",
    facebook: settings.facebook || "",
    tiktok: settings.tiktok || "",
  });
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "server_error");
      onChange?.(data.settings);
      toast.success(t("admin.settings.saved"));
    } catch (err) {
      toast.error(tError(err.message));
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    {
      key: "whatsapp",
      label: t("admin.settings.whatsapp"),
      Icon: IconWhatsApp,
      color: "text-[#25D366]",
      dir: "ltr",
    },
    {
      key: "snapchat",
      label: t("admin.settings.snapchat"),
      Icon: IconSnapchat,
      color: "text-yellow-500",
      dir: "ltr",
    },
    {
      key: "facebook",
      label: t("admin.settings.facebook"),
      Icon: IconFacebook,
      color: "text-blue-600",
      dir: "ltr",
    },
    {
      key: "tiktok",
      label: t("admin.settings.tiktok"),
      Icon: IconTikTok,
      color: "text-navy-900",
      dir: "ltr",
    },
  ];

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-navy-900">
        {t("admin.settings.title")}
      </h2>
      <p className="mt-1 text-sm text-navy-500">{t("admin.settings.subtitle")}</p>

      <form onSubmit={save} className="mt-6 space-y-4">
        {fields.map(({ key, label, Icon, color, dir }) => (
          <div key={key}>
            <label className="label flex items-center gap-2" htmlFor={`set-${key}`}>
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </label>
            <input
              id={`set-${key}`}
              className="input"
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              dir={dir}
            />
          </div>
        ))}

        <button type="submit" className="btn-rose" disabled={busy}>
          {busy ? t("common.loading") : t("admin.settings.save")}
        </button>
      </form>
    </div>
  );
}
