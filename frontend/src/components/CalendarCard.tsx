"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export type CalendarCardEvent = {
  date: Date;
  color?: string | null;
};

type CalendarCardProps = {
  value?: Date;
  onSelectDate?: (date: Date) => void;
  events?: CalendarCardEvent[];
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CalendarCard({
  value,
  onSelectDate,
  events = [],
}: CalendarCardProps) {
  const { t, language } = useTranslation();
  const initial = value ?? new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState(initial.getDate());
  const handlePreviousMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  const handleNextMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  const handleSelectDay = (day: number) => () => {
    setSelectedDay(day);
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    onSelectDate?.(selectedDate);
  };

  useEffect(() => {
    if (!value) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date(value.getFullYear(), value.getMonth(), 1));
    setSelectedDay(value.getDate());
  }, [value]);

  const { monthLabel, cells } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstWeekDay = getFirstWeekDay(year, month);

    const monthLabel = currentDate.toLocaleDateString(language, {
      month: "long",
      year: "numeric",
    });

    const prefix = Array.from({ length: firstWeekDay }, (_, index) => ({
      key: `p-${index}`,
      day: null as number | null,
    }));
    const days = Array.from({ length: daysInMonth }, (_, index) => ({
      key: `d-${index + 1}`,
      day: index + 1,
    }));

    return { monthLabel, cells: [...prefix, ...days] };
  }, [currentDate, language]);

  const weekDays = useMemo(
    () => [
      t("agenda.calendar.weekDays.sun"),
      t("agenda.calendar.weekDays.mon"),
      t("agenda.calendar.weekDays.tue"),
      t("agenda.calendar.weekDays.wed"),
      t("agenda.calendar.weekDays.thu"),
      t("agenda.calendar.weekDays.fri"),
      t("agenda.calendar.weekDays.sat"),
    ],
    [t],
  );

  const eventDayInfo = useMemo(() => {
    const info = new Map<string, { count: number; colors: Set<string> }>();

    events.forEach(({ date, color }) => {
      const key = dateKey(date);
      const entry = info.get(key) ?? { count: 0, colors: new Set<string>() };
      entry.count += 1;
      if (color) entry.colors.add(color);
      info.set(key, entry);
    });

    return info;
  }, [events]);

  const selectedDateKey = value
    ? dateKey(value)
    : dateKey(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDay,
      ),
    );

  return (
    <Paper
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        p: 2.4,
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography
          fontWeight={700}
          color="text.primary"
          fontSize="1.15rem"
          textTransform="capitalize"
        >
          {monthLabel}
        </Typography>
        <Stack direction="row" gap={0.2}>
          <IconButton size="small" onClick={handlePreviousMonth}>
            <Icon icon="mdi:chevron-left" width={20} />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth}>
            <Icon icon="mdi:chevron-right" width={20} />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          rowGap: 1.1,
        }}
      >
        {weekDays.map((day) => (
          <Box key={day}>
            <Typography fontSize="0.75rem" color="text.secondary">
              {day}
            </Typography>
          </Box>
        ))}

        {cells.map((cell) => (
          <Box key={cell.key}>
            {cell.day ? (
              (() => {
                const cellDateKey = dateKey(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    cell.day,
                  ),
                );
                const isSelected = cellDateKey === selectedDateKey;
                const dayInfo = eventDayInfo.get(cellDateKey);
                const eventCount = dayInfo?.count ?? 0;
                const hasEvent = eventCount > 0;
                const dayColor =
                  dayInfo && dayInfo.colors.size === 1
                    ? [...dayInfo.colors][0]
                    : undefined;

                return (
                  <Box
                    component="button"
                    type="button"
                    aria-label={`${t("agenda.calendar.selectDay")} ${cell.day}`}
                    onClick={handleSelectDay(cell.day as number)}
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "999px",
                      border: "1px solid",
                      borderColor: hasEvent
                        ? isSelected
                          ? "primary.main"
                          : (dayColor ?? "primary.light")
                        : "transparent",
                      display: "grid",
                      placeItems: "center",
                      position: "relative",
                      fontWeight: 500,
                      fontSize: "1.05rem",
                      color: isSelected ? "#fff" : "text.primary",
                      bgcolor: isSelected
                        ? "primary.main"
                        : hasEvent
                          ? dayColor
                            ? `${dayColor}22`
                            : "rgba(25,118,210,0.08)"
                          : "transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition:
                        "background-color .12s, border-color .12s, box-shadow .12s, transform .12s",
                      "&:hover": {
                        bgcolor: isSelected
                          ? "primary.dark"
                          : "rgba(25,118,210,0.12)",
                        borderColor: "primary.main",
                        transform: "translateY(-1px)",
                        boxShadow: "0 8px 16px rgba(15,23,42,0.10)",
                      },
                      "&:focus-visible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    {cell.day}
                    {hasEvent && (
                      <Box
                        sx={{
                          minWidth: eventCount > 1 ? 14 : 6,
                          height: eventCount > 1 ? 14 : 6,
                          px: eventCount > 1 ? 0.4 : 0,
                          borderRadius: "999px",
                          bgcolor: isSelected
                            ? "#fff"
                            : (dayColor ?? "primary.main"),
                          color: isSelected
                            ? "primary.main"
                            : dayColor
                              ? "#fff"
                              : "#fff",
                          position: "absolute",
                          bottom: eventCount > 1 ? -2 : 5,
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          lineHeight: 1,
                        }}
                      >
                        {eventCount > 1 ? eventCount : null}
                      </Box>
                    )}
                  </Box>
                );
              })()
            ) : (
              <Box sx={{ width: 38, height: 38 }} />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}