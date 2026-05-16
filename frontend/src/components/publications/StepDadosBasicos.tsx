"use client";

import { Box, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { CategoriaOption } from "@/api/categorias/types";
import { PublicacaoFormData, PublicationErrors } from "./types";
import { HtmlTextEditor } from "./HtmlTextEditor";
import InputSingleFile from "../InputSingleFile";

const STATUS_OPTIONS = [
  { value: "rascunho", label: "Rascunho" },
  { value: "publicado", label: "Publicado" },
  { value: "arquivado", label: "Arquivado" },
] as const;

type Props = {
  isEn?: boolean;
  data: PublicacaoFormData;
  errors: PublicationErrors;
  categorias: CategoriaOption[];
  categoriasLoading?: boolean;
  onChange: <K extends keyof PublicacaoFormData>(
    field: K,
    value: PublicacaoFormData[K],
  ) => void;
};

export function StepDadosBasicos({
  isEn = false,
  data,
  errors,
  categorias,
  categoriasLoading = false,
  onChange,
}: Props) {
  const selectedCategoria = categorias.find(
    (categoria) => String(categoria.id) === data.categoriaId,
  );

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
            label={isEn ? "Category" : "Categoria"}
            value={data.categoriaId}
            onChange={(event) => {
              const categoriaId = event.target.value;
              const categoria = categorias.find(
                (item) => String(item.id) === categoriaId,
              );

              onChange("categoriaId", categoriaId);
              onChange("categoria", categoria?.nome ?? "");
            }}
            error={Boolean(errors.categoriaId || errors.categoria)}
            helperText={
              errors.categoriaId ||
              errors.categoria ||
              selectedCategoria?.descricao ||
              (categoriasLoading
                ? "Carregando categorias..."
                : "Categoria vinculada ao cadastro do backend.")
            }
            disabled={categoriasLoading}
          >
            {categorias.map((categoria) => (
              <MenuItem key={categoria.id} value={String(categoria.id)}>
                {categoria.nome}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={isEn ? "Banner image URL" : "URL da imagem do banner"}
            value={data.bannerImage}
            onChange={(event) => onChange("bannerImage", event.target.value)}
            error={Boolean(errors.bannerImage)}
            helperText={
              errors.bannerImage ||
              "Use uma URL pública para a imagem aparecer nos posts."
            }
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              minHeight: 220,
              border: "1px solid",
              borderColor: errors.bannerImage ? "error.main" : "divider",
              borderRadius: 2,
              bgcolor: "background.default",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {data.bannerImage ? (
              <Box
                component="img"
                src={data.bannerImage}
                alt={data.titulo || "Prévia do banner"}
                sx={{
                  display: "block",
                  width: "100%",
                  height: { xs: 220, md: 300 },
                  objectFit: "cover",
                }}
              />
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: { xs: 220, md: 300 }, px: 2 }}
              >
                <Typography fontWeight={700} color="text.primary">
                  Prévia do banner
                </Typography>
                <Typography color="text.secondary" fontSize="0.9rem">
                  A imagem será exibida aqui ao informar uma URL válida.
                </Typography>
              </Stack>
            )}
          </Box>
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
              onChange(
                "status",
                event.target.value as PublicacaoFormData["status"],
              )
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

        <Grid size={{ xs: 12 }}>
          <InputSingleFile
            value={data.anexos[0]}
            onFileChange={(file) => onChange("anexos", file ? [file] : [])}
            tipos_aceitos={["pdf", "doc", "docx", "jpg", "jpeg", "png"]}
            maxSize={10 * 1024 * 1024}
            label={isEn ? "Attachment" : "Anexo da publicação"}
            helperText="PDF, DOC, DOCX, JPG ou PNG até 10 MB."
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
