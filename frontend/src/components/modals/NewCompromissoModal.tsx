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

const formId = "new-compromisso-form";

export function NewCompromissoModal({
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
      title={t("agenda.form.newTitle")}
      confirmText={
        submitting
          ? t("agenda.form.scheduling")
          : t("agenda.form.scheduleAppointment")
      }
      confirmFormId={formId}
      confirmType="submit"
      confirmDisabled={submitting}
      maxWidth="md"
    >
      <CompromissoForm
        key={initialValues?.startsAt?.toISOString() ?? "new-compromisso"}
        id={formId}
        initialValues={initialValues}
        disabled={submitting}
        onSubmit={onSubmit}
      />
    </BaseModal>
  );
}
