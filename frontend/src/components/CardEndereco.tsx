"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import InputBasico from "@/components/InputBasico";
import { useFormContext } from "react-hook-form";
import type { ProfileFormSchemaType } from "@/schemas/ProfileSchema";

type Props = {
  isAdvogado: boolean;
  isFuncionario: boolean;
};

export function CardEndereco({ isAdvogado, isFuncionario }: Props) {
  const t = useTranslations("internal.profile");
  const { setValue } = useFormContext<ProfileFormSchemaType>();
  const [loadingCep, setLoadingCep] = useState(false);

  if (!isAdvogado && !isFuncionario) return null;

  const handleCepBlur = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) return;

      setValue("endereco.logradouro", data.logradouro ?? "");
      setValue("endereco.bairro", data.bairro ?? "");
      setValue("endereco.cidade", data.localidade ?? "");
      setValue("endereco.uf", data.uf ?? "");
    } catch {
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 1.4, mt: 2 }}>
      <Typography fontWeight={700} color="text.primary" mb={1.2}>
        {t("sections.address")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 1.4,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <InputBasico
            field="endereco.cep"
            label={t("fields.cep")}
            placeholder="00000000"
            inputProps={{ maxLength: 8 }}
            onBlur={(e) => handleCepBlur(e.target.value)}
            InputProps={{
              endAdornment: loadingCep ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : undefined,
            }}
          />
        </Box>

        <InputBasico
          field="endereco.logradouro"
          label={t("fields.logradouro")}
          placeholder={t("fields.logradouroPlaceholder")}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr 1fr" },
          gap: 1.4,
        }}
      >
        <InputBasico
          field="endereco.numero"
          label={t("fields.numero")}
          placeholder="Nº"
        />
        <InputBasico
          field="endereco.bairro"
          label={t("fields.bairro")}
          placeholder={t("fields.bairrPlaceholder")}
        />
        <InputBasico field="endereco.uf" label="UF" maxLength={2} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 1.4,
        }}
      >
        <InputBasico
          field="endereco.cidade"
          label={t("fields.cidade")}
          placeholder={t("fields.cidadePlaceholder")}
        />
        <InputBasico
          field="endereco.complemento"
          label={t("fields.complemento")}
          placeholder={t("fields.complementoPlaceholder")}
        />
      </Box>
    </Box>
  );
}
