"use client";

import {
  Box,
  FormControl,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import InputBasico from "@/components/InputBasico";
import type { ProfileFormSchemaType } from "@/schemas/ProfileSchema";
import type { CategoriaType, UserType } from "@/@core/types";
import { getCategorias } from "@/api/ApiCategorias";
import { formatToastErrorMessage, toast } from "@/utils/toast";

type Props = {
  isAdvogado: boolean;
  profileUser: UserType | null;
};

export function CardDadosProfissionais({ isAdvogado }: Props) {
  const t = useTranslations("internal.profile");
  const { control } = useFormContext<ProfileFormSchemaType>();
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    if (!isAdvogado) return;
    const loadCategorias = async () => {
      try {
        const { data } = await getCategorias();
        setCategorias(data);
      } catch (err) {
        toast.error(
          formatToastErrorMessage(err, t("toast.loadCategoriesError")),
        );
      } finally {
        setLoadingCategorias(false);
      }
    };
    loadCategorias();
  }, [isAdvogado, t]);
  if (!isAdvogado) return null;

  return (
    <Box sx={{ display: "grid", gap: 1.4 }}>
      <Typography fontWeight={700} color="text.primary" mb={1.2}>
        {t("sections.professionalData")}
      </Typography>

      {isAdvogado && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1.4,
            }}
          >
            <InputBasico
              field="advogado.oab_numero"
              label={t("fields.oabNumber")}
              placeholder={t("fields.oabNumberPlaceholder")}
            />
            <InputBasico field="advogado.oab_uf" label="UF OAB" maxLength={2} />
          </Box>

          <FormControl fullWidth>
            <Controller
              name="advogado.categorias"
              control={control}
              render={({ field }) => {
                const selectedIds: (string | number)[] = Array.isArray(
                  field.value,
                )
                  ? field.value
                  : [];
                const selectedCategorias = categorias.filter((c) =>
                  selectedIds.includes(c.id),
                );

                return (
                  <Autocomplete
                    multiple
                    loading={loadingCategorias}
                    options={categorias}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.nome
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id ===
                      (typeof value === "string" ? value : value.id)
                    }
                    value={selectedCategorias}
                    onChange={(_, value) => {
                      const ids = value.map((c) =>
                        typeof c === "string" ? c : c.id,
                      );
                      field.onChange(ids);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("fields.specialties")}
                        placeholder={
                          selectedCategorias.length
                            ? ""
                            : t("fields.specialtiesPlaceholder")
                        }
                        error={false}
                        helperText={undefined}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCategorias && (
                                <CircularProgress size={18} />
                              )}
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
          </FormControl>
        </>
      )}
    </Box>
  );
}
