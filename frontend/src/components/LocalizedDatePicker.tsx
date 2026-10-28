"use client";

import { useEffect, useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, isValid, parse } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { ptBR } from "date-fns/locale/pt-BR";
import { useLocale, useTranslations } from "next-intl";
import { IconButton, InputAdornment, Popover, TextField } from "@mui/material";
import type { ReactNode } from "react";
import { dateFromApi, dateToApi } from "@/@core/format";
import { Icon } from "@/components/AppIcon";

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
};

const dateLocales = { pt: ptBR, en: enUS, es } as const;

function formatDateInput(input: string, locale: "pt" | "en" | "es"): string {
  const isoDate = dateFromApi(input);
  if (/^\d{4}-\d{2}-\d{2}$/.test(input) && isoDate) {
    return format(isoDate, "P", { locale: dateLocales[locale] });
  }

  if (input.includes("/")) {
    const parts = input.split("/").slice(0, 3);
    const first = (parts[0] ?? "").replace(/\D/g, "").slice(0, 2);
    const second = (parts[1] ?? "").replace(/\D/g, "").slice(0, 2);
    const year = (parts[2] ?? "").replace(/\D/g, "").slice(0, 4);
    if (parts.length >= 3) return `${first}/${second}/${year}`;
    if (second || parts.length === 2) {
      return `${first}/${second}${second.length === 2 ? "/" : ""}`;
    }
    return `${first}/`;
  }

  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits.length === 2 ? `${digits}/` : digits;
  if (digits.length <= 4) {
    const monthOrDay = digits.slice(2);
    return `${digits.slice(0, 2)}/${monthOrDay}${monthOrDay.length === 2 ? "/" : ""}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function LocalizedDatePicker({
  value,
  onChange,
  onBlur,
  label,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: Props) {
  const locale = useLocale() as "pt" | "en" | "es";
  const t = useTranslations("internal.profile.datePicker");
  const adapterLocale = dateLocales[locale] ?? ptBR;
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);
  const [touched, setTouched] = useState(false);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!value) {
      setInputValue("");
      setInputError(false);
      return;
    }

    const date = dateFromApi(value);
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setInputValue(format(date, "P", { locale: adapterLocale }));
      setInputError(false);
    } else {
      setInputValue(value);
    }
  }, [adapterLocale, value]);

  const parseInput = (input: string): Date | null => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return dateFromApi(input);
    }

    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) return null;
    const parsed = parse(input, "P", new Date(), { locale: adapterLocale });
    return isValid(parsed) ? parsed : null;
  };

  const handleTextChange = (rawInput: string) => {
    const input = formatDateInput(rawInput, locale);
    setInputValue(input);
    if (!input.trim()) {
      setInputError(false);
      onChange("");
      return;
    }

    const date = parseInput(input);
    if (date) {
      setInputError(false);
      onChange(dateToApi(date) ?? input);
    } else {
      setInputError(touched && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input));
      onChange(input);
    }
  };

  const handleCalendarSelect = (date: Date | null) => {
    if (!date) return;
    const apiDate = dateToApi(date);
    if (apiDate) onChange(apiDate);
    setCalendarAnchor(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={adapterLocale}>
      <TextField
        fullWidth
        label={label}
        value={inputValue}
        disabled={disabled}
        required={required}
        placeholder={format(new Date(2000, 0, 1), "P", { locale: adapterLocale })}
        error={error || inputError}
        helperText={helperText || (inputError ? t("invalidInput") : undefined)}
        onChange={(event) => handleTextChange(event.target.value)}
        onBlur={() => {
          setTouched(true);
          setInputError(Boolean(inputValue.trim()) && !parseInput(inputValue));
          onBlur?.();
        }}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label={t("openCalendar")}
                title={t("openCalendar")}
                disabled={disabled}
                onClick={(event) => setCalendarAnchor(event.currentTarget)}
                edge="end"
              >
                <Icon icon="mdi:calendar-month-outline" width={20} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        open={Boolean(calendarAnchor)}
        anchorEl={calendarAnchor}
        onClose={() => setCalendarAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <DateCalendar
          value={dateFromApi(value)}
          onChange={handleCalendarSelect}
          disabled={disabled}
        />
      </Popover>
    </LocalizationProvider>
  );
}
