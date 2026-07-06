"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import ClientResetModal from "./ClientResetModal";
import ClientDeleteModal from "./ClientDeleteModal";
import {
  IconSearch,
  IconUser,
  IconKey,
  IconBan,
  IconCheck,
  IconTrash,
} from "@/components/icons";

export default function ClientsPanel() {
  const { t, tError, dateTime, isRTL } = useLang();
  const toast = useToast();
  const [users, setUsers] = useState(null); // null = loading
  const [query, setQuery] = useState("");
  const [resetting, setResetting] = useState(null); // client being reset
  const [deleting, setDeleting] = useState(null); // client being deleted
  const [busyId, setBusyId] = useState(null); // client whose block is toggling

  useEffect(() => {
    fetch("/api/users", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return null;
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        String(u.phone).replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    );
  }, [users, query]);

  async function toggleBlock(u) {
    const next = u.blocked ? 0 : 1;
    setBusyId(u.id);
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "server_error");
      setUsers((list) =>
        list.map((x) => (x.id === u.id ? { ...x, blocked: next } : x))
      );
      toast.success(
        next
          ? t("admin.clients.blockedToast")
          : t("admin.clients.unblockedToast")
      );
    } catch (err) {
      toast.error(tError(err.message));
    } finally {
      setBusyId(null);
    }
  }

  function handleDeleted(id) {
    setUsers((list) => (list ? list.filter((x) => x.id !== id) : list));
    setDeleting(null);
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-navy-900">
        {t("admin.clients.title")}
      </h2>
      <p className="mt-1 text-sm text-navy-500">{t("admin.clients.subtitle")}</p>

      {/* Search */}
      <div className="relative mt-6 w-full max-w-md">
        <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-navy-300">
          <IconSearch className="h-5 w-5" />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin.clients.search")}
          className="input !rounded-full ps-12"
          aria-label={t("admin.clients.search")}
        />
      </div>

      {filtered === null ? (
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-3 p-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-300">
            <IconUser className="h-7 w-7" />
          </span>
          <p className="text-navy-500">{t("admin.clients.empty")}</p>
        </div>
      ) : (
        <>
          <p className="mb-4 mt-5 text-sm text-navy-500">
            {filtered.length} {t("admin.clients.count")}
          </p>
          <div className="grid gap-3">
            {filtered.map((u) => (
              <div
                key={u.id}
                className={`card flex w-full max-w-full flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center md:gap-4 ${
                  u.blocked ? "ring-1 ring-rose-200" : ""
                }`}
              >
                {/* Identity + meta (stacks above the actions on mobile) */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                      u.blocked
                        ? "bg-rose-100 text-rose-500"
                        : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    <IconUser className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 break-words font-semibold text-navy-900 sm:truncate">
                        {u.name}
                      </p>
                      {u.blocked ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                          <IconBan className="h-3 w-3" />
                          {t("admin.clients.blockedBadge")}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className="tabular-nums text-sm text-navy-500"
                      dir="ltr"
                      style={{ textAlign: isRTL ? "right" : "left" }}
                    >
                      {u.phone}
                    </p>
                    <p className="mt-0.5 text-xs text-navy-400">
                      {dateTime(u.created_at)}
                      <span className="mx-1.5 text-navy-300">·</span>
                      {u.order_count} {t("admin.clients.orders")}
                    </p>
                  </div>
                </div>

                {/* Actions: own full-width row on mobile, inline on desktop */}
                <div className="flex shrink-0 items-center gap-2 border-t border-navy-50 pt-3 md:border-0 md:pt-0">
                  <button
                    onClick={() => setResetting(u)}
                    className="btn-ghost flex-1 !px-3 !py-2 md:flex-none"
                  >
                    <IconKey className="h-4 w-4" />
                    <span>{t("admin.clients.reset")}</span>
                  </button>
                  <button
                    onClick={() => toggleBlock(u)}
                    disabled={busyId === u.id}
                    className="btn-ghost flex-1 !px-3 !py-2 md:flex-none"
                  >
                    {u.blocked ? (
                      <IconCheck className="h-4 w-4" />
                    ) : (
                      <IconBan className="h-4 w-4" />
                    )}
                    <span>
                      {u.blocked
                        ? t("admin.clients.unblock")
                        : t("admin.clients.block")}
                    </span>
                  </button>
                  <button
                    onClick={() => setDeleting(u)}
                    aria-label={t("admin.clients.delete")}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {resetting && (
        <ClientResetModal
          client={resetting}
          onClose={() => setResetting(null)}
        />
      )}
      {deleting && (
        <ClientDeleteModal
          client={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
