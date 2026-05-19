"use client";

import { BaseModal } from "@/components/modals/BaseModal";
import { CaseForm } from "@/components/forms/CaseForm";
import { CasePayload } from "@/services/caseService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CasePayload) => void;
  submitting?: boolean;
};

const formId = "new-case-form";

export function NewCaseModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Novo caso"
      confirmText={submitting ? "Criando..." : "Criar caso"}
      confirmFormId={formId}
      confirmType="submit"
      confirmDisabled={submitting}
      maxWidth="lg"
    >
      <CaseForm
        key={open ? "new-case-open" : "new-case-closed"}
        id={formId}
        disabled={submitting}
        onSubmit={onSubmit}
      />
    </BaseModal>
  );
}

export default NewCaseModal;
