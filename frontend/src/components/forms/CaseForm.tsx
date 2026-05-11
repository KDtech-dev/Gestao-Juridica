"use client";

import { Box, TextField, MenuItem } from "@mui/material";

export function CaseForm() {
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
        <TextField fullWidth label="Título do Caso *" />
      </Box>

      <TextField fullWidth label="Número do Processo" />

      <TextField select fullWidth label="Cliente *" defaultValue="">
        <MenuItem value="">Selecione</MenuItem>
      </TextField>

      <TextField select fullWidth label="Área do Direito *" defaultValue="">
        <MenuItem value="">Selecione</MenuItem>
      </TextField>

      <TextField select fullWidth label="Advogado *" defaultValue="">
        <MenuItem value="">Selecione</MenuItem>
      </TextField>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField multiline rows={4} fullWidth label="Descrição" />
      </Box>
    </Box>
  );
}
