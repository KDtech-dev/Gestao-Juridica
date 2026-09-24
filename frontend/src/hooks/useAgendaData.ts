"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Compromisso,
  CompromissoPayload,
  CompromissoVisao,
  createCompromisso,
  deleteCompromisso,
  listCompromissos,
  updateCompromisso,
} from "@/api/apiCompromissos";
import { getApiErrorMessage } from "@/configs/ApiError";
import { useAuthContext } from "@/context/AuthContext";
import { sortByDate } from "./Agenda";
import { AgendaPeriod } from "@/@core/types";


function useCompromissoList(
  key: string,
  enabled: boolean,
  fetcher: () => Promise<Compromisso[]>,
) {
  const [data, setData] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });
  const loadedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    if (loadedKeyRef.current !== key) setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        loadedKeyRef.current = key;
        setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, enabled, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, refetch };
}

function useAsyncAction<A, R>(fn: (arg: A) => Promise<R>) {
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (arg: A) => {
      setPending(true);
      try {
        return await fn(arg);
      } finally {
        setPending(false);
      }
    },
    [fn],
  );

  return { run, pending };
}

interface UpdateArgs {
  id: Compromisso["id"];
  payload: CompromissoPayload;
}

export function useAgendaData(visao: CompromissoVisao, period: AgendaPeriod) {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const enabled = isAuthenticated && !authLoading;

  const all = useCompromissoList(`all:${visao}`, enabled, () =>
    listCompromissos(visao),
  );
  const upcomingRaw = useCompromissoList(
    `upcoming:${visao}:${period}`,
    enabled,
    () => listCompromissos(visao, { periodo: period }),
  );

  const upcomingData = useMemo(
    () => sortByDate(upcomingRaw.data),
    [upcomingRaw.data],
  );

  const refetchAll = all.refetch;
  const refetchUpcoming = upcomingRaw.refetch;
  const invalidate = useCallback(() => {
    refetchAll();
    refetchUpcoming();
  }, [refetchAll, refetchUpcoming]);

  const create = useAsyncAction(
    useCallback(
      async (payload: CompromissoPayload) => {
        const created = await createCompromisso(payload);
        invalidate();
        return created;
      },
      [invalidate],
    ),
  );

  const update = useAsyncAction(
    useCallback(
      async ({ id, payload }: UpdateArgs) => {
        const updated = await updateCompromisso(id, payload);
        invalidate();
        return updated;
      },
      [invalidate],
    ),
  );

  const remove = useAsyncAction(
    useCallback(
      async (id: Compromisso["id"]) => {
        await deleteCompromisso(id);
        invalidate();
      },
      [invalidate],
    ),
  );

  return {
    all: { data: all.data, error: all.error },
    upcoming: {
      data: upcomingData,
      loading: upcomingRaw.loading,
      error: upcomingRaw.error,
    },
    create,
    update,
    remove,
  };
}

export type AgendaData = ReturnType<typeof useAgendaData>;