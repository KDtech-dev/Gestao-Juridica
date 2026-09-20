"use client";

import {
  Box,
  Button,
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
import { CalendarCard } from "@/components/CalendarCard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { NewCompromissoModal } from "@/components/modals/NewCompromissoModal";
import { EditCompromissoModal } from "@/components/modals/EditCompromissoModal";
import {
  Compromisso,
  CompromissoPayload,
  CompromissoVisao,
  createCompromisso,
  deleteCompromisso,
  listCompromissos,
  updateCompromisso,
} from "@/api/apiCompromissos";
import { CompromissoFormValues } from "@/components/forms/CompromissoForm";
import { getApiErrorMessage } from "@/configs/ApiError";
import { BaseModal } from "@/components/modals/BaseModal";
import { useAuthContext } from "@/context/AuthContext";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import { useTranslation } from "@/hooks/useTranslation";

type Translate = (path: string) => string;
type AgendaPeriod = "today" | "week" | "month";

function statusChip(status: Compromisso["status"], t: Translate) {
  if (status === "CONCLUIDO") {
    return {
      label: t("agenda.status.completed"),
      color: "#047857",
      bg: "#b8ead2",
    };
  }

  if (status === "CANCELADO") {
    return {
      label: t("agenda.status.cancelled"),
      color: "#991b1b",
      bg: "#fee2e2",
    };
  }

  return { label: t("agenda.status.pending"), color: "#c2410c", bg: "#ffe3bf" };
}

function tipoLabel(tipo: Compromisso["tipo"], t: Translate) {
  const labels: Record<Compromisso["tipo"], string> = {
    COMPROMISSO: t("agenda.types.appointment"),
    LEMBRETE: t("agenda.types.reminder"),
    AUDIENCIA: t("agenda.types.hearing"),
    PRAZO: t("agenda.types.deadline"),
    REUNIAO: t("agenda.types.meeting"),
  };

  return labels[tipo];
}

function tipoIcon(tipo: Compromisso["tipo"]) {
  const icons: Record<Compromisso["tipo"], string> = {
    COMPROMISSO: "mdi:calendar-check-outline",
    LEMBRETE: "mdi:bell-outline",
    AUDIENCIA: "mdi:gavel",
    PRAZO: "mdi:timer-sand",
    REUNIAO: "mdi:account-group-outline",
  };

  return icons[tipo];
}

function timeToMinutes(time: string) {
  const [hh, mm] = (time || "00:00").split(":").map((s) => parseInt(s, 10));

  return (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function compromissoDate(compromisso: Compromisso) {
  const datePart = compromisso.data.split(/[T\s]/)[0];
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (compromisso.hora || "00:00").split(":").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day, hour || 0, minute || 0);
}

function formatTime(compromisso: Compromisso) {
  return (compromisso.hora || "00:00").slice(0, 5);
}

function compromissoToFormValues(
  compromisso: Compromisso,
): CompromissoFormValues {
  return {
    titulo: compromisso.titulo,
    tipo: compromisso.tipo,
    status: compromisso.status,
    startsAt: compromissoDate(compromisso),
    descricao: compromisso.descricao ?? "",
    userId:
      compromisso.criador.id != null ? String(compromisso.criador.id) : "",
  };
}

function getNewCompromissoInitialValues(
  date: Date,
): Partial<CompromissoFormValues> {
  const startsAt = new Date(date);
  const now = new Date();

  if (isSameDay(startsAt, now)) {
    startsAt.setHours(now.getHours() + 1, 0, 0, 0);
  } else {
    startsAt.setHours(9, 0, 0, 0);
  }

  return { startsAt };
}

export default function AgendaView() {
  const { t, language } = useTranslation();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [visao, setVisao] = useState<CompromissoVisao>("publica");
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [upcomingCompromissos, setUpcomingCompromissos] = useState<
    Compromisso[]
  >([]);
  const [selectedEvent, setSelectedEvent] = useState<Compromisso | null>(null);
  const [viewEvent, setViewEvent] = useState<Compromisso | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Compromisso | null>(null);
  const [loadingUpcomingCompromissos, setLoadingUpcomingCompromissos] =
    useState(true);
  const [compromissosError, setCompromissosError] = useState<string | null>(
    null,
  );
  const [upcomingCompromissosError, setUpcomingCompromissosError] = useState<
    string | null
  >(null);
  const [submittingCompromisso, setSubmittingCompromisso] = useState(false);
  const [deletingCompromisso, setDeletingCompromisso] = useState(false);
  const { addNotification } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [agendaPeriod, setAgendaPeriod] = useState<AgendaPeriod>("today");
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelinePageSize, setTimelinePageSize] = useState<5 | 10>(5);
  const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const queryTime =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("time")
      : null;
  const [openEdit, setOpenEdit] = useState(false);
  const loadCompromissos = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;

    try {
      setCompromissosError(null);
      const data = await listCompromissos(visao);
      setCompromissos(data);
    } catch (error) {
      setCompromissosError(getApiErrorMessage(error));
    }
  }, [authLoading, isAuthenticated, visao]);

  useEffect(() => {
    void loadCompromissos();
  }, [loadCompromissos]);

  const loadUpcomingCompromissos = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;

    try {
      setLoadingUpcomingCompromissos(true);
      setUpcomingCompromissosError(null);
      const data = await listCompromissos(visao, { periodo: agendaPeriod });
      setUpcomingCompromissos(data);
    } catch (error) {
      setUpcomingCompromissosError(getApiErrorMessage(error));
    } finally {
      setLoadingUpcomingCompromissos(false);
    }
  }, [agendaPeriod, authLoading, isAuthenticated, visao]);

  useEffect(() => {
    void loadUpcomingCompromissos();
  }, [loadUpcomingCompromissos]);

  const filteredEvents = useMemo(
    () =>
      compromissos
        .filter((compromisso) =>
          isSameDay(compromissoDate(compromisso), selectedDate),
        )
        .sort(
          (a, b) => compromissoDate(a).getTime() - compromissoDate(b).getTime(),
        ),
    [compromissos, selectedDate],
  );

  const upcomingEvents = useMemo(() => {
    return upcomingCompromissos
      .slice()
      .sort(
        (a, b) => compromissoDate(a).getTime() - compromissoDate(b).getTime(),
      );
  }, [upcomingCompromissos]);

  const timelineTotalPages = Math.max(
    1,
    Math.ceil(upcomingEvents.length / timelinePageSize),
  );

  const paginatedUpcomingEvents = useMemo(() => {
    const start = (timelinePage - 1) * timelinePageSize;

    return upcomingEvents.slice(start, start + timelinePageSize);
  }, [timelinePage, timelinePageSize, upcomingEvents]);

  useEffect(() => {
    setTimelinePage(1);
  }, [agendaPeriod, timelinePageSize, upcomingEvents.length, visao]);

  const calendarEvents = useMemo(
    () =>
      compromissos.map((compromisso) => ({
        date: compromissoDate(compromisso),
        color: compromisso.criador.cor_perfil ?? null,
      })),
    [compromissos],
  );

  const newCompromissoInitialValues = useMemo(
    () => getNewCompromissoInitialValues(selectedDate),
    [selectedDate],
  );

  const editCompromissoInitialValues = useMemo(
    () => (selectedEvent ? compromissoToFormValues(selectedEvent) : undefined),
    [selectedEvent],
  );

  const summary = useMemo(() => {
    const total = upcomingEvents.length;
    const finished = upcomingEvents.filter(
      (e) => e.status === "CONCLUIDO",
    ).length;
    const pending = upcomingEvents.filter(
      (e) => e.status === "PENDENTE",
    ).length;
    const next = upcomingEvents[0] ?? null;

    return { total, finished, pending, next };
  }, [upcomingEvents]);

  const selectedDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString(language, {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
    [language, selectedDate],
  );

  useEffect(() => {
    if (!queryTime) return;
    const idx = filteredEvents.findIndex((e) => formatTime(e) === queryTime);
    if (idx === -1) return;
    const key = String(filteredEvents[idx].id);
    const id = setTimeout(() => {
      const el = eventRefs.current[key];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);

    return () => clearTimeout(id);
  }, [filteredEvents, queryTime]);

  async function handleNewCompromissoSubmit(payload: CompromissoPayload) {
    try {
      setSubmittingCompromisso(true);
      const created = await createCompromisso(payload);
      setCompromissos((current) => [...current, created]);
      setSelectedDate(compromissoDate(created));
      void loadUpcomingCompromissos();
      setOpen(false);
      addNotification({
        title: t("agenda.notifications.createdTitle"),
        description: t("agenda.notifications.createdDescription"),
      });
    } catch (error) {
      addNotification({
        title: t("agenda.notifications.createErrorTitle"),
        description: getApiErrorMessage(error),
      });
    } finally {
      setSubmittingCompromisso(false);
    }
  }

  async function handleEditCompromissoSubmit(payload: CompromissoPayload) {
    if (!selectedEvent) return;

    try {
      setSubmittingCompromisso(true);
      const updated = await updateCompromisso(selectedEvent.id, payload);
      setCompromissos((current) =>
        current.map((compromisso) =>
          compromisso.id === updated.id ? updated : compromisso,
        ),
      );
      setSelectedDate(compromissoDate(updated));
      void loadUpcomingCompromissos();
      setOpenEdit(false);
      setSelectedEvent(null);
      addNotification({
        title: t("agenda.notifications.updatedTitle"),
        description: t("agenda.notifications.updatedDescription"),
      });
    } catch (error) {
      addNotification({
        title: t("agenda.notifications.updateErrorTitle"),
        description: getApiErrorMessage(error),
      });
    } finally {
      setSubmittingCompromisso(false);
    }
  }

  async function handleDeleteCompromisso() {
    if (!deleteTarget) return;

    try {
      setDeletingCompromisso(true);
      await deleteCompromisso(deleteTarget.id);
      setCompromissos((current) =>
        current.filter(
          (compromisso) => String(compromisso.id) !== String(deleteTarget.id),
        ),
      );
      setUpcomingCompromissos((current) =>
        current.filter(
          (compromisso) => String(compromisso.id) !== String(deleteTarget.id),
        ),
      );

      if (
        selectedEvent &&
        String(selectedEvent.id) === String(deleteTarget.id)
      ) {
        setSelectedEvent(null);
        setOpenEdit(false);
      }

      if (viewEvent && String(viewEvent.id) === String(deleteTarget.id)) {
        setViewEvent(null);
      }

      setDeleteTarget(null);
      addNotification({
        title: t("agenda.notifications.deletedTitle"),
        description: t("agenda.notifications.deletedDescription"),
      });
    } catch (error) {
      addNotification({
        title: t("agenda.notifications.deleteErrorTitle"),
        description: getApiErrorMessage(error),
      });
    } finally {
      setDeletingCompromisso(false);
    }
  }

  function openEditModal(event: Compromisso) {
    setViewEvent(null);
    setSelectedEvent(event);
    setOpenEdit(true);
  }

  function openViewModal(event: Compromisso) {
    setOpenEdit(false);
    setSelectedEvent(null);
    setViewEvent(event);
  }

  function openDeleteDialog(event: Compromisso) {
    setDeleteTarget(event);
  }

  const selectedIsToday = isSameDay(selectedDate, new Date());

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="agenda" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            gap={2}
            mb={2.2}
          >
            <Box>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {t("agenda.title")}
                </Typography>
                {selectedIsToday && (
                  <Chip
                    size="small"
                    label={t("agenda.today")}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography color="text.secondary" fontSize="0.85rem">
                {t("agenda.subtitle")}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Icon icon="mdi:plus" />}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                px: 2.2,
              }}
              onClick={() => setOpen(true)}
            >
              {t("agenda.newAppointment")}
            </Button>
          </Stack>

          <Paper
            sx={{
              mb: 2,
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "1.45fr 0.7fr",
              },
              gap: 2,
            }}
          >
            <Box>
              <Stack spacing={2}>
                <Paper
                  sx={{
                    p: 2.2,
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    gap={1}
                  >
                    <Box>
                      <Typography
                        fontWeight={700}
                        fontSize="1.15rem"
                        color="text.primary"
                      >
                        {t(`agenda.periods.${agendaPeriod}`)}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.86rem">
                        {visao === "pessoal"
                          ? t("agenda.summary.personalDescription")
                          : t("agenda.summary.publicDescription")}
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={agendaPeriod}
                      onChange={(_, value: AgendaPeriod | null) => {
                        if (!value) return;
                        setAgendaPeriod(value);
                        if (value === "today") {
                          setSelectedDate(new Date());
                        }
                      }}
                      sx={{
                        "& .MuiToggleButton-root": {
                          textTransform: "none",
                          px: 1.6,
                        },
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
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                      mt: 2,
                    }}
                  >
                    <Paper sx={{ p: 1.2, textAlign: "center" }}>
                      <Typography fontWeight={700}>{summary.total}</Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        {t("agenda.summary.total")}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 1.2, textAlign: "center" }}>
                      <Typography fontWeight={700} color="#059669">
                        {summary.finished}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        {t("agenda.summary.completed")}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 1.2, textAlign: "center" }}>
                      <Typography fontWeight={700} color="#c2410c">
                        {summary.pending}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        {t("agenda.summary.pending")}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 1.2 }}>
                      <Typography fontWeight={700} noWrap>
                        {summary.next
                          ? `${formatTime(summary.next)} - ${summary.next.titulo}`
                          : t("agenda.summary.noNext")}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        {t("agenda.summary.nextAppointment")}
                      </Typography>
                    </Paper>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Icon icon="mdi:calendar-clock" width={20} />
                    <Typography
                      fontWeight={700}
                      fontSize="1.15rem"
                      color="text.primary"
                    >
                      {t("agenda.timeline.title")}
                    </Typography>
                  </Box>

                  <Stack sx={{ p: 2 }} spacing={0}>
                    {loadingUpcomingCompromissos && (
                      <Box sx={{ p: 2, display: "grid", gap: 1 }}>
                        <Typography color="text.secondary" fontSize="0.9rem">
                          {t("agenda.timeline.loading")}
                        </Typography>
                        {[0, 1, 2].map((item) => (
                          <Box
                            key={item}
                            sx={{
                              height: 72,
                              borderRadius: "12px",
                              bgcolor: "action.hover",
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {!loadingUpcomingCompromissos &&
                      upcomingCompromissosError && (
                        <Box sx={{ p: 2 }}>
                          <Typography color="error">
                            {upcomingCompromissosError}
                          </Typography>
                        </Box>
                      )}

                    {!loadingUpcomingCompromissos &&
                      !upcomingCompromissosError &&
                      upcomingEvents.length === 0 && (
                        <Box sx={{ p: 2 }}>
                          <Typography color="text.secondary">
                            {t("agenda.timeline.empty")}
                          </Typography>
                        </Box>
                      )}

                    {!loadingUpcomingCompromissos &&
                      !upcomingCompromissosError &&
                      paginatedUpcomingEvents.map((event, idx) => {
                        const now = new Date();
                        const nowMinutes =
                          now.getHours() * 60 + now.getMinutes();
                        const eventTime = formatTime(event);
                        const eventMinutes = timeToMinutes(eventTime);
                        const eventIsToday = isSameDay(
                          compromissoDate(event),
                          now,
                        );
                        const isNow = queryTime
                          ? queryTime === eventTime
                          : eventIsToday &&
                          nowMinutes >= eventMinutes &&
                          nowMinutes < eventMinutes + 60;
                        const isLast =
                          idx === paginatedUpcomingEvents.length - 1;
                        const chip = statusChip(event.status, t);
                        const key = String(event.id);

                        return (
                          <Box
                            key={key}
                            ref={(el: HTMLDivElement | null) => {
                              eventRefs.current[key] = el;
                            }}
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "flex-start",
                              p: 1.4,
                              mb: isLast ? 0 : 1,
                              borderRadius: "14px",
                              border: "1px solid",
                              borderColor: isNow ? "primary.main" : "divider",
                              cursor: "pointer",
                              bgcolor: isNow
                                ? "rgba(5,150,105,0.06)"
                                : "background.paper",
                              boxShadow: isNow
                                ? "0 10px 24px rgba(5,150,105,0.10)"
                                : "0 1px 2px rgba(15,23,42,0.04)",
                              transition:
                                "background-color .12s, border-color .12s, box-shadow .12s, transform .12s",
                              "&:hover": {
                                bgcolor: "action.hover",
                                borderColor: "primary.light",
                                transform: "translateY(-1px)",
                              },
                            }}
                            onClick={() => openViewModal(event)}
                          >
                            <Box
                              sx={{
                                width: 64,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "999px",
                                  display: "grid",
                                  placeItems: "center",
                                  bgcolor: isNow ? "primary.main" : "divider",
                                  color: isNow ? "#fff" : "text.secondary",
                                  boxShadow: isNow
                                    ? "0 8px 18px rgba(25,118,210,0.22)"
                                    : "none",
                                }}
                              >
                                <Icon icon={tipoIcon(event.tipo)} width={18} />
                              </Box>
                              {!isLast && (
                                <Box
                                  sx={{
                                    width: 2,
                                    height: 48,
                                    bgcolor: "divider",
                                    mt: 0.8,
                                  }}
                                />
                              )}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                gap={1}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  gap={1}
                                  flexWrap="wrap"
                                >
                                  <Typography
                                    fontWeight={800}
                                    color="text.primary"
                                    fontSize="1.05rem"
                                  >
                                    {eventTime}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={chip.label}
                                    sx={{
                                      bgcolor: chip.bg,
                                      color: chip.color,
                                      fontWeight: 600,
                                    }}
                                  />
                                </Stack>
                                <Stack
                                  direction="row"
                                  gap={0.5}
                                  onClick={(clickEvent) =>
                                    clickEvent.stopPropagation()
                                  }
                                >
                                  <Tooltip title={t("agenda.actions.view")}>
                                    <IconButton
                                      size="small"
                                      aria-label={t(
                                        "agenda.actions.viewAppointment",
                                      )}
                                      onClick={() => openViewModal(event)}
                                      sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Icon icon="mdi:eye-outline" width={18} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t("agenda.actions.edit")}>
                                    <IconButton
                                      size="small"
                                      aria-label={t(
                                        "agenda.actions.editAppointment",
                                      )}
                                      onClick={() => openEditModal(event)}
                                      sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Icon
                                        icon="mdi:pencil-outline"
                                        width={18}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t("agenda.actions.delete")}>
                                    <IconButton
                                      size="small"
                                      aria-label={t(
                                        "agenda.actions.deleteAppointment",
                                      )}
                                      color="error"
                                      onClick={() => openDeleteDialog(event)}
                                      sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Icon
                                        icon="mdi:trash-can-outline"
                                        width={18}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                              <Typography
                                fontWeight={700}
                                color="text.primary"
                                mt={0.5}
                              >
                                {event.titulo}
                              </Typography>
                              <Typography
                                color="#2563eb"
                                fontSize="0.86rem"
                                mb={0.8}
                              >
                                {tipoLabel(event.tipo, t)}
                              </Typography>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                gap={{ xs: 0.4, sm: 2 }}
                                color="text.secondary"
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  gap={0.6}
                                >
                                  <Icon icon="mdi:account-outline" width={16} />
                                  <Typography fontSize="0.83rem">
                                    {event.criador.nome ||
                                      t("agenda.creatorUnknown")}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  gap={0.6}
                                >
                                  <Icon icon="mdi:calendar" width={16} />
                                  <Typography fontSize="0.83rem">
                                    {compromissoDate(event).toLocaleDateString(
                                      language,
                                    )}
                                  </Typography>
                                </Stack>
                              </Stack>
                              {event.descricao && (
                                <Typography
                                  color="text.secondary"
                                  fontSize="0.86rem"
                                  mt={0.8}
                                >
                                  {event.descricao}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        );
                      })}

                    {!loadingUpcomingCompromissos &&
                      !upcomingCompromissosError &&
                      upcomingEvents.length > 0 && (
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "stretch", sm: "center" }}
                          gap={1.5}
                          pt={2}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            gap={1}
                            justifyContent={{
                              xs: "space-between",
                              sm: "flex-start",
                            }}
                          >
                            <Typography
                              color="text.secondary"
                              fontSize="0.82rem"
                            >
                              {t("agenda.timeline.perPage")}
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 86 }}>
                              <Select
                                value={String(timelinePageSize)}
                                onChange={(event) => {
                                  setTimelinePageSize(
                                    Number(event.target.value) as 5 | 10,
                                  );
                                }}
                              >
                                <MenuItem value="5">5</MenuItem>
                                <MenuItem value="10">10</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>

                          <Pagination
                            count={timelineTotalPages}
                            page={timelinePage}
                            onChange={(_, page) => setTimelinePage(page)}
                            color="primary"
                            size="small"
                            sx={{
                              alignSelf: { xs: "center", sm: "auto" },
                            }}
                          />
                        </Stack>
                      )}
                  </Stack>
                </Paper>
              </Stack>
            </Box>

            <Stack spacing={2}>
              <CalendarCard
                value={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                events={calendarEvents}
              />

              <Paper
                sx={{
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                  p: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  mb={1.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700} color="text.primary">
                      {t("agenda.calendarPanel.title")}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      fontSize="0.82rem"
                      textTransform="capitalize"
                    >
                      {selectedDateLabel}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={filteredEvents.length}
                    color={filteredEvents.length > 0 ? "primary" : "default"}
                  />
                </Stack>

                {compromissosError ? (
                  <Box sx={{ p: 1.5 }}>
                    <Typography color="error" fontSize="0.88rem">
                      {compromissosError}
                    </Typography>
                  </Box>
                ) : filteredEvents.length === 0 ? (
                  <Box
                    sx={{
                      borderRadius: "12px",
                      border: "1px dashed",
                      borderColor: "divider",
                      p: 1.5,
                    }}
                  >
                    <Typography color="text.secondary" fontSize="0.88rem">
                      {t("agenda.calendarPanel.empty")}
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {filteredEvents.map((event) => {
                      const chip = statusChip(event.status, t);

                      return (
                        <Box
                          key={event.id}
                          onClick={() => openViewModal(event)}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            borderRadius: "12px",
                            border: "1px solid",
                            borderColor: "divider",
                            p: 1.15,
                            cursor: "pointer",
                            transition:
                              "background-color .12s, border-color .12s, transform .12s",
                            "&:hover": {
                              bgcolor: "action.hover",
                              borderColor: "primary.light",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "10px",
                              display: "grid",
                              placeItems: "center",
                              bgcolor: "rgba(25,118,210,0.10)",
                              color: "primary.main",
                              flexShrink: 0,
                            }}
                          >
                            <Icon icon={tipoIcon(event.tipo)} width={18} />
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              gap={1}
                            >
                              <Typography
                                fontWeight={700}
                                color="text.primary"
                                noWrap
                              >
                                {event.titulo}
                              </Typography>
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={0.5}
                                onClick={(clickEvent) =>
                                  clickEvent.stopPropagation()
                                }
                              >
                                <Typography
                                  color="text.secondary"
                                  fontSize="0.8rem"
                                  fontWeight={700}
                                >
                                  {formatTime(event)}
                                </Typography>
                                <Tooltip title={t("agenda.actions.delete")}>
                                  <IconButton
                                    size="small"
                                    aria-label={t(
                                      "agenda.actions.deleteAppointment",
                                    )}
                                    color="error"
                                    onClick={() => openDeleteDialog(event)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                    }}
                                  >
                                    <Icon
                                      icon="mdi:trash-can-outline"
                                      width={16}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              gap={1}
                              mt={0.5}
                            >
                              <Typography
                                color="text.secondary"
                                fontSize="0.8rem"
                              >
                                {tipoLabel(event.tipo, t)}
                              </Typography>
                              <Chip
                                size="small"
                                label={chip.label}
                                sx={{
                                  height: 22,
                                  bgcolor: chip.bg,
                                  color: chip.color,
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                }}
                              />
                            </Stack>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Box>
        </Container>
      </Box>

      <NewCompromissoModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleNewCompromissoSubmit}
        initialValues={newCompromissoInitialValues}
        submitting={submittingCompromisso}
      />

      <EditCompromissoModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedEvent(null);
        }}
        initialValues={editCompromissoInitialValues}
        onSubmit={handleEditCompromissoSubmit}
        submitting={submittingCompromisso}
      />

      <BaseModal
        open={!!viewEvent}
        onClose={() => setViewEvent(null)}
        title={t("agenda.viewModal.title")}
        confirmText={t("agenda.actions.edit")}
        cancelText={t("agenda.actions.close")}
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
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  bgcolor: "action.hover",
                }}
              >
                <Typography color="text.secondary" fontSize="0.9rem">
                  {viewEvent.descricao}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </BaseModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("agenda.deleteDialog.title")}
        description={
          deleteTarget
            ? `${t("agenda.deleteDialog.prefix")} "${deleteTarget.titulo}" ${t("agenda.deleteDialog.suffix")}`
            : undefined
        }
        confirmText={t("agenda.actions.delete")}
        cancelText={t("common.cancel")}
        loading={deletingCompromisso}
        onClose={() => {
          if (deletingCompromisso) return;
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteCompromisso}
      />
    </Box>
  );
}
