"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { ClientForm } from "@/components/forms/ClientForm";
import { Client } from "@/services/clientService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload?: Partial<Client>) => void;
};

const formId = "edit-client-form";

export function EditClientModal({ open, onClose, onSubmit }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Editar cliente"
      confirmText="Salvar alterações"
      confirmFormId={formId}
      confirmType="submit"
      maxWidth="lg"
    >
      <ClientForm id={formId} onSubmit={onSubmit} />
    </BaseModal>
  );
}

export default EditClientModal;
