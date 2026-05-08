"use client";

import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/services/i18n";

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (path: string) => {
    return getTranslation(language, path);
  };

  return {
    t,
    language,
  };
};
