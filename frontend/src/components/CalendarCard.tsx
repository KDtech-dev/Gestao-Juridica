"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useMemo, useState, useEffect } from "react";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

type CalendarCardProps = {
  value?: Date;
  onSelectDate?: (date: Date) => void;
};

export function CalendarCard({ value, onSelectDate }: CalendarCardProps) {
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

    const monthLabel = currentDate.toLocaleDateString("pt-BR", {
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
  }, [currentDate]);

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
              <Box
                onClick={handleSelectDay(cell.day as number)}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 500,
                  fontSize: "1.05rem",
                  color: cell.day === selectedDay ? "#fff" : "text.primary",
                  bgcolor:
                    cell.day === selectedDay ? "primary.main" : "transparent",
                  cursor: "pointer",
                }}
              >
                {cell.day}
              </Box>
            ) : (
              <Box sx={{ width: 38, height: 38 }} />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
