"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { AppointmentForm } from "@/components/forms/AgendaForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function EditAppointmentModal({ open, onClose, onSubmit }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Editar Compromisso"
      confirmText="Salvar Alterações"
      onSubmit={onSubmit}
      maxWidth="lg"
    >
      <AppointmentForm />
    </BaseModal>
  );
}

export default EditAppointmentModal;
