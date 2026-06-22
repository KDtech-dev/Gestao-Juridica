"use client";
import { createContext, useContext, useMemo, useState, useEffect } from "react";

export type Language = "pt" | "en" | "es";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>(
  {} as LanguageContextType,
);
const validLanguages: Language[] = ["pt", "en", "es"];

export const LanguageProvider = ({
  children,
  initialLocale = "pt",
}: {
  children: React.ReactNode;
  initialLocale?: Language;
}) => {
  const [language, setLanguageState] = useState<Language>(initialLocale);

  useEffect(() => {
    const saved = localStorage.getItem("idioma") as Language | null;
    if (saved && validLanguages.includes(saved) && saved !== language) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("idioma", lang);
    document.cookie = `idioma=${lang}; path=/; max-age=31536000`;
    document.documentElement.lang = lang;
  };

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
