import { useMemo } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { Compromisso } from "@/api/apiCompromissos";
import { useTranslation } from "@/hooks/useTranslation";
import { compromissoDate, isSameDay } from "@/utils/compromisso";
import { sortByDate } from "@/hooks/Agenda";
import { CardPaper } from "./Cardpaper";
import { DayEventItem } from "./Dayeventitem";


interface SelectedDayPanelProps {
  date: Date;
  events: Compromisso[];
  error: string | null;
  onView: (event: Compromisso) => void;
  onDelete: (event: Compromisso) => void;
  canDelete: boolean;
}

export function SelectedDayPanel({
  date,
  events,
  error,
  onView,
  onDelete,
  canDelete,
}: SelectedDayPanelProps) {
  const { t, language } = useTranslation();

  const dayEvents = useMemo(
    () =>
      sortByDate(events.filter((e) => isSameDay(compromissoDate(e), date))),
    [events, date],
  );

  const dateLabel = useMemo(
    () =>
      date.toLocaleDateString(language, {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
    [language, date],
  );

  return (
    <CardPaper sx={{ p: 2, bgcolor: "background.paper" }}>
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
            {dateLabel}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={dayEvents.length}
          color={dayEvents.length > 0 ? "primary" : "default"}
        />
      </Stack>

      {error ? (
        <Box sx={{ p: 1.5 }}>
          <Typography color="error" fontSize="0.88rem">
            {error}
          </Typography>
        </Box>
      ) : dayEvents.length === 0 ? (
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
          {dayEvents.map((event) => (
            <DayEventItem
              key={event.id}
              event={event}
              onView={onView}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          ))}
        </Stack>
      )}
    </CardPaper>
  );
}
