"use client";

import { Box, TextField } from "@mui/material";

export function ClientForm() {
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
        <TextField fullWidth label="Nome / Razão Social *" />
      </Box>

      <TextField fullWidth label="CPF / CNPJ *" />
      <TextField fullWidth label="E-mail *" />
      <TextField fullWidth label="Telefone *" />

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField fullWidth label="Endereço" />
      </Box>
    </Box>
  );
}
