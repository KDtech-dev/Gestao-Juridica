"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Compromisso } from "@/api/apiCompromissos";
import { compromissoDate, formatTime, isSameDay } from "@/utils/compromisso";


export function useScrollToEventByTime(
  events: Compromisso[],
  goToIndex: (index: number) => void,
) {
  const queryTime = useSearchParams().get("time");

  const goToIndexRef = useRef(goToIndex);
  useEffect(() => {
    goToIndexRef.current = goToIndex;
  });

  const targetIndex = useMemo(() => {
    if (!queryTime) return -1;
    const now = new Date();
    const sameTime = (e: Compromisso) => formatTime(e) === queryTime;
    const today = events.findIndex(
      (e) => sameTime(e) && isSameDay(compromissoDate(e), now),
    );
    return today !== -1 ? today : events.findIndex(sameTime);
  }, [events, queryTime]);

  const targetId = targetIndex >= 0 ? String(events[targetIndex].id) : null;

  useEffect(() => {
    if (targetIndex < 0 || targetId === null) return;

    goToIndexRef.current(targetIndex);
    const timer = setTimeout(() => {
      document
        .querySelector(`[data-event-id="${CSS.escape(targetId)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    return () => clearTimeout(timer);
  }, [targetIndex, targetId]);

  return queryTime;
}