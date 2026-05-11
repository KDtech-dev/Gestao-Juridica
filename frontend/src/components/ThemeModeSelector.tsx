"use client";

import { MenuItem, Select, Stack, Typography } from "@mui/material";
import { ThemeMode } from "@/theme/ThemeRegistry";

type Props = {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
};

export function ThemeModeSelector({ value, onChange }: Props) {
  const handleModeChange = (mode: ThemeMode) => onChange(mode);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary" fontSize="0.9rem">
        Tema visual
      </Typography>
      <Select
        value={value}
        size="small"
        sx={{
          minWidth: 190,
          borderRadius: "10px",
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
          },
        }}
        onChange={(event) => handleModeChange(event.target.value as ThemeMode)}
      >
        <MenuItem value="claro">Claro</MenuItem>
        <MenuItem value="escuro">Escuro</MenuItem>
        <MenuItem value="daltonismo">Daltonismo</MenuItem>
        <MenuItem value="acessibilidade">Acessibilidade</MenuItem>
      </Select>
    </Stack>
  );
}
