"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { IconClose, IconTrash, IconSpinner } from "@/components/icons";

// Styled, design-consistent confirmation for permanently deleting a customer
// account (replaces window.confirm). Shows who is being deleted and warns that
// the action is irreversible.
export default function ClientDeleteModal({ client, onClose, onDeleted }) {
  const { t, tError } = useLang();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const panelRef = useFocusTrap({ autoFocus: false });

  async function confirm() {
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${client.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "server_error");
      toast.success(t("admin.clients.deletedToast"));
      onDeleted(client.id);
    } catch (err) {
      toast.error(tError(err.message));
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("admin.clientDelete.title")}
    >
      <div
        className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in"
        onClick={busy ? undefined : onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-4xl bg-white shadow-soft"
      >
        <div className="p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-100 text-rose-600">
            <IconTrash className="h-8 w-8" />
          </div>
          <h2 className="heading-serif text-xl font-bold text-navy-900">
            {t("admin.clientDelete.title")}
          </h2>
          <p className="mt-2 font-semibold text-rose-600">
            {t("admin.clientDelete.warning")}
          </p>

          {/* Who is being deleted */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl bg-blush px-4 py-3 text-sm">
            <span className="max-w-full break-words font-semibold text-navy-900">
              {client.name}
            </span>
            <span className="text-navy-300">·</span>
            <span className="tabular-nums text-navy-700" dir="ltr">
              {client.phone}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-navy-500">
            {t("admin.clientDelete.hint")}
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              onClick={onClose}
              disabled={busy}
              className="btn-ghost w-full sm:flex-1"
            >
              {t("admin.clientDelete.cancel")}
            </button>
            <button
              onClick={confirm}
              disabled={busy}
              className="btn w-full bg-rose-600 text-white shadow-soft hover:bg-rose-700 sm:flex-1"
            >
              {busy ? (
                <>
                  <IconSpinner className="h-5 w-5 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <IconTrash className="h-5 w-5" />
                  {t("admin.clientDelete.confirm")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
