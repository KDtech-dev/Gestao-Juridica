"use client";

import { Box, MenuItem, TextField } from "@mui/material";

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
          <TextField fullWidth label="Nome / Razão Social" />
        </Box>

      <TextField fullWidth label="CPF / CNPJ" />
      <TextField fullWidth label="E-mail" />
      <TextField fullWidth label="Telefone" />

      <TextField fullWidth label="Pessoa de Contato" />

      <TextField select fullWidth label="Status" defaultValue="ativo">
        <MenuItem value="ativo">Ativo</MenuItem>
        <MenuItem value="inativo">Inativo</MenuItem>
      </TextField>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField fullWidth label="Endereço Completo" />
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField multiline rows={3} fullWidth label="Observações" />
      </Box>
    </Box>
  );
}
