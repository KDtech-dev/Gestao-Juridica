"use client";

import { Grid, MenuItem, Stack, TextField } from "@mui/material";
import { PublicacaoFormData, PublicationErrors } from "./types";
import { HtmlTextEditor } from "./HtmlTextEditor";

const STATUS_OPTIONS = [
  { value: "rascunho", label: "Rascunho" },
  { value: "publicado", label: "Publicado" },
  { value: "arquivado", label: "Arquivado" },
] as const;

type Props = {
  isEn?: boolean;
  data: PublicacaoFormData;
  errors: PublicationErrors;
  onChange: <K extends keyof PublicacaoFormData>(
    field: K,
    value: PublicacaoFormData[K],
  ) => void;
};

export function StepDadosBasicos({
  isEn = false,
  data,
  errors,
  onChange,
}: Props) {
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
            fullWidth
            label={isEn ? "Category" : "Categoria"}
            value={data.categoria}
            onChange={(event) => onChange("categoria", event.target.value)}
            error={Boolean(errors.categoria)}
            helperText={errors.categoria}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={isEn ? "Banner image URL" : "Imagem do banner"}
            value={data.bannerImage}
            onChange={(event) => onChange("bannerImage", event.target.value)}
            error={Boolean(errors.bannerImage)}
            helperText={errors.bannerImage || "Use uma URL completa da imagem."}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={isEn ? "Author name" : "Nome do autor"}
            value={data.autor}
            onChange={(event) => onChange("autor", event.target.value)}
            error={Boolean(errors.autor)}
            helperText={errors.autor}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            select
            fullWidth
            label="Status"
            value={data.status}
            onChange={(event) =>
              onChange("status", event.target.value as PublicacaoFormData["status"])
            }
            error={Boolean(errors.status)}
            helperText={
              errors.status ||
              "Somente publicações com status publicado aparecem em posts."
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <HtmlTextEditor
            label={isEn ? "Summary" : "Resumo"}
            value={data.resumo}
            onChange={(value) => onChange("resumo", value)}
            error={errors.resumo}
            minRows={4}
            helperText={`${data.resumo.length}/2000 caracteres`}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <HtmlTextEditor
            label={isEn ? "Publication text" : "Texto da publicação"}
            value={data.conteudo}
            onChange={(value) => onChange("conteudo", value)}
            error={errors.conteudo}
            minRows={8}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
