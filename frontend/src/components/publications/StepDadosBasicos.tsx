"use client";

import { Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { CategoriaOption } from "@/api/categorias/types";
import { PublicacaoFormData, PublicationErrors } from "../../@core/types";
import { HtmlTextEditor } from "./HtmlTextEditor";
import InputSingleFile from "../InputSingleFile";
import InputImage from "../InputImage";
import { useTranslations } from "next-intl";

const STATUS_OPTIONS = ["rascunho", "publicado", "arquivado"] as const;

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
  data,
  errors,
  categorias,
  categoriasLoading = false,
  onChange,
}: Props) {
  const t = useTranslations("internal.publicationForm.fields");
  const selectedCategoria = categorias.find(
    (categoria) => String(categoria.id) === data.categoriaId,
  );

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label={t("title")}
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
            label={t("category")}
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
              (categoriasLoading ? t("categoriesLoading") : t("categoryHelper"))
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

        <Grid size={{ xs: 12 }}>
          <Stack spacing={0.75}>
            <Typography fontWeight={700} color="text.primary">
              {t("bannerImage")}
            </Typography>
            <InputImage
              value={data.bannerImage}
              onImageChange={(file) => onChange("bannerImage", file ?? "")}
              cropImage
              aspect={16 / 9}
              imageHeight={300}
              subBoxInput={{
                sx: {
                  borderColor: errors.bannerImage ? "error.main" : "divider",
                  bgcolor: "background.default",
                },
              }}
            />
            <Typography
              color={errors.bannerImage ? "error.main" : "text.secondary"}
              fontSize="0.78rem"
            >
              {errors.bannerImage || t("bannerImageHelper")}
            </Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t("author")}
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
            helperText={errors.status || t("statusHelper")}
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {t(`statusOptions.${status}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <HtmlTextEditor
            label={t("summary")}
            value={data.resumo}
            onChange={(value) => onChange("resumo", value)}
            error={errors.resumo}
            minRows={4}
            helperText={t("summaryCounter", { count: data.resumo.length })}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <HtmlTextEditor
            label={t("content")}
            value={data.conteudo}
            onChange={(value) => onChange("conteudo", value)}
            error={errors.conteudo}
            minRows={8}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <InputSingleFile
            multiple
            values={data.anexos}
            existingFiles={data.anexosExistentes}
            onFilesChange={(files) => onChange("anexos", files)}
            onRemoveExistingFile={(id) => {
              onChange(
                "anexosExistentes",
                data.anexosExistentes.filter((anexo) => anexo.id !== id),
              );
              onChange("anexosRemovidos", [
                ...data.anexosRemovidos,
                id,
              ]);
            }}
            tipos_aceitos={["pdf", "doc", "docx", "jpg", "jpeg", "png"]}
            maxSize={10 * 1024 * 1024}
            label={t("attachment")}
            helperText={t("attachmentHelper")}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
