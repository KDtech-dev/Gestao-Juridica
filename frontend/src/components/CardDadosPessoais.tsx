"use client";

import { Box, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { clearNumber, formatCpf, formatTelefone } from "@/@core/format";
import InputBasico from "@/components/InputBasico";
import LocalizedDatePicker from "@/components/LocalizedDatePicker";
import TextField from "@mui/material/TextField";
import type { ProfileFormSchemaType } from "@/schemas/ProfileSchema";

type Props = {
  isAdvogado: boolean;
  isFuncionario: boolean;
  hideLawyerSummary?: boolean;
};

export function CardDadosPessoais({
  isAdvogado,
  isFuncionario,
  hideLawyerSummary = false,
}: Props) {
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

        {(isAdvogado || isFuncionario) && (
          <Controller
            name={
              isAdvogado
                ? "advogado.data_nascimento"
                : "funcionario.data_nascimento"
            }
            control={control}
            render={({ field, fieldState }) => (
              <LocalizedDatePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                label={t("fields.birthDate")}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        )}

        {(isAdvogado || isFuncionario) && (
          <Controller
            name={isAdvogado ? "advogado.sexo" : "funcionario.sexo"}
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                label={t("fields.gender")}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: true }}
              >
                <option value="">—</option>
                <option value="masculino">
                  {t("fields.genderOptions.masculino")}
                </option>
                <option value="feminino">
                  {t("fields.genderOptions.feminino")}
                </option>
                <option value="outro">{t("fields.genderOptions.outro")}</option>
                <option value="prefiro_nao_dizer">
                  {t("fields.genderOptions.prefiro_nao_dizer")}
                </option>
              </TextField>
            )}
          />
        )}
        {((isAdvogado && !hideLawyerSummary) ||
          (!isAdvogado && isFuncionario)) && (
          <Box sx={{ gridColumn: { md: "1 / -1" } }}>
            <InputBasico
              field={
                isAdvogado
                  ? "advogado.resumo_pessoal"
                  : "funcionario.resumo_pessoal"
              }
              label={t("fields.personalSummary")}
              placeholder={t("fields.personalSummaryPlaceholder")}
              multiline
              rows={3}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
