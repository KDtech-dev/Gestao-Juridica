"use client";

import {
  Badge,
  Box,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import {
  useMemo,
  useState,
  type KeyboardEventHandler,
  type MouseEvent,
} from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import MenuNotificacoes, {
  type Notificacao,
} from "@/components/MenuNotificações";
import UserDropdown from "@/components/Userdropdown";
import { logoSrc } from "./Footer";

type Props = {
  showSearch?: boolean;
  showMenuButton?: boolean;
};

export function HeaderDashboard({
  showSearch = true,
  showMenuButton = true,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const isDark = theme.palette.mode === "dark";
  const {
    menuNotifications,
    menuUnreadCount,
    markAllAsRead,
    clearMenu,
    markAsRead,
  } = useNotifications();
  const { user, loading } = useAuth();
  const handleCloseNotifications = () => setAnchorEl(null);
  const notificacoes = useMemo<Notificacao[]>(
    () =>
      menuNotifications.map((notification) => ({
        id: notification.id,
        titulo: notification.title,
        descricao: notification.description,
        lida: notification.read,
        tipo: notification.type,
      })),
    [menuNotifications],
  );

  if (loading) {
    return (
      <Box
        sx={{
          height: 80,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 2, md: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {showSearch ? (
          <Skeleton
            variant="rounded"
            sx={{
              width: { xs: "100%", sm: 420 },
              height: 46,
              borderRadius: "10px",
            }}
          />
        ) : (
          <Box />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }} />
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Skeleton variant="circular" width={36} height={36} />
        </Stack>
      </Box>
    );
  }

  if (!user) return null;

  const handleOpenNotifications = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleOpenSidebar = () => {
    window.dispatchEvent(new CustomEvent("dashboard-sidebar:open"));
  };
  const handleSearchInputChange = (value: string) => setSearchValue(value);
  const handleSearchKeyDown: KeyboardEventHandler = (event) => {
    if (event.key !== "Enter") return;
    const query = searchValue.trim();
    const target = query ? `/casos?search=${encodeURIComponent(query)}` : "/casos";
    router.push(target);
  };

  return (
    <Box
      sx={{
        minHeight: { xs: showSearch ? 112 : 64, md: 80 },
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: { xs: 1.5, sm: 2, md: 4 },
        py: { xs: 1, md: 0 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: { xs: "wrap", md: "nowrap" },
        gap: { xs: 1, md: 2 },
      }}
    >
      {isMobile && showMenuButton && (
        <Tooltip title="Abrir menu">
          <IconButton
            aria-label="Abrir menu lateral"
            onClick={handleOpenSidebar}
            sx={{
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              width: 40,
              height: 40,
              flexShrink: 0,
            }}
          >
            <Icon icon="mdi:menu" width={22} />
          </IconButton>
        </Tooltip>
      )}

      <Box
        component={Link}
        href="/"
        aria-label="Central Jurídica"
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={logoSrc}
          alt="Central Jurídica"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "9px",
            objectFit: "contain",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.28))",
          }}
        />
      </Box>

      {showSearch && (
        <TextField
          fullWidth
          value={searchValue}
          onChange={(event) => handleSearchInputChange(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Buscar casos ou clientes..."
          sx={{
            order: { xs: 3, md: 0 },
            flexBasis: { xs: "100%", md: "auto" },
            maxWidth: { xs: "100%", md: 460 },
            minWidth: { xs: 0, md: 320 },
            "& .MuiOutlinedInput-root": {
              height: 46,
              borderRadius: "10px",
              bgcolor: "background.default",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
            },
            "& input": {
              py: 1.2,
              fontSize: "0.95rem",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="mdi:magnify" width={20} color="currentColor" />
              </InputAdornment>
            ),
          }}
        />
      )}

      <Box
        sx={{ flex: 1, minWidth: 0, display: { xs: "none", md: "block" } }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.9,
          flexShrink: 0,
          ml: "auto",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "grid",
            placeItems: "center",
          }}
        >
          <IconButton
            sx={{ color: "text.secondary", p: 0.45 }}
            onClick={handleOpenNotifications}
          >
            <Badge
              color="error"
              variant={menuUnreadCount > 0 ? "dot" : "standard"}
              overlap="circular"
            >
              <Icon icon="mdi:bell-outline" width={19} />
            </Badge>
          </IconButton>
        </Box>

        <Box
          sx={{
            width: 1,
            height: 28,
            bgcolor: "divider",
            mx: 0.2,
          }}
        />

        <UserDropdown />
      </Box>
      <MenuNotificacoes
        elementoAncora={anchorEl}
        aberto={Boolean(anchorEl)}
        temaEscuro={isDark}
        notificacoes={notificacoes}
        aoFechar={handleCloseNotifications}
        aoMarcarTodasComoLidas={markAllAsRead}
        aoLimparTodas={clearMenu}
        aoMarcarComoLida={markAsRead}
      />
    </Box>
  );
}
