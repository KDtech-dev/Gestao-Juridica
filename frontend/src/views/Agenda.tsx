"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { CalendarCard } from "@/components/CalendarCard";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { NewAppointmentModal } from "@/components/modals/NewAppointmentModal";
import { EditAppointmentModal } from "@/components/modals/EditAppointmentModal";
import {
  Appointment,
  AppointmentPayload,
  createAppointment,
  listAppointments,
  updateAppointment,
} from "@/services/appointmentService";
import { AppointmentFormValues } from "@/components/forms/AgendaForm";
import { getApiErrorMessage } from "@/configs/ApiError";
import { useAuthContext } from "@/context/AuthContext";

type EventStatus = "Confirmado" | "Pendente";

function statusChip(status: EventStatus) {
  if (status === "Confirmado") {
    return { color: "#047857", bg: "#b8ead2" };
  }
  return { color: "#c2410c", bg: "#ffe3bf" };
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

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function appointmentPlace(appointment: Appointment) {
  return appointment.type === "online"
    ? appointment.videoUrl || "Online"
    : appointment.location || "Local não informado";
}

function appointmentToFormValues(
  appointment: Appointment,
): AppointmentFormValues {
  return {
    title: appointment.title,
    type: appointment.type,
    clientName: appointment.clientName ?? "",
    location: appointment.location ?? "",
    videoUrl: appointment.videoUrl ?? "",
    startsAt: new Date(appointment.startsAt),
    status: appointment.status,
    description: appointment.description ?? "",
    lawyerIds: appointment.lawyerIds.map(String),
  };
}

function getNewAppointmentInitialValues(
  date: Date,
): Partial<AppointmentFormValues> {
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
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null,
  );
  const [submittingAppointment, setSubmittingAppointment] = useState(false);
  const { addNotification } = useNotifications();
  const handleOpenNewAppointmentModal = () => setOpen(true);
  const handleCloseNewAppointmentModal = () => setOpen(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const queryTime =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("time")
      : null;

  const loadAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      setAppointmentsError(null);
      const data = await listAppointments();
      setAppointments(data);
    } catch (error) {
      setAppointmentsError(getApiErrorMessage(error));
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const filteredEvents = useMemo(
    () =>
      appointments
        .filter((appointment) =>
          isSameDay(new Date(appointment.startsAt), selectedDate),
        )
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        ),
    [appointments, selectedDate],
  );
  const [openEdit, setOpenEdit] = useState(false);

  const newAppointmentInitialValues = useMemo(
    () => ({
      ...getNewAppointmentInitialValues(selectedDate),
      lawyerIds: user?.roles.includes("advogado") ? [String(user.id)] : [],
    }),
    [selectedDate, user],
  );

  const editAppointmentInitialValues = useMemo(
    () => (selectedEvent ? appointmentToFormValues(selectedEvent) : undefined),
    [selectedEvent],
  );

  const summary = useMemo(() => {
    const total = filteredEvents.length;
    const confirmed = filteredEvents.filter(
      (e) => e.status === "Confirmado",
    ).length;
    const pending = filteredEvents.filter(
      (e) => e.status === "Pendente",
    ).length;
    const now = new Date();
    const selectedIsToday = isSameDay(selectedDate, now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let next: Appointment | null = null;
    if (filteredEvents.length > 0) {
      if (selectedIsToday) {
        const future = filteredEvents
          .filter((e) => timeToMinutes(formatTime(e.startsAt)) > nowMinutes)
          .sort(
            (a, b) =>
              new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
          );
        next = future[0] ?? null;
      } else {
        next =
          filteredEvents
            .slice()
            .sort(
              (a, b) =>
                new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
            )[0] ?? null;
      }
    }

    return { total, confirmed, pending, next };
  }, [filteredEvents, selectedDate]);

  useEffect(() => {
    if (!queryTime) return;
    const idx = filteredEvents.findIndex(
      (e) => formatTime(e.startsAt) === queryTime,
    );
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

  async function handleNewAppointmentSubmit(payload: AppointmentPayload) {
    try {
      setSubmittingAppointment(true);
      const created = await createAppointment(payload);
      setAppointments((current) => [...current, created]);
      setSelectedDate(new Date(created.startsAt));
      setOpen(false);
      addNotification({
        title: "Compromisso agendado",
        description: "Um novo compromisso foi adicionado na agenda.",
      });
    } catch (error) {
      addNotification({
        title: "Erro ao agendar compromisso",
        description: getApiErrorMessage(error),
      });
    } finally {
      setSubmittingAppointment(false);
    }
  }

  async function handleEditAppointmentSubmit(payload: AppointmentPayload) {
    if (!selectedEvent) return;

    try {
      setSubmittingAppointment(true);
      const updated = await updateAppointment(selectedEvent.id, payload);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === updated.id ? updated : appointment,
        ),
      );
      setSelectedDate(new Date(updated.startsAt));
      setOpenEdit(false);
      setSelectedEvent(null);
      addNotification({
        title: "Compromisso atualizado",
        description: "As alterações foram salvas na agenda.",
      });
    } catch (error) {
      addNotification({
        title: "Erro ao salvar compromisso",
        description: getApiErrorMessage(error),
      });
    } finally {
      setSubmittingAppointment(false);
    }
  }

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
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2.2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                Agenda
              </Typography>
              <Typography color="text.secondary" fontSize="0.85rem">
                Gerencie seus compromissos e audiências.
              </Typography>
            </Box>

            <Stack direction="row" gap={1.2}>
              <Button
                variant="contained"
                startIcon={<Icon icon="mdi:plus" />}
                sx={{
                  textTransform: "none",
                  borderRadius: "12px",
                  px: 2.2,
                }}
                onClick={handleOpenNewAppointmentModal}
              >
                Novo Compromisso
              </Button>
            </Stack>
          </Stack>

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
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        fontWeight={700}
                        fontSize="1.15rem"
                        color="text.primary"
                      >
                        Resumo do Dia
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.86rem">
                        Visão rápida da agenda do dia
                      </Typography>
                    </Box>
                    <Button
                      variant="text"
                      onClick={() => setSelectedDate(new Date())}
                      sx={{ textTransform: "none" }}
                    >
                      Hoje
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={2} mt={2}>
                    <Paper
                      sx={{
                        p: 1.2,
                        flex: 1,
                        textAlign: "center",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography fontWeight={700}>{summary.total}</Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        Total
                      </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 1.2,
                        flex: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography fontWeight={700} color="#059669">
                        {summary.confirmed}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        Confirmados
                      </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 1.2,
                        flex: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography fontWeight={700} color="#c2410c">
                        {summary.pending}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        Pendentes
                      </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 1.2,
                        flex: 2,
                        textAlign: "left",
                      }}
                    >
                      <Typography fontWeight={700}>
                        {summary.next
                          ? formatTime(summary.next.startsAt) +
                            " — " +
                            summary.next.title
                          : "Sem próximos"}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.82rem">
                        Próximo compromisso
                      </Typography>
                    </Paper>
                  </Stack>
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
                    <Icon icon="mdi:clock-outline" width={20} />
                    <Typography
                      fontWeight={700}
                      fontSize="1.15rem"
                      color="text.primary"
                    >
                      Linha do Tempo
                    </Typography>
                  </Box>

                  <Stack sx={{ p: 2 }} spacing={0}>
                    {loadingAppointments && (
                      <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary">
                          Carregando compromissos...
                        </Typography>
                      </Box>
                    )}

                    {!loadingAppointments && appointmentsError && (
                      <Box sx={{ p: 2 }}>
                        <Typography color="error">
                          {appointmentsError}
                        </Typography>
                      </Box>
                    )}

                    {!loadingAppointments &&
                      !appointmentsError &&
                      filteredEvents.length === 0 && (
                        <Box sx={{ p: 2 }}>
                          <Typography color="text.secondary">
                            Nenhum compromisso para o dia selecionado.
                          </Typography>
                        </Box>
                      )}

                    {!loadingAppointments &&
                      !appointmentsError &&
                      filteredEvents.map((event, idx) => {
                        const now = new Date();
                        const selectedIsToday = isSameDay(selectedDate, now);
                        const nowMinutes =
                          now.getHours() * 60 + now.getMinutes();
                        const eventTime = formatTime(event.startsAt);
                        const eventMinutes = timeToMinutes(eventTime);
                        const isNow = queryTime
                          ? queryTime === eventTime
                          : selectedIsToday &&
                            nowMinutes >= eventMinutes &&
                            nowMinutes < eventMinutes + 60;
                        const isLast = idx === filteredEvents.length - 1;
                        const chip = statusChip(event.status);
                        const key = String(event.id);
                        const place = appointmentPlace(event);

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
                              py: 1.6,
                              px: 1.2,
                              cursor: "pointer",
                              bgcolor: isNow
                                ? "rgba(5,150,105,0.04)"
                                : "transparent",
                              transition: "background-color .12s",
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                            }}
                            onClick={() => {
                              setSelectedEvent(event);
                              setOpenEdit(true);
                            }}
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
                                  width: 10,
                                  height: 10,
                                  borderRadius: "999px",
                                  bgcolor: isNow ? "primary.main" : "divider",
                                }}
                              />
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

                            <Box sx={{ flex: 1 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography
                                  fontWeight={700}
                                  color="text.primary"
                                >
                                  {eventTime}
                                </Typography>
                                <Chip
                                  label={event.status}
                                  sx={{
                                    bgcolor: chip.bg,
                                    color: chip.color,
                                    fontWeight: 500,
                                  }}
                                />
                              </Stack>
                              <Typography fontWeight={700} color="text.primary">
                                {event.title}
                              </Typography>
                              <Typography
                                color="#2563eb"
                                fontSize="0.86rem"
                                mb={0.8}
                              >
                                {event.clientName || "Cliente não informado"}
                              </Typography>
                              <Stack
                                direction="row"
                                gap={2}
                                color="text.secondary"
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  gap={0.6}
                                >
                                  <Icon
                                    icon={
                                      event.type === "online"
                                        ? "mdi:video-outline"
                                        : "mdi:map-marker-outline"
                                    }
                                    width={16}
                                  />
                                  <Typography fontSize="0.83rem">
                                    {place}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  gap={0.6}
                                >
                                  <Icon icon="mdi:clock-start" width={16} />
                                  <Typography fontSize="0.83rem">
                                    {new Date(
                                      event.startsAt,
                                    ).toLocaleDateString("pt-BR")}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>
                          </Box>
                        );
                      })}
                  </Stack>
                </Paper>
              </Stack>
            </Box>

            <Stack spacing={2}>
              <CalendarCard
                value={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
              />
            </Stack>
          </Box>
        </Container>
      </Box>

      <NewAppointmentModal
        open={open}
        onClose={handleCloseNewAppointmentModal}
        onSubmit={handleNewAppointmentSubmit}
        initialValues={newAppointmentInitialValues}
        submitting={submittingAppointment}
      />

      <EditAppointmentModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedEvent(null);
        }}
        initialValues={editAppointmentInitialValues}
        onSubmit={handleEditAppointmentSubmit}
        submitting={submittingAppointment}
      />
    </Box>
  );
}
