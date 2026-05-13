"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import {
  AppointmentForm,
  AppointmentFormValues,
} from "@/components/forms/AgendaForm";
import { AppointmentPayload } from "@/services/appointmentService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AppointmentPayload) => void;
  initialValues?: Partial<AppointmentFormValues>;
  submitting?: boolean;
};

const formId = "edit-appointment-form";

export function EditAppointmentModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  submitting = false,
}: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Editar Compromisso"
      confirmText={submitting ? "Salvando..." : "Salvar Alterações"}
      confirmFormId={formId}
      confirmType="submit"
      confirmDisabled={submitting}
      maxWidth="lg"
    >
      <AppointmentForm
        key={`${initialValues?.title ?? "edit"}-${initialValues?.startsAt?.toISOString() ?? ""}`}
        id={formId}
        initialValues={initialValues}
        disabled={submitting}
        onSubmit={onSubmit}
      />
    </BaseModal>
  );
}

export default EditAppointmentModal;
