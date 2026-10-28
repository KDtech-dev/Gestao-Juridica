"use client";

import { useCallback, useMemo, useState } from "react";
import { Box, Container, Stack } from "@mui/material";
import type { Compromisso, CompromissoVisao } from "@/api/apiCompromissos";
import { CalendarCard } from "@/components/CalendarCard";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { compromissoDate, isSameDay } from "@/utils/compromisso";
import { AgendaPeriod } from "@/@core/types";
import { useAgendaData } from "@/hooks/useAgendaData";
import { buildSummary } from "@/hooks/Agenda";
import { AgendaHeader } from "@/components/Agenda/Agendaheader";
import { AgendaSummary } from "@/components/Agenda/Agendasummary";
import { AgendaTimeline } from "@/components/Agenda/Agendatimeline";
import { SelectedDayPanel } from "@/components/Agenda/Selecteddaypanel";
import { AgendaModals } from "@/components/Agenda/Agendamodals";
import { AgendaVisaoTabs } from "@/components/Agenda/Agendavisaotabs";
import { useAgendaModals } from "@/hooks/UseAgendaModals";
import usePermission from "@/@core/hooks/custom/usePermission";


export default function AgendaView() {
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("compromissos.criar");
  const canEdit = hasPermission("compromissos.editar");
  const canDelete = hasPermission("compromissos.excluir");
  const [visao, setVisao] = useState<CompromissoVisao>("publica");
  const [period, setPeriod] = useState<AgendaPeriod>("today");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const modals = useAgendaModals();
  const { all, upcoming, create, update, remove } = useAgendaData(visao, period);

  const summary = useMemo(() => buildSummary(upcoming.data), [upcoming.data]);

  const calendarEvents = useMemo(
    () =>
      all.data.map((c) => ({
        date: compromissoDate(c),
        color: c.criador.cor_perfil ?? null,
      })),
    [all.data],
  );

  const handlePeriodChange = useCallback((value: AgendaPeriod) => {
    setPeriod(value);
    if (value === "today") setSelectedDate(new Date());
  }, []);

  const handleSaved = useCallback(
    (compromisso: Compromisso) => setSelectedDate(compromissoDate(compromisso)),
    [],
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", display: "block" }}>
      <SidebarDashboard activeKey="agenda" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <AgendaHeader
            isToday={isSameDay(selectedDate, new Date())}
            onNew={modals.openCreate}
            canCreate={canCreate}
          />
          <AgendaVisaoTabs value={visao} onChange={setVisao} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.45fr 0.7fr" },
              gap: 2,
            }}
          >
            <Stack spacing={2}>
              <AgendaSummary
                period={period}
                onPeriodChange={handlePeriodChange}
                visao={visao}
                summary={summary}
              />
              <AgendaTimeline
                events={upcoming.data}
                loading={upcoming.loading}
                error={upcoming.error}
                resetKey={`${visao}-${period}`}
                onView={modals.openView}
                onEdit={modals.openEdit}
                onDelete={modals.openDelete}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            </Stack>

            <Stack spacing={2}>
              <CalendarCard
                value={selectedDate}
                onSelectDate={setSelectedDate}
                events={calendarEvents}
              />
              <SelectedDayPanel
                date={selectedDate}
                events={all.data}
                error={all.error}
                onView={modals.openView}
                onDelete={modals.openDelete}
                canDelete={canDelete}
              />
            </Stack>
          </Box>
        </Container>
      </Box>

      <AgendaModals
        modals={modals}
        actions={{ create, update, remove }}
        selectedDate={selectedDate}
        onSaved={handleSaved}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </Box>
  );
}
