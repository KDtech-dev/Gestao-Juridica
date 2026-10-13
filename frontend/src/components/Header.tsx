"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { MouseEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRouteByRole } from "@/utils/redirectByRole";
import { logoSrc } from "@/configs/branding";
import { useTranslations } from "next-intl";
import { useThemeMode } from "@/theme/ThemeRegistry";
import { Icon } from "@/components/AppIcon";
import { useLanguage, type Language } from "@/context/LanguageContext";
import { demoOffice } from "@/configs/demoOffice";

const languageOptions: Record<
  Language,
  { shortLabel: string; labelKey: "portuguese" | "english" | "spanish" }
> = {
  pt: { shortLabel: "PT", labelKey: "portuguese" },
  en: { shortLabel: "EN", labelKey: "english" },
  es: { shortLabel: "ES", labelKey: "spanish" },
};

const subscribeToMount = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export function Header({
  productBrand = false,
}: {
  productBrand?: boolean;
} = {}) {
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );

  const t = useTranslations("public.header");
  const theme = useTheme();
  const { setThemeMode } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, loading } = useAuth();
  const pathname = usePathname();
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 16, y: 112 });

  // Compute values that depend on client state
  const isDark = theme.palette.mode === "dark";
  const accessHref =
    isAuthenticated && user ? getRouteByRole(user.roles) : "/login";

  // These values depend on client state and should be computed after mount
  const getThemeToggleLabel = () =>
    isDark ? t("theme.light") : t("theme.dark");
  const getAccessibilityLabel = () => t("accessibility");
  const currentLanguage = languageOptions[language];
  const getLanguageLabel = () => t(`language.${currentLanguage.labelKey}`);

  const handleLanguageChange = (event: SelectChangeEvent<Language>) => {
    setLanguage(event.target.value as Language);
  };

  const navItems = [
    { href: "/", label: t("home"), active: pathname === "/" },
    { href: "/posts", label: t("publications"), active: pathname === "/posts" },
  ];

  const toggleMobileSettings = (event: MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setFloatingPosition({ x: bounds.left, y: bounds.top });
    setFloatingOpen((open) => !open);
  };

  // Render consistent content during SSR/hydration
  const renderContent = () => {
    const isMounted = mounted;
    const themeLabel = isMounted ? getThemeToggleLabel() : "";
    const accessibilityLabel = isMounted ? getAccessibilityLabel() : "";
    const languageLabel = isMounted ? getLanguageLabel() : "";

    return (
      <>
        <Box
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container
            maxWidth="xl"
            disableGutters
            sx={{ px: { xs: 1, sm: 0 }, pr: { sm: 3 } }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
              gap={{ xs: 1.25, md: 2 }}
              py={{ xs: 1.25, md: 2 }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 0.75, sm: 1 }}
                alignItems="center"
                sx={{
                  minWidth: 0,
                  width: { xs: "100%", md: "auto" },
                  ml: { xs: 0, md: "-18px" },
                }}
              >
                <Tooltip title={languageLabel}>
                  <Select<Language>
                    value={language}
                    size="small"
                    displayEmpty
                    aria-label={languageLabel}
                    onChange={handleLanguageChange}
                    renderValue={(selected) => (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        component="span"
                      >
                        <Icon icon="mdi:translate" width={15} />
                        <Box
                          component="span"
                          sx={{ fontSize: "0.66rem", fontWeight: 800 }}
                          suppressHydrationWarning
                        >
                          {languageOptions[selected].shortLabel}
                        </Box>
                      </Stack>
                    )}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 1,
                          minWidth: 148,
                          bgcolor: "#070b14",
                          color: "#d7dce5",
                          border: "1px solid rgba(148, 163, 184, 0.18)",
                          borderRadius: 0.75,
                          boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
                        },
                      },
                      MenuListProps: {
                        dense: true,
                        sx: { py: 0.5 },
                      },
                    }}
                    sx={{
                      display: { xs: "none", md: "flex" },
                      minWidth: 64,
                      height: 44,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      color: "text.primary",
                      flexShrink: 0,
                      ".MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        py: 0,
                        pl: 0.85,
                        pr: 2.5,
                      },
                      ".MuiOutlinedInput-notchedOutline": {
                        border: 0,
                      },
                      ".MuiSelect-icon": {
                        color: "text.secondary",
                        right: 4,
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    {Object.entries(languageOptions).map(([value, option]) => (
                      <MenuItem
                        key={value}
                        value={value}
                        sx={{
                          minHeight: 44,
                          fontSize: "0.86rem",
                          "&.Mui-selected": {
                            bgcolor: "rgba(59, 130, 246, 0.18)",
                          },
                          "&.Mui-selected:hover, &:hover": {
                            bgcolor: "rgba(59, 130, 246, 0.24)",
                          },
                        }}
                      >
                        {t(`language.${option.labelKey}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </Tooltip>
                <Tooltip title={themeLabel}>
                  <IconButton
                    type="button"
                    aria-label={themeLabel}
                    onClick={() => setThemeMode(isDark ? "light" : "dark")}
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      height: 44,
                      width: 44,
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
                      width={17}
                    />
                  </IconButton>
                </Tooltip>

                <Stack
                  component={Link}
                  href="/"
                  direction="row"
                  spacing={{ xs: 1, sm: 2 }}
                  alignItems="center"
                  sx={{
                    minWidth: 0,
                    ml: { xs: 0, md: "-5px" },
                    color: "text.primary",
                    textDecoration: "none",
                    flexShrink: 1,
                    overflow: "hidden",
                  }}
                >
                  {productBrand ? (
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: { xs: 44, sm: 52 },
                        height: { xs: 44, sm: 52 },
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        flexShrink: 0,
                      }}
                    >
                      <Icon icon="mdi:scale-balance" width={27} />
                    </Box>
                  ) : (
                    <Box
                      component="img"
                      src={logoSrc}
                      alt={demoOffice.shortName}
                      sx={{
                        width: { xs: 44, sm: 60 },
                        height: { xs: 44, sm: 60 },
                        borderRadius: 2,
                        objectFit: "contain",
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      fontWeight={900}
                      noWrap
                      sx={{
                        fontSize: { xs: "0.82rem", sm: "0.95rem" },
                        lineHeight: 1.1,
                      }}
                    >
                      {productBrand
                        ? demoOffice.productName
                        : demoOffice.shortName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{
                        display: { xs: "none", sm: "block" },
                        mt: 0.35,
                        lineHeight: 1.1,
                        fontSize: "0.75rem",
                      }}
                    >
                      {productBrand ? "KDTech" : demoOffice.productName}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                spacing={{ xs: 0.75, sm: 2 }}
                alignItems="center"
                justifyContent={{ xs: "space-between", md: "flex-end" }}
                sx={{ minWidth: 0, width: { xs: "100%", md: "auto" } }}
              >
                <Stack
                  component="nav"
                  direction="row"
                  spacing={{ xs: 0.5, sm: 1 }}
                  alignItems="center"
                  sx={{
                    minWidth: 0,
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                  }}
                >
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      variant="text"
                      sx={{
                        display: {
                          xs: item.active ? "none" : "inline-flex",
                          md: "inline-flex",
                        },
                        color: "text.primary",
                        textTransform: "none",
                        fontWeight: 700,
                        px: { xs: 0.75, sm: 1.5 },
                        minWidth: "auto",
                        minHeight: 44,
                        fontSize: { xs: "0.78rem", sm: "0.875rem" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                  <Tooltip title={accessibilityLabel}>
                    <IconButton
                      type="button"
                      aria-label={accessibilityLabel}
                      onClick={toggleMobileSettings}
                      sx={{
                        display: { xs: "inline-flex", md: "none" },
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        color: "text.primary",
                      }}
                    >
                      <Icon icon="mdi:accessibility" width={22} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {!loading && (
                  <Button
                    component={Link}
                    href={accessHref}
                    variant="contained"
                    sx={{
                      bgcolor: "primary.main",
                      borderRadius: "999px",
                      px: { xs: 1.5, sm: 3 },
                      minWidth: "auto",
                      flexShrink: 0,
                      fontSize: { xs: "0.78rem", sm: "0.875rem" },
                      whiteSpace: "nowrap",
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

        {floatingOpen && (
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              position: "fixed",
              left: `min(${floatingPosition.x}px, calc(100vw - 196px))`,
              top: `min(${floatingPosition.y + 48}px, calc(100vh - 164px))`,
              zIndex: 1299,
              width: 184,
              flexDirection: "column",
              gap: 1,
              p: 1,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              boxShadow: "0 18px 46px rgba(15, 23, 42, 0.22)",
            }}
          >
            <Select<Language>
              value={language}
              size="small"
              aria-label={languageLabel}
              onChange={handleLanguageChange}
              sx={{
                height: 44,
                fontSize: "0.84rem",
                ".MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              {Object.entries(languageOptions).map(([value, option]) => (
                <MenuItem key={value} value={value}>
                  {t(`language.${option.labelKey}`)}
                </MenuItem>
              ))}
            </Select>

            <Button
              type="button"
              variant="outlined"
              startIcon={
                <Icon
                  icon={
                    isDark ? "mdi:white-balance-sunny" : "mdi:weather-night"
                  }
                  width={18}
                />
              }
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                fontSize: "0.84rem",
                minHeight: 44,
              }}
            >
              {themeLabel}
            </Button>
          </Box>
        )}
      </>
    );
  };

  return renderContent();
}
