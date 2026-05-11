"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { CaseForm } from "@/components/forms/CaseForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function NewCaseModal({ open, onClose, onSubmit }: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Novo Caso"
      confirmText="Criar Caso"
      onSubmit={onSubmit}
      maxWidth="lg"
    >
      <CaseForm />
    </BaseModal>
  );
}

export default NewCaseModal;
