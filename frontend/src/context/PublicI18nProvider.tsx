"use client";

import { useAuth } from "@/hooks/useAuth";
import { useLanguage, type Language } from "@/context/LanguageContext";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

const messages = {
  pt,
  en,
  es,
};

const isLanguage = (value: unknown): value is Language =>
  value === "pt" || value === "en" || value === "es";

export function PublicI18nProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  const { language } = useLanguage();
  const userLanguage = isLanguage(user?.idioma) ? user.idioma : language;
  const locale = !loading && isAuthenticated ? userLanguage : "pt";

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
