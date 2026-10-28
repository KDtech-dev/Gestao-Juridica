"use client";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/NotificationsContext";
import { NewCompromissoModal } from "@/components/modals/NewCompromissoModal";
import { EditCompromissoModal } from "@/components/modals/EditCompromissoModal";
import {
  Compromisso,
  CompromissoPayload,
  CompromissoStatus,
  CompromissoTipo,
  CompromissoVisao,
  createCompromisso,
  deleteCompromisso,
  listCompromissos,
  updateCompromisso,
  updateCompromissoStatus,
} from "@/api/apiCompromissos";
import {
  COMPROMISSO_STATUS,
  COMPROMISSO_TIPOS,
} from "@/schemas/CompromissoSchema";
import { getApiErrorMessage } from "@/configs/ApiError";
import { BaseModal } from "@/components/modals/BaseModal";
import { useAuthContext } from "@/context/AuthContext";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import { useTranslation } from "@/hooks/useTranslation";
import {
  compromissoDate,
  compromissoToFormValues,
  formatTime,
  statusChip,
  tipoIcon,
  tipoLabel,
} from "@/utils/compromisso";

type AgendaPeriod = "today" | "week" | "month";
type StatusFilter = CompromissoStatus | "todos";
type TipoFilter = CompromissoTipo | "todos";
type BulkDeleteTarget = "selected" | "all" | null;

export default function CompromissoListView() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, hasPermission } = useAuthContext();
  const canCreate = hasPermission("compromissos.criar");
  const canEdit = hasPermission("compromissos.editar");
  const canDelete = hasPermission("compromissos.excluir");
  const { addNotification } = useNotifications();

  const [visao, setVisao] = useState<CompromissoVisao>("publica");
  const [agendaPeriod, setAgendaPeriod] = useState<AgendaPeriod>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");

  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<5 | 10 | 20>(10);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteTarget, setBulkDeleteTarget] =
    useState<BulkDeleteTarget>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Compromisso | null>(null);
  const [viewEvent, setViewEvent] = useState<Compromisso | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Compromisso | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadCompromissos = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await listCompromissos(visao, { periodo: agendaPeriod });
      setCompromissos(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [agendaPeriod, authLoading, isAuthenticated, visao]);

  useEffect(() => {
    void loadCompromissos();
  }, [loadCompromissos]);

  const sortedCompromissos = useMemo(
    () =>
      compromissos
        .slice()
        .sort(
          (a, b) => compromissoDate(a).getTime() - compromissoDate(b).getTime(),
        ),
    [compromissos],
  );

  const filteredCompromissos = useMemo(() => {
    return sortedCompromissos.filter((event) => {
      if (statusFilter !== "todos" && event.status !== statusFilter) {
        return false;
      }
      if (tipoFilter !== "todos" && event.tipo !== tipoFilter) {
        return false;
      }
      return true;
    });
  }, [sortedCompromissos, statusFilter, tipoFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompromissos.length / pageSize),
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredCompromissos.slice(start, start + pageSize);
  }, [filteredCompromissos, page, pageSize]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [agendaPeriod, visao, statusFilter, tipoFilter, pageSize]);

  const allVisiblePageSelected =
    paginated.length > 0 &&
    paginated.every((event) => selectedIds.has(String(event.id)));

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAllSelected() {
    setSelectedIds((prev) => {
      if (
        paginated.length > 0 &&
        paginated.every((event) => prev.has(String(event.id)))
      ) {
        return new Set();
      }

      return new Set(paginated.map((event) => String(event.id)));
    });
  }

  async function handleBulkUpdateStatus(status: CompromissoStatus) {
    if (!canEdit || selectedIds.size === 0) return;

    try {
      setBulkActionLoading(true);
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => updateCompromissoStatus(id, status)));
      setSelectedIds(new Set());
      await loadCompromissos();
      addNotification({
        title: t("agenda.list.notifications.bulkStatusTitle"),
        description: t("agenda.list.notifications.bulkStatusDescription"),
      });
    } catch (err) {
      addNotification({
        title: t("agenda.list.notifications.bulkStatusErrorTitle"),
        description: getApiErrorMessage(err),
      });
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleConfirmBulkDelete() {
    if (!canDelete || !bulkDeleteTarget) return;

    const ids =
      bulkDeleteTarget === "all"
        ? filteredCompromissos.map((event) => String(event.id))
        : Array.from(selectedIds);

    if (ids.length === 0) {
      setBulkDeleteTarget(null);
      return;
    }

    try {
      setBulkActionLoading(true);
      await Promise.all(ids.map((id) => deleteCompromisso(id)));
      setCompromissos((current) =>
        current.filter((c) => !ids.includes(String(c.id))),
      );
      setSelectedIds(new Set());
      setBulkDeleteTarget(null);
      addNotification({
        title: t("agenda.list.notifications.bulkDeletedTitle"),
        description: t("agenda.list.notifications.bulkDeletedDescription"),
      });
    } catch (err) {
      addNotification({
        title: t("agenda.list.notifications.bulkDeleteErrorTitle"),
        description: getApiErrorMessage(err),
      });
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleNewCompromissoSubmit(payload: CompromissoPayload) {
    if (!canCreate) return;
    try {
      setSubmitting(true);
      await createCompromisso(payload);
      await loadCompromissos();
      setOpen(false);
      addNotification({
        title: t("agenda.notifications.createdTitle"),
        description: t("agenda.notifications.createdDescription"),
      });
    } catch (err) {
      addNotification({
        title: t("agenda.notifications.createErrorTitle"),
        description: getApiErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditCompromissoSubmit(payload: CompromissoPayload) {
    if (!canEdit || !selectedEvent) return;

    try {
      setSubmitting(true);
      await updateCompromisso(selectedEvent.id, payload);
      await loadCompromissos();
      setOpenEdit(false);
      setSelectedEvent(null);
      addNotification({
        title: t("agenda.notifications.updatedTitle"),
        description: t("agenda.notifications.updatedDescription"),
      });
    } catch (err) {
      addNotification({
        title: t("agenda.notifications.updateErrorTitle"),
        description: getApiErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCompromisso() {
    if (!canDelete || !deleteTarget) return;

    try {
      setDeleting(true);
      await deleteCompromisso(deleteTarget.id);
      setCompromissos((current) =>
        current.filter(
          (c) => String(c.id) !== String(deleteTarget.id),
        ),
      );
      setDeleteTarget(null);
      addNotification({
        title: t("agenda.notifications.deletedTitle"),
        description: t("agenda.notifications.deletedDescription"),
      });
    } catch (err) {
      addNotification({
        title: t("agenda.notifications.deleteErrorTitle"),
        description: getApiErrorMessage(err),
      });
    } finally {
      setDeleting(false);
    }
  }

  function openEditModal(event: Compromisso) {
    if (!canEdit) return;
    setViewEvent(null);
    setSelectedEvent(event);
    setOpenEdit(true);
  }

  function openViewModal(event: Compromisso) {
    setOpenEdit(false);
    setSelectedEvent(null);
    setViewEvent(event);
  }

  const editInitialValues = useMemo(
    () => (selectedEvent ? compromissoToFormValues(selectedEvent) : undefined),
    [selectedEvent],
  );

  const isConfirmDialogOpen = !!deleteTarget || !!bulkDeleteTarget;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="agenda" />

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
                <IconButton onClick={() => router.push("/agenda")}>
                  <Icon icon="mdi:arrow-left" width={22} />
                </IconButton>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  {t("agenda.list.title")}
                </Typography>
              </Stack>
              <Typography color="text.secondary" fontSize="0.9rem">
                {t("agenda.list.subtitle")}
              </Typography>
            </Box>

            {canCreate && <Button
              variant="contained"
              startIcon={<Icon icon="mdi:plus" width={20} />}
              sx={{ textTransform: "none", borderRadius: "12px", px: 2.2 }}
              onClick={() => setOpen(true)}
            >
              {t("agenda.newAppointment")}
            </Button>}
          </Stack>

          <Paper
            sx={{
              mb: 2,
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Tabs
              value={visao}
              onChange={(_, value: CompromissoVisao) => setVisao(value)}
              sx={{ px: 1 }}
            >
              <Tab value="publica" label={t("agenda.views.public")} />
              <Tab value="pessoal" label={t("agenda.views.personal")} />
            </Tabs>
          </Paper>

          <Paper
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ToggleButtonGroup
                exclusive
                size="small"
                value={agendaPeriod}
                onChange={(_, value: AgendaPeriod | null) => {
                  if (!value) return;
                  setAgendaPeriod(value);
                }}
                sx={{
                  "& .MuiToggleButton-root": { textTransform: "none", px: 1.6 },
                }}
              >
                <ToggleButton value="today">
                  {t("agenda.periods.today")}
                </ToggleButton>
                <ToggleButton value="week">
                  {t("agenda.periods.week")}
                </ToggleButton>
                <ToggleButton value="month">
                  {t("agenda.periods.month")}
                </ToggleButton>
              </ToggleButtonGroup>

              <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilter)
                    }
                  >
                    <MenuItem value="todos">
                      {t("agenda.list.filters.allStatus")}
                    </MenuItem>
                    {COMPROMISSO_STATUS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {statusChip(status, t).label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={tipoFilter}
                    onChange={(event) =>
                      setTipoFilter(event.target.value as TipoFilter)
                    }
                  >
                    <MenuItem value="todos">
                      {t("agenda.list.filters.allTypes")}
                    </MenuItem>
                    {COMPROMISSO_TIPOS.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipoLabel(tipo, t)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            {!loading && !error && filteredCompromissos.length > 0 && (canEdit || canDelete) && (
              <Box
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Checkbox
                  size="small"
                  checked={allVisiblePageSelected}
                  onChange={toggleAllSelected}
                />
                <Typography color="text.secondary" fontSize="0.82rem">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} ${t("agenda.list.selectedSuffix")}`
                    : t("agenda.list.selectPage")}
                </Typography>

                <Box sx={{ flex: 1 }} />

                {canEdit && <Button
                  size="small"
                  variant="outlined"
                  disabled={selectedIds.size === 0 || bulkActionLoading}
                  startIcon={<Icon icon="mdi:check-circle-outline" />}
                  onClick={() => handleBulkUpdateStatus("CONCLUIDO")}
                >
                  {t("agenda.list.actions.markCompleted")}
                </Button>}
                {canEdit && <Button
                  size="small"
                  variant="outlined"
                  disabled={selectedIds.size === 0 || bulkActionLoading}
                  startIcon={<Icon icon="mdi:cancel" />}
                  onClick={() => handleBulkUpdateStatus("CANCELADO")}
                >
                  {t("agenda.list.actions.markCancelled")}
                </Button>}
                {canDelete && <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={selectedIds.size === 0 || bulkActionLoading}
                  startIcon={<Icon icon="mdi:trash-can-outline" />}
                  onClick={() => setBulkDeleteTarget("selected")}
                >
                  {t("agenda.list.actions.deleteSelected")}
                </Button>}
                {canDelete && <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={bulkActionLoading}
                  startIcon={<Icon icon="mdi:trash-can-outline" />}
                  onClick={() => setBulkDeleteTarget("all")}
                >
                  {t("agenda.list.actions.deleteAll")}
                </Button>}
              </Box>
            )}

            {loading && (
              <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                <Typography>{t("agenda.timeline.loading")}</Typography>
              </Box>
            )}

            {!loading && error && (
              <Box sx={{ p: 2 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}

            {!loading && !error && filteredCompromissos.length === 0 && (
              <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                <Icon icon="mdi:calendar-blank-outline" width={34} />
                <Typography mt={1} fontWeight={700}>
                  {t("agenda.timeline.empty")}
                </Typography>
              </Box>
            )}

            {!loading &&
              !error &&
              paginated.map((event) => {
                const chip = statusChip(event.status, t);
                const key = String(event.id);
                const checked = selectedIds.has(key);

                return (
                  <Box
                    key={key}
                    sx={{
                      width: "100%",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      px: { xs: 2, md: 2.5 },
                      py: 1.6,
                      "&:last-child": { borderBottom: 0 },
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Stack direction="row" gap={1.5} alignItems="flex-start">
                      {(canEdit || canDelete) && (
                        <Checkbox
                          checked={checked}
                          onChange={() => toggleSelected(key)}
                          sx={{ p: 0.4, mt: 0.1 }}
                        />
                      )}

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
                        <Icon icon={tipoIcon(event.tipo)} width={20} />
                      </Box>

                      <Box
                        component="button"
                        type="button"
                        onClick={() => openViewModal(event)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          border: 0,
                          p: 0,
                          bgcolor: "transparent",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          gap={0.6}
                        >
                          <Typography fontWeight={800} color="text.primary">
                            {event.titulo}
                          </Typography>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Chip
                              size="small"
                              label={chip.label}
                              sx={{
                                bgcolor: chip.bg,
                                color: chip.color,
                                fontWeight: 600,
                              }}
                            />
                            <Typography fontSize="0.78rem" color="text.secondary">
                              {compromissoDate(event).toLocaleDateString(
                                language,
                              )}{" "}
                              {formatTime(event)}
                            </Typography>
                          </Stack>
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
                          {tipoLabel(event.tipo, t)}
                          {event.descricao ? ` · ${event.descricao}` : ""}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        gap={0.5}
                        mt={0.4}
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                      >
                        {canEdit && <Tooltip title={t("agenda.actions.edit")}>
                          <IconButton
                            size="small"
                            onClick={() => openEditModal(event)}
                          >
                            <Icon icon="mdi:pencil-outline" width={18} />
                          </IconButton>
                        </Tooltip>}
                        {canDelete && <Tooltip title={t("agenda.actions.delete")}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(event)}
                          >
                            <Icon icon="mdi:trash-can-outline" width={18} />
                          </IconButton>
                        </Tooltip>}
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}

            {!loading && !error && filteredCompromissos.length > 0 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={1.5}
                px={2.5}
                py={2}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                  justifyContent={{ xs: "space-between", sm: "flex-start" }}
                >
                  <Typography color="text.secondary" fontSize="0.82rem">
                    {t("agenda.timeline.perPage")}
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 86 }}>
                    <Select
                      value={String(pageSize)}
                      onChange={(event) =>
                        setPageSize(Number(event.target.value) as 5 | 10 | 20)
                      }
                    >
                      <MenuItem value="5">5</MenuItem>
                      <MenuItem value="10">10</MenuItem>
                      <MenuItem value="20">20</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="small"
                  sx={{ alignSelf: { xs: "center", sm: "auto" } }}
                />
              </Stack>
            )}
          </Paper>
        </Container>
      </Box>

      <NewCompromissoModal
        open={canCreate && open}
        onClose={() => setOpen(false)}
        onSubmit={handleNewCompromissoSubmit}
        submitting={submitting}
      />

      <EditCompromissoModal
        open={canEdit && openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedEvent(null);
        }}
        initialValues={editInitialValues}
        onSubmit={handleEditCompromissoSubmit}
        submitting={submitting}
      />

      <BaseModal
        open={!!viewEvent}
        onClose={() => setViewEvent(null)}
        title={t("agenda.viewModal.title")}
        confirmText={t("agenda.actions.edit")}
        cancelText={t("agenda.actions.close")}
        hideConfirm={!canEdit}
        maxWidth="sm"
        onSubmit={() => {
          if (!viewEvent) return;
          openEditModal(viewEvent);
        }}
      >
        {viewEvent && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" gap={1.2}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "#fff",
                }}
              >
                <Icon icon={tipoIcon(viewEvent.tipo)} width={22} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} color="text.primary">
                  {viewEvent.titulo}
                </Typography>
                <Typography fontSize="0.86rem" color="text.secondary">
                  {tipoLabel(viewEvent.tipo, t)}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={1.2}>
              <Stack direction="row" gap={1} alignItems="center">
                <Icon icon="mdi:clock-outline" width={18} />
                <Typography fontSize="0.9rem">
                  {compromissoDate(viewEvent).toLocaleDateString(language)}{" "}
                  {t("agenda.viewModal.at")} {formatTime(viewEvent)}
                </Typography>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <Icon icon="mdi:account-outline" width={18} />
                <Typography fontSize="0.9rem">
                  {viewEvent.criador.nome || t("agenda.creatorUnknown")}
                </Typography>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <Icon icon="mdi:flag-outline" width={18} />
                <Typography fontSize="0.9rem">
                  {statusChip(viewEvent.status, t).label}
                </Typography>
              </Stack>
            </Stack>

            {viewEvent.descricao && (
              <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "action.hover" }}>
                <Typography color="text.secondary" fontSize="0.9rem">
                  {viewEvent.descricao}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </BaseModal>

      <ConfirmDialog
        open={canDelete && isConfirmDialogOpen}
        title={
          bulkDeleteTarget
            ? t("agenda.list.bulkDeleteDialog.title")
            : t("agenda.deleteDialog.title")
        }
        description={
          bulkDeleteTarget === "selected"
            ? `${selectedIds.size} ${t("agenda.list.bulkDeleteDialog.selectedSuffix")}`
            : bulkDeleteTarget === "all"
              ? `${filteredCompromissos.length} ${t("agenda.list.bulkDeleteDialog.allSuffix")}`
              : deleteTarget
                ? `${t("agenda.deleteDialog.prefix")} "${deleteTarget.titulo}" ${t("agenda.deleteDialog.suffix")}`
                : undefined
        }
        confirmText={t("agenda.actions.delete")}
        cancelText={t("common.cancel")}
        loading={deleting || bulkActionLoading}
        onClose={() => {
          if (deleting || bulkActionLoading) return;
          setDeleteTarget(null);
          setBulkDeleteTarget(null);
        }}
        onConfirm={() => {
          if (bulkDeleteTarget) {
            void handleConfirmBulkDelete();
          } else {
            void handleDeleteCompromisso();
          }
        }}
      />
    </Box>
  );
}
