"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { ClientForm } from "@/components/forms/ClientForm";
import { Client } from "@/services/clientService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<Client>) => void;
  submitting?: boolean;
};

const formId = "new-client-form";

export function NewClientModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Novo Cliente"
      confirmText={submitting ? "Adicionando..." : "Adicionar Cliente"}
      confirmFormId={formId}
      confirmType="submit"
      confirmDisabled={submitting}
      maxWidth="lg"
    >
      <ClientForm
        key={open ? "new-client-open" : "new-client-closed"}
        id={formId}
        disabled={submitting}
        onSubmit={onSubmit}
      />
    </BaseModal>
  );
}

export default NewClientModal;
