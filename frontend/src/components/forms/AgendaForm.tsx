"use client";

import {
  Box,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { Icon } from "@iconify/react";

export function AppointmentForm() {
  const [type, setType] = useState<"presencial" | "video">("presencial");

  return (
    <Box
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
        <TextField fullWidth label="Título do Compromisso *" />
      </Box>

      <TextField fullWidth label="Cliente *" />
      <TextField fullWidth label="Local *" />

      <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1 }}>
        <Button
          variant={type === "presencial" ? "contained" : "outlined"}
          onClick={() => setType("presencial")}
        >
          Presencial
        </Button>

        <Button
          variant={type === "video" ? "contained" : "outlined"}
          onClick={() => setType("video")}
        >
          Videoconferência
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Data *"
        placeholder="dd / mm / aaaa"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Icon icon="mdi:calendar-outline" width={20} />
            </InputAdornment>
          ),
        }}
      />

      <TextField fullWidth label="Horário *" placeholder="00:00" />

      <TextField select fullWidth label="Duração *" defaultValue="60">
        <MenuItem value="15">15 minutos</MenuItem>
        <MenuItem value="30">30 minutos</MenuItem>
        <MenuItem value="60">1 hora</MenuItem>
      </TextField>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField multiline rows={4} fullWidth label="Descrição/Pauta" />
      </Box>
    </Box>
  );
}
