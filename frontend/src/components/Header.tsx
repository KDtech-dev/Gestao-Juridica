"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getRouteByRole } from "@/utils/redirectByRole";
import { logoSrc } from "./Footer";
import { useTranslations } from "next-intl";
import { useThemeMode } from "@/theme/ThemeRegistry";
import { Icon } from "@/components/AppIcon";
import { useLanguage, type Language } from "@/context/LanguageContext";

const languageOptions: Record<
  Language,
  { flag: string; labelKey: "brazil" | "unitedStates" | "spain"; next: Language }
> = {
  pt: { flag: "🇧🇷", labelKey: "brazil", next: "en" },
  en: { flag: "🇺🇸", labelKey: "unitedStates", next: "es" },
  es: { flag: "🇪🇸", labelKey: "spain", next: "pt" },
};

export function Header() {
  const t = useTranslations("public.header");
  const theme = useTheme();
  const { setThemeMode } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, loading } = useAuth();
  const isDark = theme.palette.mode === "dark";
  const accessHref =
    isAuthenticated && user ? getRouteByRole(user.roles) : "/login";
  const themeToggleLabel = isDark ? t("theme.light") : t("theme.dark");
  const currentLanguage = languageOptions[language];
  const languageLabel = t(`language.${currentLanguage.labelKey}`);

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          py={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title={themeToggleLabel}>
              <IconButton
                type="button"
                aria-label={themeToggleLabel}
                onClick={() => setThemeMode(isDark ? "light" : "dark")}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  color: "text.primary",
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Icon
                  icon={
                    isDark ? "mdi:white-balance-sunny" : "mdi:weather-night"
                  }
                  width={20}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title={languageLabel}>
              <IconButton
                type="button"
                aria-label={languageLabel}
                onClick={() => setLanguage(currentLanguage.next)}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  color: "text.primary",
                  flexShrink: 0,
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box component="span" aria-hidden="true">
                  {currentLanguage.flag}
                </Box>
              </IconButton>
            </Tooltip>

            <Stack
              component={Link}
              href="/"
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                minWidth: 0,
                color: "text.primary",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={logoSrc}
                alt="Central Jurídica"
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  objectFit: "contain",
                  filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  fontWeight={900}
                  sx={{ fontSize: "0.95rem", lineHeight: 1.1 }}
                >
                  Central Jurídica
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.35, lineHeight: 1.1, fontSize: "0.75rem" }}
                >
                  Advocacia & Consultoria
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Stack
              component="nav"
              direction="row"
              spacing={{ xs: 0.5, sm: 1 }}
              alignItems="center"
            >
              <Button
                component={Link}
                href="/"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                {t("home")}
              </Button>
              <Button
                component={Link}
                href="/posts"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                {t("publications")}
              </Button>
              <Button
                component={Link}
                href="/equipe"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                {t("team")}
              </Button>
            </Stack>

            {!loading && (
              <Button
                component={Link}
                href={accessHref}
                variant="contained"
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: "999px",
                  px: 3,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                {isAuthenticated ? t("access") : t("login")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
