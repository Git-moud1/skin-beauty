"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useToast } from "@/context/ToastProvider";
import ProductFormModal from "./ProductFormModal";
import { IconPlus, IconEdit, IconTrash, IconSparkle } from "@/components/icons";

export default function ProductsPanel({ products, onChange }) {
  const { t, tError, price } = useLang();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // product being edited
  const [creating, setCreating] = useState(false);

  async function remove(product) {
    if (!window.confirm(t("admin.product.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("server_error");
      toast.success(t("admin.product.delete"));
      onChange();
    } catch (err) {
      toast.error(tError(err.message));
    }
  }

  function handleSaved() {
    setEditing(null);
    setCreating(false);
    onChange();
    toast.success(t("admin.product.save"));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-navy-900">
          {t("admin.products.title")}
        </h2>
        <button onClick={() => setCreating(true)} className="btn-rose">
          <IconPlus className="h-4 w-4" />
          {t("admin.products.add")}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card p-12 text-center text-navy-500">
          {t("products.empty")}
        </div>
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="card flex w-full max-w-full flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:gap-4"
            >
              {/* Image + name + price (stacks above the actions on mobile) */}
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-blush ring-1 ring-navy-50">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-rose-200">
                      <IconSparkle className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold text-navy-900 md:truncate">
                    {p.name}
                  </p>
                  <p className="font-bold tabular-nums text-rose-600">
                    {price(p.price)}
                  </p>
                </div>
              </div>

              {/* Actions: own full-width row on mobile, inline square buttons on desktop */}
              <div className="flex shrink-0 items-center gap-2 border-t border-navy-50 pt-3 md:border-0 md:pt-0">
                <button
                  onClick={() => setEditing(p)}
                  aria-label={t("admin.products.edit")}
                  className="grid h-11 flex-1 place-items-center rounded-xl bg-navy-50 text-navy-700 transition hover:bg-navy-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 md:w-11 md:flex-none"
                >
                  <IconEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => remove(p)}
                  aria-label={t("admin.product.delete")}
                  className="grid h-11 flex-1 place-items-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 md:w-11 md:flex-none"
                >
                  <IconTrash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ProductFormModal
          product={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
