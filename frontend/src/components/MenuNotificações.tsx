"use client";
import {
  Menu,
  Box,
  Stack,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

export type Notificacao = {
  id: string;
  titulo: string;
  descricao: string;
  lida: boolean;
  tipo?: "mencao" | "tarefa" | "sistema" | "aviso";
  tempo?: string;
};

type MenuNotificacoesProps = {
  elementoAncora: HTMLElement | null;
  aberto: boolean;
  temaEscuro: boolean;
  notificacoes: Notificacao[];
  aoFechar: () => void;
  aoMarcarTodasComoLidas: () => void;
  aoLimparTodas: () => void;
  aoMarcarComoLida: (id: string) => void;
};

type TipoConfig = {
  icon: string;
  color: string;
};

const tipoConfig: Record<string, TipoConfig> = {
  mencao: {
    icon: "mdi:user",
    color: "secondary",
  },
  tarefa: {
    icon: "mdi:check-circle",
    color: "success",
  },
  sistema: {
    icon: "mdi:shield-check",
    color: "primary",
  },
  aviso: {
    icon: "mdi:alert-circle-outline",
    color: "warning",
  },
};

const defaultConfig: TipoConfig = {
  icon: "mdi:bell-outline",
  color: "primary",
};

export default function MenuNotificacoes({
  elementoAncora,
  aberto,
  notificacoes,
  aoFechar,
  aoMarcarTodasComoLidas,
  aoLimparTodas,
  aoMarcarComoLida,
}: MenuNotificacoesProps) {
  const theme = useTheme();
  const [notificacaoSelecionada, setNotificacaoSelecionada] =
    useState<Notificacao | null>(null);
  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  const isDark = theme.palette.mode === "dark";

  const getTone = (config: TipoConfig) => {
    const palette =
      config.color === "secondary"
        ? theme.palette.secondary
        : config.color === "success"
          ? theme.palette.success
          : config.color === "warning"
            ? theme.palette.warning
            : theme.palette.primary;

    return {
      color: palette.main,
      bg: alpha(palette.main, isDark ? 0.18 : 0.1),
      unreadBg: alpha(palette.main, isDark ? 0.14 : 0.08),
    };
  };

  const actionButtonSx = {
    fontSize: "0.72rem",
    color: "text.secondary",
    background: "none",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "7px",
    px: 1.1,
    py: 0.5,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.15s",
    "&:hover": {
      bgcolor: "action.hover",
      color: "text.primary",
    },
  };

  const aoClicarItem = (item: Notificacao) => () => {
    aoMarcarComoLida(item.id);
    setNotificacaoSelecionada({ ...item, lida: true });
    aoFechar();
  };

  return (
    <>
      <Menu
        anchorEl={elementoAncora}
        open={aberto}
        onClose={aoFechar}
        disableScrollLock
        PaperProps={{
          elevation: 0,
          sx: {
            width: 380,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: "14px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            boxShadow: theme.shadows[8],
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              Notificações
            </Typography>
            {naoLidas > 0 && (
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  px: "7px",
                  py: "1px",
                  borderRadius: "999px",
                  lineHeight: 1.6,
                }}
              >
                {naoLidas}
              </Box>
            )}
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Box
              component="button"
              onClick={aoMarcarTodasComoLidas}
              sx={actionButtonSx}
            >
              <Icon icon="mdi:check-all" width={15} />
              Lidas
            </Box>

            <Box component="button" onClick={aoLimparTodas} sx={actionButtonSx}>
              <Icon icon="mdi:trash-can-outline" width={15} />
              Limpar
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Divider
        sx={{
          borderColor: "divider",
        }}
      />

      <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
        {notificacoes.length === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: "center",
              color: "text.disabled",
            }}
          >
            <Icon icon="mdi:bell-sleep-outline" width={24} />
            <Typography fontSize="0.8rem">Nenhuma notificação</Typography>
          </Box>
        ) : (
          notificacoes.slice(0, 8).map((item) => {
            const config = tipoConfig[item.tipo ?? ""] ?? defaultConfig;
            const tone = getTone(config);

            return (
              <Box
                key={item.id}
                onClick={aoClicarItem(item)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  bgcolor: item.lida ? "transparent" : tone.unreadBg,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  transition: "background 0.15s",
                  "&:last-child": { borderBottom: "none" },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    bgcolor: tone.bg,
                    border: "1px solid",
                    borderColor: alpha(tone.color, isDark ? 0.24 : 0.16),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  <Icon icon={config.icon} width={18} color={tone.color} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={0.2}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "text.primary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "80%",
                      }}
                    >
                      {item.titulo}
                    </Typography>
                    {item.tempo && (
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "text.disabled",
                          flexShrink: 0,
                          ml: 1,
                        }}
                      >
                        {item.tempo}
                      </Typography>
                    )}
                  </Stack>

                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.descricao}
                  </Typography>
                </Box>

                {!item.lida && (
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      flexShrink: 0,
                      mt: 0.8,
                    }}
                  />
                )}
              </Box>
            );
          })
        )}
      </Box>

      <Divider
        sx={{
          borderColor: "divider",
        }}
      />
      <Box sx={{ py: 1.2, textAlign: "center" }}>
        <Typography
          component={Link}
          href="/notificacoes"
          onClick={aoFechar}
          sx={{
            fontSize: "0.78rem",
            color: "text.disabled",
            cursor: "pointer",
            textDecoration: "none",
            "&:hover": {
              color: "text.secondary",
            },
          }}
        >
          Ver histórico completo
        </Typography>
      </Box>
      </Menu>

      <Dialog
        open={Boolean(notificacaoSelecionada)}
        onClose={() => setNotificacaoSelecionada(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={1.4}>
            <Stack direction="row" alignItems="center" gap={1.2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  flexShrink: 0,
                }}
              >
                <Icon icon="mdi:bell-outline" width={21} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} color="text.primary">
                  {notificacaoSelecionada?.titulo}
                </Typography>
                {notificacaoSelecionada?.tempo && (
                  <Typography fontSize="0.78rem" color="text.secondary">
                    {notificacaoSelecionada.tempo}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider />

            <Typography color="text.secondary" fontSize="0.94rem" lineHeight={1.7}>
              {notificacaoSelecionada?.descricao ||
                "Esta notificação não possui descrição."}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNotificacaoSelecionada(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
