"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box,
  Button, Checkbox, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, Pagination, Paper, Stack,
  TextField, Typography,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import { ApiDjen, type ComunicacaoDjen } from "@/api/apiDjen";
import { getCasos } from "@/api/apiCasos";
import type { CasoType } from "@/@core/types";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import usePermission from "@/@core/hooks/custom/usePermission";
import { formatToastErrorMessage, toast } from "@/utils/toast";

const PAGE_SIZE = 20;
const localeMap: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

function formatDate(value: string | null, locale: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(localeMap[locale] ?? locale);
}

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function DjenTriage() {
  const t = useTranslations("internal.djen.triage");
  const locale = useLocale();
  const { hasPermission } = usePermission();
  const canView = hasPermission("djen.visualizar");
  const canLink = hasPermission("djen.vincular") && hasPermission("casos.visualizar");
  const [items, setItems] = useState<ComunicacaoDjen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tribunalInput, setTribunalInput] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [filter, setFilter] = useState({ tribunal: "", dateStart: "", dateEnd: "", unreadOnly: false });
  const [linkTarget, setLinkTarget] = useState<ComunicacaoDjen | null>(null);
  const [cases, setCases] = useState<CasoType[]>([]);
  const [caseSearch, setCaseSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState<CasoType | null>(null);
  const [loadingCases, setLoadingCases] = useState(false);
  const [linking, setLinking] = useState(false);

  const loadItems = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    setError(false);
    try {
      const response = await ApiDjen.listar({
        sem_caso: true,
        somente_nao_lidas: filter.unreadOnly || undefined,
        sigla_tribunal: filter.tribunal || undefined,
        data_inicio: filter.dateStart || undefined,
        data_fim: filter.dateEnd || undefined,
        page: pageToLoad,
        por_pagina: PAGE_SIZE,
      });
      const result = response.data.data;
      setItems(result.items);
      setPage(result.pagination.current_page);
      setLastPage(Math.max(1, result.pagination.last_page));
      setTotal(result.pagination.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (canView) void loadItems(1);
  }, [canView, loadItems]);

  useEffect(() => {
    if (!linkTarget || !canLink) return;
    let cancelled = false;
    setLoadingCases(true);
    const timeout = window.setTimeout(() => {
      void getCasos({ page: 1, per_page: 100, search: caseSearch.trim() || undefined })
        .then((response) => { if (!cancelled) setCases(response.data); })
        .catch(() => { if (!cancelled) toast.error(t("caseLoadError")); })
        .finally(() => { if (!cancelled) setLoadingCases(false); });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [linkTarget, caseSearch, canLink, t]);

  const applyFilters = () => {
    setFilter({ tribunal: tribunalInput.trim().toUpperCase(), dateStart, dateEnd, unreadOnly });
  };

  const openLinkDialog = (item: ComunicacaoDjen) => {
    setCaseSearch("");
    setSelectedCase(null);
    setLinkTarget(item);
  };

  const linkToCase = async () => {
    if (!linkTarget || !selectedCase || !canLink) return;
    setLinking(true);
    try {
      await ApiDjen.vincular(linkTarget.id, selectedCase.id);
      toast.success(t("linkSuccess"));
      setLinkTarget(null);
      setItems((current) => current.filter((item) => item.id !== linkTarget.id));
      setTotal((current) => Math.max(0, current - 1));
      if (items.length === 1 && page > 1) void loadItems(page - 1);
      else void loadItems(page);
    } catch (err) {
      toast.error(formatToastErrorMessage(err, t("linkError")));
    } finally {
      setLinking(false);
    }
  };

  if (!canView) return null;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="djen-triage" />
      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={800} color="text.primary">{t("title")}</Typography>
              <Typography color="text.secondary">{t("subtitle", { total })}</Typography>
            </Box>

            <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid", borderColor: "divider", borderRadius: "18px" }}>
              <Stack spacing={1.75}>
                <Typography variant="subtitle1" fontWeight={700}>{t("filters")}</Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                  <TextField label={t("courtFilter")} value={tribunalInput} onChange={(event) => setTribunalInput(event.target.value)} size="small" sx={{ flex: 1 }} />
                  <TextField label={t("dateStart")} type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} size="small" InputLabelProps={{ shrink: true }} />
                  <TextField label={t("dateEnd")} type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} size="small" InputLabelProps={{ shrink: true }} />
                  <FormControlLabel control={<Checkbox checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} />} label={t("unreadOnly")} />
                  <Button variant="contained" onClick={applyFilters} startIcon={<Icon icon="mdi:filter-outline" width={19} />}>{t("applyFilters")}</Button>
                </Stack>
              </Stack>
            </Paper>

            {!canLink && <Alert severity="info">{t("linkPermissionHint")}</Alert>}
            {error && <Alert severity="error" action={<Button color="inherit" onClick={() => void loadItems(page)}>{t("retry")}</Button>}>{t("loadError")}</Alert>}

            {loading && items.length === 0 ? (
              <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><Typography color="text.secondary">{t("loading")}</Typography></Stack>
            ) : !loading && items.length === 0 ? (
              <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: "18px" }}>
                <Icon icon="mdi:inbox-check-outline" width={38} />
                <Typography variant="h6" fontWeight={700} mt={1}>{t("emptyTitle")}</Typography>
                <Typography color="text.secondary">{t("emptySubtitle")}</Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5}>
                {items.map((item) => {
                  const officialUrl = safeExternalUrl(item.link);
                  return (
                    <Accordion key={item.id} disableGutters elevation={0} sx={{ border: "1px solid", borderColor: item.lida ? "divider" : "primary.light", borderRadius: "14px !important", overflow: "hidden", "&:before": { display: "none" } }}>
                      <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" width={21} />}>
                        <Stack spacing={0.5} sx={{ minWidth: 0, width: "100%", pr: 1 }}>
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={0.5}>
                            <Typography fontWeight={700} color="text.primary">{item.tipo_comunicacao || t("communicationFallback")}</Typography>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              {!item.lida && <Chip size="small" color="primary" label={t("unread")} />}
                              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>{formatDate(item.data_disponibilizacao, locale)}</Typography>
                            </Stack>
                          </Stack>
                          <Typography variant="body2" color="text.secondary" noWrap>{[item.sigla_tribunal, item.nome_orgao].filter(Boolean).join(" · ") || t("courtUnavailable")}</Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            {item.sigla_tribunal && <Chip size="small" variant="outlined" label={item.sigla_tribunal} />}
                            {item.tipo_comunicacao && <Chip size="small" variant="outlined" label={item.tipo_comunicacao} />}
                            {item.status_djen && <Chip size="small" variant="outlined" label={item.status_djen} />}
                          </Stack>
                          {item.nome_orgao && <Typography variant="body2" color="text.secondary">{t("court")}: {item.nome_orgao}</Typography>}
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", maxHeight: 360, overflow: "auto" }}>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.texto || t("textUnavailable")}</Typography>
                          </Box>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            {officialUrl && <Button component="a" href={officialUrl} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<Icon icon="mdi:open-in-new" width={18} />}>{t("officialLink")}</Button>}
                            {canLink && <Button variant="contained" onClick={() => openLinkDialog(item)} startIcon={<Icon icon="mdi:link-variant" width={18} />}>{t("linkCase")}</Button>}
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
                {lastPage > 1 && <Stack direction="row" justifyContent="center" pt={1}><Pagination count={lastPage} page={page} onChange={(_, next) => void loadItems(next)} color="primary" /></Stack>}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      <Dialog open={Boolean(linkTarget)} onClose={() => !linking && setLinkTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t("dialogTitle")}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Typography variant="body2" color="text.secondary">{linkTarget?.tipo_comunicacao || t("communicationFallback")} · {formatDate(linkTarget?.data_disponibilizacao ?? null, locale)}</Typography>
            <Autocomplete
              options={cases}
              value={selectedCase}
              loading={loadingCases}
              inputValue={caseSearch}
              onInputChange={(_, value) => setCaseSearch(value)}
              onChange={(_, value) => setSelectedCase(value)}
              getOptionLabel={(option) => `${option.titulo}${option.numero_processo ? ` — ${option.numero_processo}` : ""}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => <TextField {...params} label={t("caseSelect")} placeholder={t("caseSearch")} InputProps={{ ...params.InputProps, endAdornment: <>{loadingCases ? <CircularProgress size={18} /> : null}{params.InputProps.endAdornment}</> }} />}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLinkTarget(null)} disabled={linking}>{t("cancel")}</Button>
          <Button variant="contained" onClick={() => void linkToCase()} disabled={!selectedCase || linking} startIcon={linking ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:link-variant" width={18} />}>{linking ? t("linking") : t("confirmLink")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
