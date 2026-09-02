"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useServerInsertedHTML } from "next/navigation";
import type { EmotionCache } from "@emotion/cache";
import { ptBR } from "date-fns/locale/pt-BR";

export type ThemeMode = "light" | "dark" | "system";

export type AppLanguage = "pt" | "en" | "es";

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const ThemeModeContext = React.createContext<ThemeModeContextValue | undefined>(
  undefined,
);

export function useThemeMode() {
  const context = React.useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode deve ser usado dentro de ThemeRegistry.");
  }

  return {
    themeMode: context.themeMode,
    setThemeMode: context.setThemeMode,
  };
}

export function useAppLanguage() {
  const context = React.useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useAppLanguage deve ser usado dentro de ThemeRegistry.");
  }

  return {
    language: context.language,
    setLanguage: context.setLanguage,
  };
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("system");

  const [language, setLanguage] = React.useState<AppLanguage>("pt");

  const [resolvedMode, setResolvedMode] = React.useState<"light" | "dark">(
    "light",
  );

  const [{ cache, inserted }] = React.useState(() => {
    const cache = createCache({
      key: "mui",
      prepend: true,
    });

    cache.compat = true;

    const inserted: string[] = [];

    const prevInsert = cache.insert;

    cache.insert = (...args: Parameters<EmotionCache["insert"]>) => {
      const serialized = args[1];

      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }

      return prevInsert(...args);
    };

    return {
      cache,
      inserted,
    };
  });

  useServerInsertedHTML(() => (
    <style
      data-emotion={`mui ${inserted.join(" ")}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(" "),
      }}
    />
  ));

  React.useEffect(() => {
    const savedTheme = localStorage.getItem(
      "lawmanager-theme-mode",
    ) as ThemeMode | null;

    const savedLanguage = localStorage.getItem(
      "lawmanager-language",
    ) as AppLanguage | null;

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setThemeMode(savedTheme);
    }

    if (
      savedLanguage === "pt" ||
      savedLanguage === "en" ||
      savedLanguage === "es"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("lawmanager-theme-mode", themeMode);
  }, [themeMode]);

  React.useEffect(() => {
    localStorage.setItem("lawmanager-language", language);

    document.documentElement.lang = language;
  }, [language]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      if (themeMode === "system") {
        setResolvedMode(mediaQuery.matches ? "dark" : "light");

        return;
      }

      setResolvedMode(themeMode);
    };

    updateTheme();

    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, [themeMode]);
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedMode);

    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);

  const theme = React.useMemo(() => {
    const isDark = resolvedMode === "dark";

    return createTheme({
      palette: {
        mode: resolvedMode,

        primary: {
          main: "#2563eb",
        },

        secondary: {
          main: "#06b6d4",
        },

        background: isDark
          ? {
              default: "#111827",
              paper: "#1f2937",
            }
          : {
              default: "#f8fafc",
              paper: "#ffffff",
            },
      },

      typography: {
        fontFamily: "var(--font-open-sans), Arial, sans-serif",
        h1: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 },
        h2: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 },
        h3: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600 },
        h4: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600 },
        h5: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600 },
        h6: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 500 },
        button: {
          fontFamily: "var(--font-poppins), sans-serif",
          fontWeight: 600,
        },
      },

      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: isDark ? "#111827" : "#f8fafc",
            },
          },
        },
      },
    });
  }, [resolvedMode]);

  return (
    <CacheProvider value={cache}>
      <ThemeModeContext.Provider
        value={{
          themeMode,
          setThemeMode,

          language,
          setLanguage,
        }}
      >
        <ThemeProvider theme={theme}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <CssBaseline />

            {children}
          </LocalizationProvider>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </CacheProvider>
  );
}
