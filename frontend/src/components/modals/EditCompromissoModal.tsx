"use client";

import {
  CompromissoForm,
  CompromissoFormValues,
} from "@/components/forms/CompromissoForm";
import { BaseModal } from "@/components/modals/BaseModal";
import { CompromissoPayload } from "@/api/apiCompromissos";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CompromissoPayload) => void;
  initialValues?: Partial<CompromissoFormValues>;
  submitting?: boolean;
};

const formId = "edit-compromisso-form";

export function EditCompromissoModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  submitting = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={t("agenda.form.editTitle")}
      confirmText={
        submitting ? t("agenda.form.saving") : t("agenda.form.saveChanges")
      }
      confirmFormId={formId}
      confirmType="submit"
      confirmDisabled={submitting}
      maxWidth="md"
    >
      <CompromissoForm
        key={`${initialValues?.titulo ?? "edit"}-${initialValues?.startsAt?.toISOString() ?? ""}`}
        id={formId}
        initialValues={initialValues}
        disabled={submitting}
        onSubmit={onSubmit}
      />
    </BaseModal>
  );
}
