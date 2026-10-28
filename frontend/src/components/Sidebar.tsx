"use client";

import {
  Box,
  ButtonBase,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { logoSrc } from "@/configs/branding";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import usePermission from "@/@core/hooks/custom/usePermission";

type NavItem = {
  key: string;
  label: string;
  icon: string;
  href?: string;
  permission?: string;
  onClick?: () => void;
};

const mainItems: NavItem[] = [
  {
    key: "agenda",
    label: "",
    icon: "mdi:calendar-month-outline",
    href: "/agenda",
    permission: "compromissos.visualizar",
  },
  {
    key: "publicacoes",
    label: "",
    icon: "mdi:newspaper-variant-outline",
    href: "/publicacoes?modo=interna",
    permission: "publicacoes.visualizar",
  },
  {
    key: "clientes",
    label: "",
    icon: "mdi:account-group-outline",
    href: "/clientes",
    permission: "clientes.visualizar",
  },

  {
    key: "cases",
    label: "",
    icon: "mdi:briefcase-outline",
    href: "/casos",
    permission: "casos.visualizar",
  },
];

type SidebarItemProps = {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
};

function SidebarItem({ item, active, onNavigate }: SidebarItemProps) {

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const handleClick = () => {
    item.onClick?.();
    onNavigate?.();
  };

  return (
    <ButtonBase
      component={item.href ? Link : "button"}
      href={item.href}
      onClick={handleClick}
      sx={{
        width: "100%",
        borderRadius: "12px",
        justifyContent: "flex-start",
        px: 1.6,
        py: 1.2,
        color: active ? "#ffffff" : isDark ? "#cbd5e1" : "#c4d0e6",
        bgcolor: active ? theme.palette.primary.main : "transparent",
        "&:hover": {
          bgcolor: active
            ? theme.palette.primary.main
            : isDark
              ? "rgba(148,163,184,0.2)"
              : "rgba(148,163,184,0.12)",
        },
      }}
    >
      <Icon icon={item.icon} width={21} />
      <Typography
        sx={{
          ml: 1.3,
          fontSize: "1rem",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        {item.label}
      </Typography>
    </ButtonBase>
  );
}

type Props = {
  activeKey?: string;
};

export function SidebarDashboard({ activeKey }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user, loading, hasRole } = useAuth();
  const { hasPermission } = usePermission();
  const { t } = useTranslation();
  const tt = useTranslations("public.header");
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarBackground = isDark ? "var(--sidebar)" : "#0a1834";
  const sidebarBorder = isDark ? "var(--sidebar-border)" : "#142746";
  const sidebarInnerBorder = isDark ? "var(--sidebar-border)" : "#1f3358";

  useEffect(() => {
    const openSidebar = () => setMobileOpen(true);

    window.addEventListener("dashboard-sidebar:open", openSidebar);

    return () => {
      window.removeEventListener("dashboard-sidebar:open", openSidebar);
    };
  }, []);

  if (loading) {
    const loadingContent = (
      <Box
        sx={{
          width: 280,
          height: "100dvh",
          bgcolor: sidebarBackground,
          borderRight: "1px solid",
          borderColor: sidebarBorder,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            height: 80,
            px: 2.5,
            borderBottom: "1px solid",
            borderColor: sidebarInnerBorder,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Skeleton
            variant="rounded"
            width={34}
            height={34}
            sx={{ borderRadius: "9px" }}
          />
          <Skeleton
            variant="text"
            width={150}
            sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
          />
        </Box>

        <Box sx={{ px: 2, py: 2.5, flex: 1 }}>
          <Skeleton
            variant="text"
            width={120}
            sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
          />
          <Stack spacing={1} sx={{ mt: 1.2 }}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton
                key={`sidebar-skeleton-${idx}`}
                variant="rounded"
                height={44}
                sx={{
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    );

    return (
      <>
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1200,
          }}
        >
          {loadingContent}
        </Box>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              bgcolor: sidebarBackground,
              color: "#f8fafc",
              display: { xs: "block", md: "none" },
            },
          }}
        >
          {loadingContent}
        </Drawer>
      </>
    );
  }

  if (!user) return null;

  const isAdmin = hasRole("admin");

  let translatedMainItems = mainItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  ).map((item) => {
    return { ...item, label: t(`sidebar.items.${item.key}`) };
  });

  if (isAdmin && hasPermission("usuarios.visualizar")) {
    translatedMainItems.push({
      key: "admin-users",
      label: t("sidebar.items.adminUsers"),
      icon: "mdi:account-multiple-outline",
      href: "/users",
      permission: "usuarios.visualizar",
    });
  }

  if (isAdmin) {
    translatedMainItems.push({
      key: "admin-logs",
      label: t("sidebar.items.adminLogs"),
      icon: "mdi:clipboard-text-clock-outline",
      href: "/admin/logs",
    });
  }

  const sidebarContent = (
    <Box
      sx={{
        width: 280,
        height: "100dvh",
        bgcolor: sidebarBackground,
        borderRight: "1px solid",
        borderColor: sidebarBorder,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          height: 80,
          px: 3,
          borderBottom: "1px solid",
          borderColor: sidebarInnerBorder,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", flex: 1 }}>
          <Box
            sx={{
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt="MCA Advogados"
              sx={{
                width: 45,
                height: 45,
                flexShrink: 0,
                borderRadius: "10px",
                objectFit: "contain",
                p: 0.01,
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.28))",
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#f8fafc",
                  fontSize: "0.98rem",
                  fontWeight: 800,
                  lineHeight: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {tt("title")}
              </Typography>
            </Box>
          </Box>
        </Link>
        <IconButton
          aria-label="Fechar menu lateral"
          onClick={() => setMobileOpen(false)}
          sx={{
            color: "#f8fafc",
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          <Icon icon="mdi:close" width={22} />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 2.5, flex: 1 }}>
        <Typography
          sx={{
            color: isDark ? "#94a3b8" : "#8da0c2",
            fontSize: "0.76rem",
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            mb: 1.2,
          }}
        >
          {t("sidebar.mainMenu")}
        </Typography>

        <Stack spacing={0.8}>
          {translatedMainItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1200,
        }}
      >
        {sidebarContent}
      </Box>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            bgcolor: sidebarBackground,
            color: "#f8fafc",
            display: { xs: "block", md: "none" },
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
