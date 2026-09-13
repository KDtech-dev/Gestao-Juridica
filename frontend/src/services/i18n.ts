import pt from "@/messages/pt.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

import { Language } from "@/context/LanguageContext";

const messages = {
  pt,
  en,
  es,
};

function isTranslationObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getTranslation(language: Language, path: string): string {
  const keys = path.split(".");

  let current: unknown = messages[language];

  for (const key of keys) {
    if (isTranslationObject(current) && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }

  return typeof current === "string" ? current : path;
}
