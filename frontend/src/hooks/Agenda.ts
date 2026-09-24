import { AgendaSummaryData } from "@/@core/types";
import type { Compromisso } from "@/api/apiCompromissos";
import type { CompromissoFormValues } from "@/components/forms/CompromissoForm";
import {
  compromissoDate,
  formatTime,
  isSameDay,
  timeToMinutes,
} from "@/utils/compromisso";

export function sortByDate(events: Compromisso[]): Compromisso[] {
  return events
    .map((event) => ({ event, ts: compromissoDate(event).getTime() }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ event }) => event);
}

export function buildSummary(events: Compromisso[]): AgendaSummaryData {
  return {
    total: events.length,
    finished: events.filter((e) => e.status === "CONCLUIDO").length,
    pending: events.filter((e) => e.status === "PENDENTE").length,
    next: events[0] ?? null,
  };
}

export function isHappeningNow(
  event: Compromisso,
  now: Date,
  queryTime: string | null,
): boolean {
  const time = formatTime(event);
  if (queryTime) return queryTime === time;

  const start = timeToMinutes(time);
  const current = now.getHours() * 60 + now.getMinutes();

  return (
    isSameDay(compromissoDate(event), now) &&
    current >= start &&
    current < start + 60
  );
}

export function getNewCompromissoInitialValues(
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