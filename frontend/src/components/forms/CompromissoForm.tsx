"use client";

import { Box, MenuItem, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { FormEvent, useMemo, useState } from "react";
import {
  CompromissoPayload,
  CompromissoStatus,
  CompromissoTipo,
} from "@/services/compromissoService";
import { useTranslation } from "@/hooks/useTranslation";

export type CompromissoFormValues = {
  titulo: string;
  tipo: CompromissoTipo;
  status: CompromissoStatus;
  startsAt: Date | null;
  descricao: string;
};

type Props = {
  id: string;
  initialValues?: Partial<CompromissoFormValues>;
  disabled?: boolean;
  onSubmit: (payload: CompromissoPayload) => void;
};

const defaultValues: CompromissoFormValues = {
  titulo: "",
  tipo: "COMPROMISSO",
  status: "PENDENTE",
  startsAt: new Date(),
  descricao: "",
};

function toDate(value: Date | null) {
  if (!value) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toTime(value: Date | null) {
  if (!value) return "";

  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function CompromissoForm({
  id,
  initialValues,
  disabled = false,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const resolvedInitialValues = useMemo(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );
  const [values, setValues] = useState<CompromissoFormValues>(
    resolvedInitialValues,
  );
  const [submitted, setSubmitted] = useState(false);

  function updateValue<K extends keyof CompromissoFormValues>(
    name: K,
    value: CompromissoFormValues[K],
  ) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const titulo = values.titulo.trim();
    const startsAt = values.startsAt;

    if (!titulo || !startsAt) return;

    onSubmit({
      titulo,
      tipo: values.tipo,
      status: values.status,
      data: toDate(startsAt),
      hora: toTime(startsAt),
      descricao: values.descricao.trim(),
    });
  }

  return (
    <Box
      id={id}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
        },
        gap: 2,
      }}
    >
      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          fullWidth
          required
          disabled={disabled}
          label={t("agenda.form.titleLabel")}
          value={values.titulo}
          error={submitted && !values.titulo.trim()}
          helperText={
            submitted && !values.titulo.trim()
              ? t("agenda.form.titleRequired")
              : undefined
          }
          onChange={(event) => updateValue("titulo", event.target.value)}
        />
      </Box>

      <TextField
        select
        fullWidth
        disabled={disabled}
        label={t("agenda.form.typeLabel")}
        value={values.tipo}
        onChange={(event) =>
          updateValue("tipo", event.target.value as CompromissoTipo)
        }
      >
        <MenuItem value="COMPROMISSO">{t("agenda.types.appointment")}</MenuItem>
        <MenuItem value="REUNIAO">{t("agenda.types.meeting")}</MenuItem>
        <MenuItem value="AUDIENCIA">{t("agenda.types.hearing")}</MenuItem>
        <MenuItem value="PRAZO">{t("agenda.types.deadline")}</MenuItem>
        <MenuItem value="LEMBRETE">{t("agenda.types.reminder")}</MenuItem>
      </TextField>

      <TextField
        select
        fullWidth
        disabled={disabled}
        label={t("agenda.form.statusLabel")}
        value={values.status}
        onChange={(event) =>
          updateValue("status", event.target.value as CompromissoStatus)
        }
      >
        <MenuItem value="PENDENTE">{t("agenda.status.pending")}</MenuItem>
        <MenuItem value="CONCLUIDO">{t("agenda.status.completed")}</MenuItem>
        <MenuItem value="CANCELADO">{t("agenda.status.cancelled")}</MenuItem>
      </TextField>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <DateTimePicker
          label={t("agenda.form.dateTimeLabel")}
          sx={{ width: "100%" }}
          format="dd/MM/yyyy HH:mm"
          value={values.startsAt}
          disabled={disabled}
          ampm={false}
          onChange={(value) => updateValue("startsAt", value)}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              error: submitted && !values.startsAt,
              helperText:
                submitted && !values.startsAt
                  ? t("agenda.form.dateTimeRequired")
                  : undefined,
            },
          }}
        />
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          disabled={disabled}
          label={t("agenda.form.descriptionLabel")}
          value={values.descricao}
          onChange={(event) => updateValue("descricao", event.target.value)}
        />
      </Box>
    </Box>
  );
}
