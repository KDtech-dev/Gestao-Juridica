"use client";

import {
  Autocomplete,
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
import { Icon } from "@iconify/react";
import {
  useMemo,
  useState,
  type KeyboardEventHandler,
  type MouseEvent,
} from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@mui/material/styles";
import { cases, listTrackedClients } from "@/data/cases";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import MenuNotificacoes, {
  type Notificacao,
} from "@/components/MenuNotificações";
import UserDropdown from "@/components/Userdropdown";

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
  const { notifications, unreadCount, markAllAsRead, clearAll, markAsRead } =
    useNotifications();
  const { user, loading } = useAuth();
  const handleCloseNotifications = () => setAnchorEl(null);
  const notificacoes = useMemo<Notificacao[]>(
    () =>
      notifications.map((notification) => ({
        id: notification.id,
        titulo: notification.title,
        descricao: notification.description,
        lida: notification.read,
        tipo: notification.type,
      })),
    [notifications],
  );
  const searchOptions = useMemo(() => {
    const clientOptions = listTrackedClients().map((client) => ({
      label: client.name,
      subtitle: "Cliente",
      href: `/acompanhamento/${client.slug}`,
    }));
    const caseOptions = cases.map((item) => ({
      label: item.caseTitle,
      subtitle: `Caso • ${item.clientName}`,
      href: `/acompanhamento/${item.clientSlug}/${item.caseSlug}`,
    }));
    return [...clientOptions, ...caseOptions];
  }, []);

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
  const handleSearchInputChange = (_: unknown, value: string) =>
    setSearchValue(value);
  const handleSearchOptionChange = (
    _: unknown,
    option: { href: string } | string | null,
  ) => {
    if (!option || typeof option === "string") return;
    router.push(option.href);
  };
  const handleSearchKeyDown: KeyboardEventHandler = (event) => {
    if (event.key !== "Enter") return;
    const firstMatch = searchOptions.find((option) =>
      `${option.label} ${option.subtitle}`
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
    );
    if (firstMatch) {
      router.push(firstMatch.href);
      return;
    }
    router.push("/clients");
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

      {showSearch && (
        <Autocomplete
          freeSolo
          fullWidth
          sx={{
            order: { xs: 3, md: 0 },
            flexBasis: { xs: "100%", md: "auto" },
            maxWidth: { xs: "100%", md: 460 },
            minWidth: { xs: 0, md: 320 },
          }}
          options={searchOptions}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label
          }
          filterOptions={(options, state) =>
            options.filter((option) =>
              `${option.label} ${option.subtitle}`
                .toLowerCase()
                .includes(state.inputValue.toLowerCase()),
            )
          }
          onInputChange={handleSearchInputChange}
          onChange={handleSearchOptionChange}
          renderOption={(props, option) => {
            const { key, ...rest } = props;

            return (
              <Box component="li" key={key} {...rest} sx={{ py: 1 }}>
                <Box>
                  <Typography
                    fontSize="0.9rem"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {option.label}
                  </Typography>
                  <Typography fontSize="0.78rem" color="text.secondary">
                    {option.subtitle}
                  </Typography>
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={"Buscar clientes, processos ou tarefas..."}
              onKeyDown={handleSearchKeyDown}
              sx={{
                maxWidth: { xs: "100%", md: 460 },
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
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:magnify" width={20} color="currentColor" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: { xs: "none", md: "block" } }} />

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
              variant={unreadCount > 0 ? "dot" : "standard"}
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
        aoLimparTodas={clearAll}
        aoMarcarComoLida={markAsRead}
      />
    </Box>
  );
}
