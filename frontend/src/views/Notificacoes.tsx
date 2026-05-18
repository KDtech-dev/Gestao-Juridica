"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useState } from "react";
import {
  type NotificationItem,
  useNotifications,
} from "@/context/NotificationsContext";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function notificationIcon(type?: NotificationItem["type"]) {
  if (type === "aviso") return "mdi:alert-circle-outline";
  if (type === "tarefa") return "mdi:calendar-check-outline";
  if (type === "mencao") return "mdi:account-outline";

  return "mdi:bell-outline";
}

export default function NotificacoesView() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  function openNotification(notification: NotificationItem) {
    setSelected({ ...notification, read: true });
    if (!notification.read) {
      markAsRead(notification.id);
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="notificacoes" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            gap={2}
            mb={2.5}
          >
            <Box>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  Notificações
                </Typography>
                {unreadCount > 0 && (
                  <Chip label={`${unreadCount} não lida(s)`} color="primary" />
                )}
              </Stack>
              <Typography color="text.secondary" fontSize="0.9rem">
                Acompanhe lembretes de compromissos e avisos do sistema.
              </Typography>
            </Box>

            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Icon icon="mdi:check-all" />}
                onClick={markAllAsRead}
                disabled={notifications.length === 0 || unreadCount === 0}
              >
                Marcar lidas
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<Icon icon="mdi:trash-can-outline" />}
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                Limpar
              </Button>
            </Stack>
          </Stack>

          <Paper
            sx={{
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            {notifications.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                <Icon icon="mdi:bell-sleep-outline" width={34} />
                <Typography mt={1} fontWeight={700}>
                  Nenhuma notificação encontrada
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => (
                <Box
                  key={notification.id}
                  component="button"
                  type="button"
                  onClick={() => openNotification(notification)}
                  sx={{
                    width: "100%",
                    border: 0,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: notification.read
                      ? "background.paper"
                      : "rgba(25,118,210,0.08)",
                    textAlign: "left",
                    px: { xs: 2, md: 2.5 },
                    py: 1.8,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    "&:last-child": { borderBottom: 0 },
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        flexShrink: 0,
                      }}
                    >
                      <Icon icon={notificationIcon(notification.type)} width={20} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        gap={0.6}
                      >
                        <Typography fontWeight={800} color="text.primary">
                          {notification.title}
                        </Typography>
                        <Typography fontSize="0.78rem" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography
                        color="text.secondary"
                        fontSize="0.9rem"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mt: 0.4,
                        }}
                      >
                        {notification.description}
                      </Typography>
                    </Box>

                    {!notification.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "999px",
                          bgcolor: "primary.main",
                          mt: 1.3,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              ))
            )}
          </Paper>
        </Container>
      </Box>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={1.4}>
            <Typography fontWeight={800} fontSize="1.1rem">
              {selected?.title}
            </Typography>
            <Typography fontSize="0.82rem" color="text.secondary">
              {selected ? formatDate(selected.createdAt) : ""}
            </Typography>
            <Divider />
            <Typography color="text.secondary" lineHeight={1.7}>
              {selected?.description || "Esta notificação não possui descrição."}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelected(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
