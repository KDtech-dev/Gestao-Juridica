"use client";

import { Box, ButtonBase, Skeleton, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  key: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
};

const mainItems: NavItem[] = [
  {
    key: "agenda",
    label: "Agenda",
    icon: "mdi:calendar-month-outline",
    href: "/agenda",
  },
  {
    key: "clientes",
    label: "Clientes",
    icon: "mdi:account-group-outline",
    href: "/clients",
  },

  {
    key: "publicacoes",
    label: "Publicações",
    icon: "mdi:newspaper-variant-outline",
    href: "/publicacoes?modo=interna",
  },
  {
    key: "cases",
    label: "Casos",
    icon: "mdi:briefcase-outline",
    href: "/cases",
  },
];

const bottomItems: NavItem[] = [
  {
    key: "perfil",
    label: "Meu Perfil",
    icon: "mdi:account-outline",
    href: "/profile",
  },
  {
    key: "sair",
    label: "Sair",
    icon: "mdi:logout",
  },
];

type SidebarItemProps = {
  item: NavItem;
  active: boolean;
};

function SidebarItem({ item, active }: SidebarItemProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <ButtonBase
      component={item.href ? Link : "button"}
      href={item.href}
      onClick={item.onClick}
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
  const { user, loading, logout, hasRole } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          width: 280,
          height: "100dvh",
          bgcolor: isDark ? "#0b1220" : "#0a1834",
          borderRight: "1px solid",
          borderColor: isDark ? "#1e293b" : "#142746",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1200,
        }}
      >
        <Box
          sx={{
            height: 80,
            px: 3,
            borderBottom: "1px solid",
            borderColor: isDark ? "#1e293b" : "#1f3358",
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

        <Box
          sx={{
            px: 2,
            py: 2.5,
            borderTop: "1px solid",
            borderColor: isDark ? "#1e293b" : "#1f3358",
          }}
        >
          <Stack spacing={1}>
            <Skeleton
              variant="rounded"
              height={44}
              sx={{
                borderRadius: "12px",
                bgcolor: "rgba(255,255,255,0.08)",
              }}
            />
            <Skeleton
              variant="rounded"
              height={44}
              sx={{
                borderRadius: "12px",
                bgcolor: "rgba(255,255,255,0.08)",
              }}
            />
          </Stack>
        </Box>
      </Box>
    );
  }

  // Avoid rendering a "default" menu when auth hasn't loaded a user.
  if (!user) return null;

  const isClient = hasRole("cliente");
  const isAdmin = hasRole("admin");

  let translatedMainItems = mainItems.map((item) => {
    // Ajustes específicos para visão do cliente (legado)
    if (item.key === "clientes" && isClient) {
      return { ...item, label: "Meus Casos", href: "/meu-caso" };
    }
    return item;
  });

  if (isAdmin) {
    translatedMainItems.push({
      key: "admin-users",
      label: "Usuários",
      icon: "mdi:account-multiple-outline",
      href: "/admin/users",
    });
  }

  // Se for cliente, mostrar apenas os itens permitidos
  if (isClient) {
    translatedMainItems = translatedMainItems.filter((it) =>
      ["clientes", "publicacoes"].includes(it.key),
    );
  }

  const translatedBottomItems = bottomItems.map((item) => {
    if (item.key === "sair") {
      return {
        ...item,
        label: "Sair",
        href: undefined,
        onClick: () => {
          logout();
        },
      };
    }

    return {
      ...item,
      label: item.key === "perfil" ? "Meu Perfil" : item.label,
    };
  });

  return (
    <Box
      sx={{
        width: 280,
        height: "100dvh",
        bgcolor: isDark ? "#0b1220" : "#0a1834",
        borderRight: "1px solid",
        borderColor: isDark ? "#1e293b" : "#142746",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1200,
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Box
          sx={{
            height: 80,
            px: 3,
            borderBottom: "1px solid",
            borderColor: isDark ? "#1e293b" : "#1f3358",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "9px",
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
            }}
          >
            <Icon icon="mdi:scale-balance" width={20} color="#fff" />
          </Box>
          <Typography fontWeight={700} fontSize="1.1rem" color="#f8fafc">
            Central jurídica
          </Typography>
        </Box>
      </Link>

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
          Menu Principal
        </Typography>

        <Stack spacing={0.8}>
          {translatedMainItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 2.5,
          borderTop: "1px solid",
          borderColor: isDark ? "#1e293b" : "#1f3358",
          bgcolor: isDark ? "#0b1220" : "#0a1834",
          flexShrink: 0,
        }}
      >
        <Stack spacing={0.8}>
          {translatedBottomItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
