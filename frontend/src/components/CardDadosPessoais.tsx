"use client";

import { Box, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { clearNumber, formatCpf, formatTelefone } from "@/@core/format";
import InputBasico from "@/components/InputBasico";
import TextField from "@mui/material/TextField";
import type { ProfileFormSchemaType } from "@/schemas/ProfileSchema";

type Props = {
  isAdvogado: boolean;
};

export function CardDadosPessoais({ isAdvogado }: Props) {
  const t = useTranslations("internal.profile");
  const { control } = useFormContext<ProfileFormSchemaType>();

  return (
    <Box>
      <Typography fontWeight={700} color="text.primary" mb={1.2}>
        {t("sections.personalInfo")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.4,
          mb: 2.3,
        }}
      >
        <InputBasico
          field="name"
          label={t("fields.fullName")}
          placeholder={t("fields.namePlaceholder")}
          sx={{ mt: "1.5em" }}
        />

        <InputBasico
          field="email"
          label={t("fields.professionalEmail")}
          placeholder={t("fields.emailPlaceholder")}
          sx={{ mt: "1.5em" }}
        />

        <Controller
          name={isAdvogado ? "advogado.celular" : "funcionario.celular"}
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label={t("fields.phone")}
              placeholder="(00) 00000-0000"
              value={formatTelefone(field.value || "")}
              onChange={(e) => field.onChange(clearNumber(e.target.value))}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          )}
        />

        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <TextField
              label={t("fields.cpf")}
              placeholder="000.000.000-00"
              value={formatCpf(field.value || "")}
              onChange={(e) => field.onChange(clearNumber(e.target.value))}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled
            />
          )}
        />
      </Box>
    </Box>
  );
}