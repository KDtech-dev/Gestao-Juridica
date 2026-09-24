import { useMemo } from "react";
import type { Compromisso, CompromissoPayload } from "@/api/apiCompromissos";
import { compromissoToFormValues } from "@/utils/compromisso";
import { EditCompromissoModal } from "@/components/modals/EditCompromissoModal";
import { NewCompromissoModal } from "@/components/modals/NewCompromissoModal";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import { getApiErrorMessage } from "@/configs/ApiError";
import { useNotifications } from "@/context/NotificationsContext";
import { useTranslation } from "@/hooks/useTranslation";
import { AgendaData } from "@/hooks/useAgendaData";
import { getNewCompromissoInitialValues } from "@/hooks/Agenda";
import { EventViewModal } from "./Eventviewmodal";
import { AgendaModalsApi } from "@/hooks/UseAgendaModals";

interface AgendaModalsProps {
  modals: AgendaModalsApi;
  actions: Pick<AgendaData, "create" | "update" | "remove">;
  selectedDate: Date;
  onSaved: (compromisso: Compromisso) => void;
}

export function AgendaModals({
  modals,
  actions,
  selectedDate,
  onSaved,
}: AgendaModalsProps) {
  const { t } = useTranslation();
  const { addNotification } = useNotifications();
  const { modal, lastEvent, close, openEdit } = modals;

  const newInitialValues = useMemo(
    () => getNewCompromissoInitialValues(selectedDate),
    [selectedDate],
  );
  const editInitialValues = useMemo(
    () => (lastEvent ? compromissoToFormValues(lastEvent) : undefined),
    [lastEvent],
  );

  async function handleCreate(payload: CompromissoPayload) {
    try {
      const created = await actions.create.run(payload);
      onSaved(created);
      close();
      addNotification({
        title: t("agenda.notifications.createdTitle"),
        description: t("agenda.notifications.createdDescription"),
      });
    } catch (error) {
      addNotification({
        title: t("agenda.notifications.createErrorTitle"),
        description: getApiErrorMessage(error),
      });
    }
  }

  async function handleEdit(payload: CompromissoPayload) {
    if (modal?.type !== "edit") return;

    try {
      const updated = await actions.update.run({ id: modal.event.id, payload });
      onSaved(updated);
      close();
      addNotification({
        title: t("agenda.notifications.updatedTitle"),
        description: t("agenda.notifications.updatedDescription"),
      });
    } catch (error) {
      addNotification({
        title: t("agenda.notifications.updateErrorTitle"),
        description: getApiErrorMessage(error),
      });
    }
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;

    try {
      await actions.remove.run(modal.event.id);
      close();
      addNotification({
        title: t("agenda.notifications.deletedTitle"),
        description: t("agenda.notifications.deletedDescription"),
      });
    } catch (error) {
      addNotification({
        title: t("agenda.notifications.deleteErrorTitle"),
        description: getApiErrorMessage(error),
      });
    }
  }

  const submitting = actions.create.pending || actions.update.pending;

  return (
    <>
      <NewCompromissoModal
        open={modal?.type === "create"}
        onClose={close}
        onSubmit={handleCreate}
        initialValues={newInitialValues}
        submitting={submitting}
      />

      <EditCompromissoModal
        open={modal?.type === "edit"}
        onClose={close}
        initialValues={editInitialValues}
        onSubmit={handleEdit}
        submitting={submitting}
      />

      <EventViewModal
        open={modal?.type === "view"}
        event={lastEvent}
        onClose={close}
        onEdit={openEdit}
      />

      <ConfirmDialog
        open={modal?.type === "delete"}
        title={t("agenda.deleteDialog.title")}
       
        description={
          lastEvent
            ? `${t("agenda.deleteDialog.prefix")} "${lastEvent.titulo}" ${t("agenda.deleteDialog.suffix")}`
            : undefined
        }
        confirmText={t("agenda.actions.delete")}
        cancelText={t("common.cancel")}
        loading={actions.remove.pending}
        onClose={() => {
          if (actions.remove.pending) return;
          close();
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}