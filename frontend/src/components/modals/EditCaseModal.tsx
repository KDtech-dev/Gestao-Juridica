"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { EditCaseForm } from "@/components/forms/EditCaseForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function EditCaseModal({ open, onClose, onSubmit }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Editar caso"
      confirmText="Salvar alterações"
      onSubmit={onSubmit}
      maxWidth="lg"
    >
      <EditCaseForm />
    </BaseModal>
  );
}

export default EditCaseModal;
