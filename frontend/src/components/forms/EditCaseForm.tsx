"use client";

import { Box, MenuItem, TextField, InputAdornment } from "@mui/material";
import { Icon } from "@/components/AppIcon";

export function EditCaseForm() {
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
        <TextField
          fullWidth
          label="Título do Caso *"
          placeholder="Ex: Ação Trabalhista - Empresa X"
        />
      </Box>

      <TextField
        fullWidth
        label="Número do Processo"
        placeholder="0000000-00.0000.0.00.0000"
      />

      <TextField select fullWidth label="Cliente *" defaultValue="">
        <MenuItem value="">Selecione um cliente</MenuItem>
      </TextField>

      <TextField select fullWidth label="Área do Direito *" defaultValue="">
        <MenuItem value="">Selecione uma área</MenuItem>
      </TextField>

      <TextField
        select
        fullWidth
        label="Advogado Responsável *"
        defaultValue=""
      >
        <MenuItem value="">Selecione um advogado</MenuItem>
      </TextField>

      <TextField select fullWidth label="Status *" defaultValue="Em Andamento">
        <MenuItem value="Em Andamento">Em Andamento</MenuItem>
        <MenuItem value="Pendente">Pendente</MenuItem>
        <MenuItem value="Concluído">Concluído</MenuItem>
      </TextField>

      <TextField
        fullWidth
        label="Data de Abertura *"
        placeholder="dd / mm / aaaa"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Icon icon="mdi:calendar-outline" width={20} />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          label="Descrição do Caso"
          placeholder="Descreva os detalhes e objetivos do caso..."
        />
      </Box>
    </Box>
  );
}

export default EditCaseForm;
