"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { ptBR } from "date-fns/locale/pt-BR";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { dateFromApi, dateToApi } from "@/@core/format";

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
};

const dateLocales = { pt: ptBR, en: enUS, es } as const;

export default function LocalizedDatePicker({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: Props) {
  const locale = useLocale();
  const adapterLocale = dateLocales[locale as keyof typeof dateLocales] ?? ptBR;

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={adapterLocale}
    >
      <DatePicker
        label={label}
        value={dateFromApi(value)}
        format="P"
        disabled={disabled}
        onChange={(date) => onChange(dateToApi(date) ?? "")}
        slotProps={{
          textField: {
            fullWidth: true,
            required,
            error,
            helperText,
          },
        }}
      />
    </LocalizationProvider>
  );
}
