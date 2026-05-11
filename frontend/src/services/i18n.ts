import pt from "@/messages/pt.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

import { Language } from "@/context/LanguageContext";

const messages = {
  pt,
  en,
  es,
};

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

export function getTranslation(language: Language, path: string): string {
  const keys = path.split(".");

  let current: string | TranslationObject = messages[
    language
  ] as TranslationObject;

  for (const key of keys) {
    if (typeof current === "object" && current !== null && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }

  return typeof current === "string" ? current : path;
}
