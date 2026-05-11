"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { ClientForm } from "@/components/forms/ClientForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function NewClientModal({ open, onClose, onSubmit }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Novo Cliente"
      confirmText="Adicionar Cliente"
      onSubmit={onSubmit}
      maxWidth="lg"
    >
      <ClientForm />
    </BaseModal>
  );
}

export default NewClientModal;
