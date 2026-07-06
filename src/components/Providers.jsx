"use client";

import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { AuthModalProvider } from "@/components/AuthModal";

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <AuthModalProvider>{children}</AuthModalProvider>
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}
