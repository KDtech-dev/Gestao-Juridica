import { useTranslations } from "next-intl";

export function useApiErrorTranslator() {
  const t = useTranslations();

  return (error: unknown): string => {
    const data = (error as any)?.response?.data;

    if (!data) return "";

    if (data.errors) {
      const messages = Object.values(data.errors)
        .flat()
        .map((key) => {
          try {
            return t(key as string);
          } catch {
            return key;
          }
        });

      return messages.join("\n");
    }

    if (data.message) {
      try {
        return t(data.message);
      } catch {
        return data.message;
      }
    }

    return "";
  };
}
