"use client";

import { Autocomplete, Grid, MenuItem, Stack, TextField } from "@mui/material";
import { cases, listTrackedClients } from "@/data/cases";
import { BasicErrors, PublicacaoFormData, TipoPublicacao } from "./types";

type Props = {
  isEn?: boolean;
  data: PublicacaoFormData;
  errors: BasicErrors;
  onChange: <K extends keyof PublicacaoFormData>(
    field: K,
    value: PublicacaoFormData[K],
  ) => void;
};

const tipos: TipoPublicacao[] = [
  "Atualização de Caso",
  "Comunicado ao Cliente",
  "Notícia Jurídica",
];

export function StepDadosBasicos({
  isEn = false,
  data,
  errors,
  onChange,
}: Props) {
  const clients = listTrackedClients();
  const processosDoCliente = cases
    .filter((item) => (data.cliente ? item.clientName === data.cliente : true))
    .map((item) => item.processNumber);

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label={isEn ? "Title" : "Título"}
            value={data.titulo}
            onChange={(event) => onChange("titulo", event.target.value)}
            error={Boolean(errors.titulo)}
            helperText={errors.titulo}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            select
            fullWidth
            label={isEn ? "Type" : "Tipo"}
            value={data.tipo}
            onChange={(event) =>
              onChange("tipo", event.target.value as TipoPublicacao)
            }
            error={Boolean(errors.tipo)}
            helperText={errors.tipo}
          >
            {tipos.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={clients.map((client) => client.name)}
            value={data.cliente || null}
            onChange={(_, value) => {
              onChange("cliente", value || "");
              onChange("processo", "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isEn ? "Client" : "Cliente"}
                error={Boolean(errors.cliente)}
                helperText={errors.cliente}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={processosDoCliente}
            value={data.processo || null}
            onChange={(_, value) => onChange("processo", value || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isEn ? "Process" : "Processo"}
                error={Boolean(errors.processo)}
                helperText={errors.processo}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            type="date"
            label={isEn ? "Date" : "Data"}
            slotProps={{ inputLabel: { shrink: true } }}
            value={data.data}
            onChange={(event) => onChange("data", event.target.value)}
            error={Boolean(errors.data)}
            helperText={errors.data}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label={isEn ? "Responsible" : "Responsável"}
            value={data.responsavel}
            onChange={(event) => onChange("responsavel", event.target.value)}
            error={Boolean(errors.responsavel)}
            helperText={errors.responsavel}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
