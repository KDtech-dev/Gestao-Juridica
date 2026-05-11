"use client";

import {
  Autocomplete,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
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

type Props = {
  userName?: string;
  userRole?: string;
  showSearch?: boolean;
};

export function HeaderDashboard({
  userName: propUserName,
  userRole: propUserRole,
  showSearch = true,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === "dark";
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();

  const { user, loading } = useAuth();

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
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </Box>
        </Stack>
      </Box>
    );
  }

  if (!user && !propUserName) return null;

  const name = propUserName || user?.name || "Usuário";
  const role = propUserRole || (user?.roles?.[0] ? String(user.roles[0]) : "");

  const initials = (name || "")
    .split(" ")
    .map((p: string) => p[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const handleOpenNotifications = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleCloseNotifications = () => setAnchorEl(null);
  const handleMarkNotificationAsRead = (id: string) => () => markAsRead(id);
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
      {showSearch && (
        <Autocomplete
          freeSolo
          fullWidth
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
                maxWidth: 460,
                "& .MuiOutlinedInput-root": {
                  height: 46,
                  borderRadius: "10px",
                  bgcolor: isDark ? "#0f172a" : "#f8fafc",
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

      <Box sx={{ flex: 1, minWidth: 0 }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.9,
          flexShrink: 0,
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

        <Box
          sx={{
            textAlign: "right",
            display: { xs: "none", sm: "block" },
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          <Typography
            fontSize="0.92rem"
            fontWeight={700}
            color="text.primary"
            whiteSpace="nowrap"
          >
            {name}
          </Typography>
          <Typography
            fontSize="0.75rem"
            color="text.secondary"
            mt={0.18}
            whiteSpace="nowrap"
          >
            {role}
          </Typography>
        </Box>

        <Avatar
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80"
          alt={name}
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#1d4ed8",
            fontSize: "0.84rem",
            ml: 0.1,
            cursor: "pointer",
          }}
        >
          {initials}
        </Avatar>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseNotifications}
        PaperProps={{
          sx: {
            width: 360,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            px: 1.6,
            py: 1.2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight={700} color="text.primary">
              Notificações
            </Typography>
            <Stack direction="row" spacing={0.8}>
              <Typography
                fontSize="0.75rem"
                color="primary.main"
                sx={{ cursor: "pointer" }}
                onClick={markAllAsRead}
              >
                Marcar tudo como lido
              </Typography>
              <Typography
                fontSize="0.75rem"
                color="text.secondary"
                sx={{ cursor: "pointer" }}
                onClick={clearAll}
              >
                Limpar
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography color="text.secondary" fontSize="0.86rem">
              Sem notificações por enquanto.
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 8).map((item) => (
            <MenuItem
              key={item.id}
              onClick={handleMarkNotificationAsRead(item.id)}
              sx={{
                alignItems: "flex-start",
                whiteSpace: "normal",
                py: 1.2,
                bgcolor: item.read
                  ? "transparent"
                  : isDark
                    ? "rgba(96,165,250,0.15)"
                    : "#eff6ff",
              }}
            >
              <Box>
                <Typography
                  fontSize="0.86rem"
                  fontWeight={600}
                  color="text.primary"
                >
                  {item.title}
                </Typography>
                <Typography fontSize="0.8rem" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}
