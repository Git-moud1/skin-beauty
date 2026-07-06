"use client";

import { createContext, useContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = ++idSeq;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const value = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* aria-live so screen readers announce toasts without stealing focus */}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto flex max-w-md animate-scale-in items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium shadow-soft ring-1 backdrop-blur-md ${
              t.type === "error"
                ? "bg-rose-600/95 text-white ring-rose-700"
                : t.type === "info"
                ? "bg-navy-800/95 text-white ring-navy-900"
                : "bg-white/95 text-navy-900 ring-rose-100"
            }`}
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                t.type === "error"
                  ? "bg-white/20"
                  : t.type === "info"
                  ? "bg-white/20"
                  : "bg-rose-100 text-rose-600"
              }`}
              aria-hidden="true"
            >
              {t.type === "error" ? "!" : "✓"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
