"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

export type Language = "pt" | "en" | "es";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext =
  createContext<LanguageContextType>(
    {} as LanguageContextType,
  );

const validLanguages: Language[] = [
  "pt",
  "en",
  "es",
];

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "pt";
  }

  const savedLanguage =
    localStorage.getItem("idioma") as
      | Language
      | null;

  if (
    savedLanguage &&
    validLanguages.includes(savedLanguage)
  ) {
    return savedLanguage;
  }

  const browserLanguage =
    navigator.language
      .toLowerCase()
      .split("-")[0] as Language;

  if (
    validLanguages.includes(browserLanguage)
  ) {
    return browserLanguage;
  }

  return "pt";
}

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] =
    useState<Language>(
      getInitialLanguage,
    );

  const setLanguage = (
    lang: Language,
  ) => {
    setLanguageState(lang);

    localStorage.setItem(
      "idioma",
      lang,
    );

    document.cookie = `idioma=${lang}; path=/; max-age=31536000`;

    document.documentElement.lang =
      lang;
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () =>
  useContext(LanguageContext);