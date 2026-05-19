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

const formId = "new-appointment-form";

export function NewAppointmentModal({
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
      title="Novo compromisso"
      confirmText={submitting ? "Agendando..." : "Agendar compromisso"}
      confirmFormId={formId}
      confirmType="submit"
      confirmDisabled={submitting}
      maxWidth="lg"
    >
      <AppointmentForm
        key={initialValues?.startsAt?.toISOString() ?? "new-appointment"}
        id={formId}
        initialValues={initialValues}
        disabled={submitting}
        onSubmit={onSubmit}
      />
    </BaseModal>
  );
}

export default NewAppointmentModal;
