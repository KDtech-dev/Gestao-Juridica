"use client";

import {
  Autocomplete,
  Box,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createCompromissoSchema,
  CompromissoFormValues,
} from "@/schemas/CompromissoSchema";
import { CompromissoPayload } from "@/api/apiCompromissos";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { getAxios } from "@/configs/axios";
import type { UserType } from "@/@core/types";

export type { CompromissoFormValues };

type UsuarioOption = Pick<UserType, "id" | "name">;

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
  userId: "",
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

function toDateTimeInputValue(value: Date | null) {
  if (!value) return "";

  return `${toDate(value)}T${toTime(value)}`;
}

function fromDateTimeInputValue(value: string) {
  if (!value) return null;

  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day, hour || 0, minute || 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function CompromissoForm({
  id,
  initialValues,
  disabled = false,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const tv = useTranslations("validation");
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  useEffect(() => {
    let ativo = true;

    getAxios()
      .get("/users", { params: { per_page: 999 } })
      .then((response) => {
        if (ativo) setUsuarios(response.data?.data ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setLoadingUsuarios(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const { control, handleSubmit } = useForm<CompromissoFormValues>({
    defaultValues: {
      ...defaultValues,
      ...initialValues,
      userId: initialValues?.userId ?? (user ? String(user.id) : ""),
    },
    resolver: zodResolver(createCompromissoSchema(tv)),
  });

  const onSubmitForm = (values: CompromissoFormValues) => {
    const startsAt = values.startsAt as Date;
    const data = toDate(startsAt);
    const hora = toTime(startsAt);

    onSubmit({
      titulo: values.titulo.trim(),
      tipo: values.tipo,
      status: values.status,
      data,
      hora,
      starts_at: `${data} ${hora}:00`,
      descricao: values.descricao?.trim(),
      user_id: values.userId,
    });
  };

  return (
    <Box
      id={id}
      component="form"
      onSubmit={handleSubmit(onSubmitForm)}
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
        <Controller
          name="titulo"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              required
              disabled={disabled}
              label={t("agenda.form.titleLabel")}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <Controller
          name="userId"
          control={control}
          render={({ field, fieldState }) => {
            const selected =
              usuarios.find((u) => String(u.id) === field.value) ?? null;

            return (
              <Autocomplete
                options={usuarios}
                loading={loadingUsuarios}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  String(option.id) === String(value.id)
                }
                value={selected}
                onChange={(_, value) =>
                  field.onChange(value ? String(value.id) : "")
                }
                disabled={disabled}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("agenda.form.responsibleLabel")}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingUsuarios && <CircularProgress size={18} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            );
          }}
        />
      </Box>

      <Controller
        name="tipo"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            disabled={disabled}
            label={t("agenda.form.typeLabel")}
          >
            <MenuItem value="COMPROMISSO">
              {t("agenda.types.appointment")}
            </MenuItem>
            <MenuItem value="REUNIAO">{t("agenda.types.meeting")}</MenuItem>
            <MenuItem value="AUDIENCIA">{t("agenda.types.hearing")}</MenuItem>
            <MenuItem value="PRAZO">{t("agenda.types.deadline")}</MenuItem>
            <MenuItem value="LEMBRETE">{t("agenda.types.reminder")}</MenuItem>
          </TextField>
        )}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            disabled={disabled}
            label={t("agenda.form.statusLabel")}
          >
            <MenuItem value="PENDENTE">{t("agenda.status.pending")}</MenuItem>
            <MenuItem value="CONCLUIDO">
              {t("agenda.status.completed")}
            </MenuItem>
            <MenuItem value="CANCELADO">
              {t("agenda.status.cancelled")}
            </MenuItem>
          </TextField>
        )}
      />

      <Box sx={{ gridColumn: "1 / -1" }}>
        <Controller
          name="startsAt"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              fullWidth
              required
              type="datetime-local"
              label={t("agenda.form.dateTimeLabel")}
              value={toDateTimeInputValue(field.value)}
              disabled={disabled}
              onChange={(event) =>
                field.onChange(fromDateTimeInputValue(event.target.value))
              }
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <Controller
          name="descricao"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              multiline
              rows={4}
              fullWidth
              disabled={disabled}
              label={t("agenda.form.descriptionLabel")}
            />
          )}
        />
      </Box>
    </Box>
  );
}