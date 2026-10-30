"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Drawer,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import type { PointerEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRouteByRole } from "@/utils/redirectByRole";
import { logoSrc } from "@/configs/branding";
import { useTranslations } from "next-intl";
import { useThemeMode } from "@/theme/ThemeRegistry";
import { Icon } from "@/components/AppIcon";
import { useLanguage, type Language } from "@/context/LanguageContext";

const languageOptions: Record<
  Language,
  { shortLabel: string; labelKey: "portuguese" | "english" | "spanish" }
> = {
  pt: { shortLabel: "PT", labelKey: "portuguese" },
  en: { shortLabel: "EN", labelKey: "english" },
  es: { shortLabel: "ES", labelKey: "spanish" },
};

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = useTranslations("public.header");
  const theme = useTheme();
  const { setThemeMode } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 16, y: 112 });
  const dragRef = useRef({
    active: false,
    moved: false,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isDark = theme.palette.mode === "dark";
  const accessHref =
    isAuthenticated && user ? getRouteByRole(user.roles) : "/login";

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

  const handleFloatingPointerDown = (
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      moved: false,
      offsetX: event.clientX - floatingPosition.x,
      offsetY: event.clientY - floatingPosition.y,
    };
  };

  const handleFloatingPointerMove = (
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    if (!dragRef.current.active) return;

    const buttonSize = 48;
    const nextX = Math.max(
      8,
      Math.min(
        window.innerWidth - buttonSize - 8,
        event.clientX - dragRef.current.offsetX,
      ),
    );
    const nextY = Math.max(
      8,
      Math.min(
        window.innerHeight - buttonSize - 8,
        event.clientY - dragRef.current.offsetY,
      ),
    );

    if (
      Math.abs(nextX - floatingPosition.x) > 3 ||
      Math.abs(nextY - floatingPosition.y) > 3
    ) {
      dragRef.current.moved = true;
    }

    setFloatingPosition({ x: nextX, y: nextY });
  };

  const handleFloatingPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;

    if (!wasMoved) {
      setFloatingOpen((open) => !open);
    }
  };

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
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={{ xs: 1, md: 2 }}
              py={{ xs: 1, md: 2 }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 0.75, sm: 1 }}
                alignItems="center"
                sx={{
                  minWidth: 0,
                  width: "auto",
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
                      height: 34,
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
                          minHeight: 34,
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
                      height: 34,
                      width: 34,
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
                  <Box
                    component="img"
                    src={logoSrc}
                    alt={t('title')}
                    sx={{
                      width: { xs: 44, sm: 60 },
                      height: { xs: 44, sm: 60 },
                      borderRadius: 2,
                      objectFit: "contain",
                      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))",
                      flexShrink: 0,
                    }}
                  />

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
                      {t("title")}
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
                      Advocacia & Consultoria
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                spacing={{ xs: 0.75, sm: 2 }}
                alignItems="center"
                justifyContent={{ xs: "space-between", md: "flex-end" }}
                sx={{ minWidth: 0, width: "auto" }}
              >
                <Stack
                  component="nav"
                  direction="row"
                  spacing={{ xs: 0.5, sm: 1 }}
                  alignItems="center"
                  sx={{
                    display: { xs: "none", md: "flex" },
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
                        color: "text.primary",
                        textTransform: "none",
                        fontWeight: 700,
                        px: { xs: 0.75, sm: 1.5 },
                        minWidth: "auto",
                        fontSize: { xs: "0.78rem", sm: "0.875rem" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>

                {!loading && (
                  <Button
                    component={Link}
                    href={accessHref}
                    variant="contained"
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
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
                <IconButton
                  type="button"
                  aria-label={t("menuOpen")}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="public-mobile-navigation"
                  onClick={() => {
                    setFloatingOpen(false);
                    setMobileMenuOpen(true);
                  }}
                  sx={{ display: { xs: "inline-flex", md: "none" }, color: "text.primary" }}
                >
                  <Icon icon="mdi:menu" width={26} />
                </IconButton>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{
            id: "public-mobile-navigation",
            sx: {
              width: "min(320px, 88vw)",
              bgcolor: "background.paper",
              color: "text.primary",
              p: 2.5,
            },
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={800}>{t("title")}</Typography>
              <IconButton
                type="button"
                aria-label={t("menuClose")}
                onClick={() => setMobileMenuOpen(false)}
                edge="end"
              >
                <Icon icon="mdi:close" width={22} />
              </IconButton>
            </Stack>
            <Stack component="nav" spacing={0.75} aria-label={t("menuOpen")}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  variant={item.active ? "contained" : "text"}
                  sx={{
                    justifyContent: "flex-start",
                    px: 1.5,
                    py: 1.1,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {!loading && (
                <Button
                  component={Link}
                  href={accessHref}
                  onClick={() => setMobileMenuOpen(false)}
                  variant="contained"
                  sx={{ mt: 1, borderRadius: "999px", textTransform: "none", fontWeight: 700 }}
                >
                  {isAuthenticated ? t("access") : t("login")}
                </Button>
              )}
            </Stack>
          </Stack>
        </Drawer>

        <Box
          sx={{
            display: { xs: mobileMenuOpen ? "none" : "block", md: "none" },
            position: "fixed",
            left: floatingPosition.x,
            top: floatingPosition.y,
            zIndex: 1300,
            touchAction: "none",
          }}
        >
          <Tooltip title={accessibilityLabel}>
            <IconButton
              type="button"
              aria-label={accessibilityLabel}
              onPointerDown={handleFloatingPointerDown}
              onPointerMove={handleFloatingPointerMove}
              onPointerUp={handleFloatingPointerUp}
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.28)",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              <Icon icon="mdi:accessibility" width={24} />
            </IconButton>
          </Tooltip>
        </Box>

        {floatingOpen && (
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              position: "fixed",
              left: `min(${floatingPosition.x}px, calc(100vw - 196px))`,
              top: `min(${floatingPosition.y + 56}px, calc(100vh - 164px))`,
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
                height: 36,
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
