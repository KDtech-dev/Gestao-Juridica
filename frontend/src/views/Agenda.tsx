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
import { Modal } from "@/components/ModalAntigo";
import { CalendarCard } from "@/components/CalendarCard";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNotifications } from "@/context/NotificationsContext";

type EventStatus = "Confirmado" | "Pendente";

type AgendaEvent = {
  time: string;
  duration: string;
  title: string;
  client: string;
  place: string;
  reminder: string;
  status: EventStatus;
};

const eventsToday: AgendaEvent[] = [
  {
    time: "09:00",
    duration: "1h",
    title: "Consultoria Inicial",
    client: "Acme Corporation",
    place: "Videoconferência",
    reminder: "15m antes",
    status: "Confirmado",
  },
  {
    time: "11:30",
    duration: "30m",
    title: "Revisão de Contrato",
    client: "Maria Oliveira",
    place: "Sala de Reunião A",
    reminder: "15m antes",
    status: "Confirmado",
  },
  {
    time: "14:00",
    duration: "2h",
    title: "Preparação para Audiência",
    client: "João Santos",
    place: "Sala de Reunião B",
    reminder: "15m antes",
    status: "Pendente",
  },
];

const eventsTomorrow: AgendaEvent[] = [
  {
    time: "10:00",
    duration: "1h",
    title: "Discussão M&A",
    client: "TechStart Inc.",
    place: "Videoconferência",
    reminder: "15m antes",
    status: "Confirmado",
  },
];

// the current logged user name will be read from localStorage at runtime

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

function durationToMinutes(duration: string) {
  if (!duration) return 60;
  const h = duration.match(/(\d+)h/);
  if (h) return Number(h[1]) * 60;
  const m = duration.match(/(\d+)m/);
  if (m) return Number(m[1]);
  const n = parseInt(duration, 10);
  return isNaN(n) ? 60 : n;
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function AgendaView() {
  const [open, setOpen] = useState(false);

  const { addNotification } = useNotifications();
  const handleOpenNewAppointmentModal = () => setOpen(true);
  const handleCloseNewAppointmentModal = () => setOpen(false);

  const handleNewAppointmentSubmit = () =>
    addNotification({
      title: "Compromisso agendado",
      description: "Um novo compromisso foi adicionado na agenda.",
    });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const queryTime =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("time")
      : null;

  function getEventsForDate(date: Date): AgendaEvent[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(date, today)) return eventsToday;
    if (isSameDay(date, tomorrow)) return eventsTomorrow;
    return [];
  }

  const filteredEvents = useMemo(
    () => getEventsForDate(selectedDate),
    [selectedDate],
  );
  const [openEdit, setOpenEdit] = useState(false);

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

    let next: AgendaEvent | null = null;
    if (filteredEvents.length > 0) {
      if (selectedIsToday) {
        const future = filteredEvents
          .filter((e) => timeToMinutes(e.time) > nowMinutes)
          .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
        next = future[0] ?? null;
      } else {
        next =
          filteredEvents
            .slice()
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))[0] ??
          null;
      }
    }

    return { total, confirmed, pending, next };
  }, [filteredEvents, selectedDate]);

  useEffect(() => {
    if (!queryTime) return;
    const idx = filteredEvents.findIndex((e) => e.time === queryTime);
    if (idx === -1) return;
    const key = `${queryTime}-${filteredEvents[idx].title}-${idx}`;
    const id = setTimeout(() => {
      const el = eventRefs.current[key];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
    return () => clearTimeout(id);
  }, [filteredEvents, queryTime]);

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
                          ? summary.next.time + " — " + summary.next.title
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
                    {filteredEvents.length === 0 && (
                      <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary">
                          Nenhum compromisso para o dia selecionado.
                        </Typography>
                      </Box>
                    )}

                    {filteredEvents.map((event, idx) => {
                      const now = new Date();
                      const selectedIsToday = isSameDay(selectedDate, now);
                      const nowMinutes = now.getHours() * 60 + now.getMinutes();
                      const eventMinutes = timeToMinutes(event.time);
                      const durationMinutes = durationToMinutes(event.duration);
                      const isNow = queryTime
                        ? queryTime === event.time
                        : selectedIsToday &&
                          nowMinutes >= eventMinutes &&
                          nowMinutes < eventMinutes + durationMinutes;
                      const isLast = idx === filteredEvents.length - 1;
                      const chip = statusChip(event.status);
                      const key = `${event.time}-${event.title}-${idx}`;

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
                              <Typography fontWeight={700} color="text.primary">
                                {event.time}
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
                              {event.client}
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
                                    event.place === "Videoconferência"
                                      ? "mdi:video-outline"
                                      : "mdi:map-marker-outline"
                                  }
                                  width={16}
                                />
                                <Typography fontSize="0.83rem">
                                  {event.place}
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={0.6}
                              >
                                <Icon icon="mdi:bell-outline" width={16} />
                                <Typography fontSize="0.83rem">
                                  {event.reminder}
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

      <Modal
        open={open}
        onClose={handleCloseNewAppointmentModal}
        variant="newAppointment"
        onSubmit={handleNewAppointmentSubmit}
      />

      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        variant="editAppointment"
        //event={selectedEvent}
        onSubmit={() => {}}
      />
    </Box>
  );
}
