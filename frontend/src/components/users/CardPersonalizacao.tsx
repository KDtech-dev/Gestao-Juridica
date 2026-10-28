"use client";

import { Icon } from "@/components/AppIcon";
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { Controller, UseFormReturn } from "react-hook-form";

import { ProfileFormOutputType, ProfileFormSchemaType } from "@/schemas/ProfileSchema";

import { useThemeMode } from "@/theme/ThemeRegistry";

import { useLanguage } from "@/context/LanguageContext";
import { useTranslations } from "next-intl";

type Props = {
  form: UseFormReturn<ProfileFormSchemaType, unknown, ProfileFormOutputType>;
};

const CardPersonalizacao = ({ form }: Props) => {
  const t = useTranslations("internal.profile.customization");
  const { setThemeMode } = useThemeMode();

  const { setLanguage } = useLanguage();

  return (
    <Grid
      sx={{
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        mb: 1,
        gap: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Icon icon="mdi:palette-outline" width={18} />

        <Typography fontWeight={700}>{t("title")}</Typography>
      </Stack>

      <Typography fontSize="0.86rem" color="text.secondary">
        {t("description")}
      </Typography>

      <FormControl fullWidth>
        <InputLabel id="tema-label">{t("theme.label")}</InputLabel>

        <Controller
          name="tema"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <Select
                {...field}
                label={t("theme.label")}
                labelId="tema-label"
                onChange={(e) => {
                  const value = e.target.value as "light" | "dark" | "system";

                  field.onChange(value);

                  setThemeMode(value);
                }}
              >
                <MenuItem value="light">{t("theme.light")}</MenuItem>

                <MenuItem value="dark">{t("theme.dark")}</MenuItem>

                <MenuItem value="system">{t("theme.system")}</MenuItem>
              </Select>

              {fieldState.error && (
                <FormHelperText error>
                  {fieldState.error.message}
                </FormHelperText>
              )}
            </>
          )}
        />
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="idioma-label">{t("language.label")}</InputLabel>

        <Controller
          name="idioma"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <Select
                {...field}
                label={t("language.label")}
                labelId="idioma-label"
                onChange={(e) => {
                  const value = e.target.value as "pt" | "en" | "es";

                  field.onChange(value);

                  setLanguage(value);
                }}
              >
                <MenuItem value="pt">Português</MenuItem>

                <MenuItem value="en">English</MenuItem>

                <MenuItem value="es">Español</MenuItem>
              </Select>

              {fieldState.error && (
                <FormHelperText error>
                  {fieldState.error.message}
                </FormHelperText>
              )}
            </>
          )}
        />
      </FormControl>
    </Grid>
  );
};

export default CardPersonalizacao;
