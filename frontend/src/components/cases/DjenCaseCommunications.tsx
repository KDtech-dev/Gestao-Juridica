"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import { ApiDjen, type ComunicacaoDjen, type DjenSyncRun } from "@/api/apiDjen";
import { Icon } from "@/components/AppIcon";
import usePermission from "@/@core/hooks/custom/usePermission";
import { formatToastErrorMessage, toast } from "@/utils/toast";

const PAGE_SIZE = 20;

const LOCALE_MAP: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

function formatDate(value: string | null, locale: string): string {
  if (!value) return "—";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(LOCALE_MAP[locale] ?? locale);
}

function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

type Props = {
  casoId: string;
  hasProcessNumber: boolean;
};

export default function DjenCaseCommunications({ casoId, hasProcessNumber }: Props) {
  const t = useTranslations("internal.cases.form.djen");
  const locale = useLocale();
  const { hasPermission } = usePermission();
  const canView = hasPermission("djen.visualizar");
  const canSync = hasPermission("djen.sincronizar");
  const [items, setItems] = useState<ComunicacaoDjen[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncRun, setSyncRun] = useState<DjenSyncRun | null>(null);
  const [syncProgressUnavailable, setSyncProgressUnavailable] = useState(false);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const loadCommunications = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    setLoadingError(false);
    try {
      const response = await ApiDjen.listar({
        caso_id: casoId,
        page: pageToLoad,
        por_pagina: PAGE_SIZE,
      });
      const result = response.data.data;
      setItems(result.items);
      setPage(result.pagination.current_page);
      setLastPage(Math.max(1, result.pagination.last_page));
      setTotal(result.pagination.total);
    } catch {
      setLoadingError(true);
    } finally {
      setLoading(false);
    }
  }, [casoId]);

  const activeSyncRunId = syncRun && (syncRun.status === "queued" || syncRun.status === "running")
    ? syncRun.id
    : null;
  const isSyncActive = activeSyncRunId !== null;

  useEffect(() => {
    if (canView) void loadCommunications(1);
  }, [canView, loadCommunications]);

  useEffect(() => {
    if (!activeSyncRunId) return;

    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const response = await ApiDjen.obterSincronizacao(activeSyncRunId);
        if (cancelled) return;

        const latest = response.data.data;
        setSyncRun(latest);
        setSyncProgressUnavailable(false);

        if (latest.status === "completed") {
          setPage(1);
          void loadCommunications(1);
          toast.success(t("syncCompleted", { count: latest.items_created }));
          return;
        }

        if (latest.status === "failed") return;
        timer = window.setTimeout(poll, 1800);
      } catch {
        if (!cancelled) setSyncProgressUnavailable(true);
      }
    };

    timer = window.setTimeout(poll, 1200);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [activeSyncRunId, loadCommunications, t]);

  const startSync = async () => {
    setSyncing(true);
    setSyncProgressUnavailable(false);
    try {
      const response = await ApiDjen.sincronizarCaso(casoId);
      setSyncRun(response.data.data);
      toast.info(response.data.message || t("syncQueued"));
    } catch (error) {
      toast.error(formatToastErrorMessage(error, t("syncError")));
    } finally {
      setSyncing(false);
    }
  };

  const markAsRead = async (communication: ComunicacaoDjen) => {
    setMarkingReadId(communication.id);
    try {
      await ApiDjen.marcarLida(communication.id);
      setItems((current) => current.map((item) => item.id === communication.id
        ? { ...item, lida: true, lida_em: new Date().toISOString() }
        : item));
    } catch (error) {
      toast.error(formatToastErrorMessage(error, t("markReadError")));
    } finally {
      setMarkingReadId(null);
    }
  };

  if (!canView) return null;

  const unreadCount = items.filter((item) => !item.lida).length;
  const syncStatusLabel = syncRun?.status === "queued"
    ? t("syncStatus.queued")
    : t("syncStatus.running");

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={2.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={1.5}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {t("title")}
              </Typography>
              {unreadCount > 0 && <Chip size="small" color="primary" label={t("unreadCount", { count: unreadCount })} />}
            </Stack>
            <Typography color="text.secondary" mt={0.5}>
              {t("description", { total })}
            </Typography>
          </Box>
          {canSync && (
            <Button
              variant="contained"
              onClick={() => void startSync()}
              disabled={!hasProcessNumber || syncing || isSyncActive}
              startIcon={syncing || isSyncActive
                ? <CircularProgress size={17} color="inherit" />
                : <Icon icon="mdi:refresh" width={19} />}
              sx={{ alignSelf: { xs: "stretch", sm: "center" }, whiteSpace: "nowrap" }}
            >
              {syncing || isSyncActive ? t("syncing") : t("sync")}
            </Button>
          )}
        </Stack>

        {canSync && !hasProcessNumber && (
          <Alert severity="info">{t("missingProcessNumber")}</Alert>
        )}

        {syncRun && isSyncActive && (
          <Box>
            <Stack direction="row" justifyContent="space-between" gap={1} mb={0.75}>
              <Typography variant="body2" fontWeight={600}>{syncStatusLabel}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("syncProgress", { pages: syncRun.pages_completed, items: syncRun.items_processed })}
              </Typography>
            </Stack>
            <LinearProgress />
          </Box>
        )}

        {syncRun?.status === "failed" && <Alert severity="error">{t("syncFailed")}</Alert>}
        {syncProgressUnavailable && <Alert severity="warning">{t("syncProgressUnavailable")}</Alert>}

        {loadingError && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void loadCommunications(page)}>{t("retryLoad")}</Button>}>
            {t("loadError")}
          </Alert>
        )}

        {loading && items.length === 0 ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography color="text.secondary">{t("loading")}</Typography>
          </Stack>
        ) : !loadingError && items.length === 0 ? (
          <Typography color="text.secondary">{t("empty")}</Typography>
        ) : (
          <Stack spacing={1.25}>
            {items.map((communication) => (
              <Accordion
                key={communication.id}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: communication.lida ? "divider" : "primary.light",
                  borderRadius: "12px !important",
                  overflow: "hidden",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" width={21} />}>
                  <Stack spacing={0.65} sx={{ minWidth: 0, width: "100%", pr: 1 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={0.75}>
                      <Typography fontWeight={700} color="text.primary">
                        {communication.tipo_comunicacao || t("communicationFallback")}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        {!communication.lida && <Chip size="small" color="primary" label={t("unread")} />}
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(communication.data_disponibilizacao, locale)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {[communication.sigla_tribunal, communication.nome_orgao].filter(Boolean).join(" · ") || t("courtUnavailable")}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {communication.sigla_tribunal && <Chip size="small" variant="outlined" label={communication.sigla_tribunal} />}
                      {communication.tipo_comunicacao && <Chip size="small" variant="outlined" label={communication.tipo_comunicacao} />}
                      {communication.status_djen && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={t("publicationStatus", { status: communication.status_djen })}
                        />
                      )}
                    </Stack>
                    {communication.nome_orgao && (
                      <Typography variant="body2" color="text.secondary">
                        {t("court")}: {communication.nome_orgao}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        maxHeight: 360,
                        overflow: "auto",
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                        {communication.texto || t("textUnavailable")}
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      {safeExternalUrl(communication.link) && (
                        <Button
                          component="a"
                          href={safeExternalUrl(communication.link)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          startIcon={<Icon icon="mdi:open-in-new" width={18} />}
                        >
                          {t("officialLink")}
                        </Button>
                      )}
                      {!communication.lida && (
                        <Button
                          variant="text"
                          onClick={() => void markAsRead(communication)}
                          disabled={markingReadId !== null}
                          startIcon={markingReadId === communication.id
                            ? <CircularProgress size={16} />
                            : <Icon icon="mdi:check" width={18} />}
                        >
                          {t("markRead")}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
            {lastPage > 1 && (
              <Stack direction="row" justifyContent="center" pt={1}>
                <Pagination
                  count={lastPage}
                  page={page}
                  onChange={(_, nextPage) => {
                    setPage(nextPage);
                    void loadCommunications(nextPage);
                  }}
                  color="primary"
                />
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
