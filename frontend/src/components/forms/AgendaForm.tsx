"use client";

import { Box, TextField, Button } from "@mui/material";
import { useState } from "react";

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
        <TextField fullWidth label="Título *" />
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

      <TextField fullWidth label="Data *" />
      <TextField fullWidth label="Horário *" />

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField multiline rows={3} fullWidth label="Descrição" />
      </Box>
    </Box>
  );
}
