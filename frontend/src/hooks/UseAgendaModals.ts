"use client";

import { useCallback, useState } from "react";
import type { Compromisso } from "@/api/apiCompromissos";
import { ModalState } from "@/@core/types";

export function useAgendaModals() {
  const [modal, setModal] = useState<ModalState>(null);

  const [lastEvent, setLastEvent] = useState<Compromisso | null>(null);

  const openCreate = useCallback(() => setModal({ type: "create" }), []);

  const openView = useCallback((event: Compromisso) => {
    setLastEvent(event);
    setModal({ type: "view", event });
  }, []);

  const openEdit = useCallback((event: Compromisso) => {
    setLastEvent(event);
    setModal({ type: "edit", event });
  }, []);

  const openDelete = useCallback((event: Compromisso) => {
    setLastEvent(event);
    setModal({ type: "delete", event });
  }, []);

  const close = useCallback(() => setModal(null), []);

  return { modal, lastEvent, openCreate, openView, openEdit, openDelete, close };
}

export type AgendaModalsApi = ReturnType<typeof useAgendaModals>;