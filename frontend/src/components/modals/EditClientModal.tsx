"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { ClientForm } from "@/components/forms/ClientForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function EditClientModal({ open, onClose, onSubmit }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Editar Cliente"
      confirmText="Salvar Alterações"
      onSubmit={onSubmit}
      maxWidth="lg"
    >
      <ClientForm />
    </BaseModal>
  );
}

export default EditClientModal;
