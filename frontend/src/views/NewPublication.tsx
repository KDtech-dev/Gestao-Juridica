"use client";

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import type {
  CategoriaType,
  ExistingFile,
  PublicacaoType,
} from "@/@core/types";
import { useAuth } from "@/hooks/useAuth";
import {
  getPublicacaoById,
  postPublicacao,
  updatePublicacao,
} from "@/api/apiPublicacoes";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/AppIcon";
import InputImage from "@/components/InputImage";
import InputSingleFile from "@/components/InputSingleFile";
import { HtmlTextEditor } from "@/components/publications/HtmlTextEditor";
import {
  CreatePublicacaoPayload,
  createPublicacaoSchema,
  STATUS_OPTIONS,
} from "@/schemas/PublicationSchema";
import { categoriaNomeParaChave } from "@/constants/categorias";
import { extractIdFromSlug, storageUrl } from "@/@core/format";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCategorias } from "@/api/ApiCategorias";
import { getApiErrorMessage } from "@/configs/ApiError";
import { toast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import InputBasico from "@/components/InputBasico";

type ViewMode = "create" | "edit";

type Props = {
  mode: ViewMode;
  editId?: string;
};

export default function PublicacaoFormView({ mode, editId }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const theme = useTheme();
  const t = useTranslations("internal.publicationForm");
  const tv = useTranslations("validation");
  const tPracticeAreas = useTranslations("internal.profile.practiceAreas");

  const isCreate = mode === "create";

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [editItem, setEditItem] = useState<PublicacaoType>();
  const [anexosExistentes, setAnexosExistentes] = useState<ExistingFile[]>([]);
  const [anexosRemovidos, setAnexosRemovidos] = useState<string[]>([]);
  const methods = useForm<CreatePublicacaoPayload>({
    resolver: zodResolver(createPublicacaoSchema(tv)),
    defaultValues: {
      titulo: "",
      categoria_id: "",
      imagem_caminho: "",
      imagem: null,
      autor: user?.name ?? "",
      resumo: "",
      conteudo: "",
      status: "rascunho",
      publicado_em: null,
      anexos: [],
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const {data} = await getCategorias();
        setCategorias(data);
      } catch {
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    loadCategorias();
  }, []);
  useEffect(() => {
    if (isCreate || !editId) {
      setLoading(false);
      return;
    }

    const id = extractIdFromSlug(editId) ?? editId;

    const loadPublicacao = async () => {
      try {
        const { data: publicacao } = await getPublicacaoById(id);
        reset({
          titulo: publicacao.titulo ?? "",
          categoria_id: String(publicacao.categoria_id ?? ""),
          imagem_caminho: storageUrl(publicacao.imagem_caminho) ?? "", // 👈
          imagem: null,
          autor: publicacao.autor ?? "",
          resumo: publicacao.resumo ?? "",
          conteudo: publicacao.conteudo ?? "",
          status: publicacao.status ?? "rascunho",
          publicado_em: publicacao.publicado_em ?? null,
          anexos: [],
        });

        setEditItem(publicacao);
        setAnexosExistentes(
          (publicacao.anexos ?? []).map((a) => ({
            id: String(a.id),
            nome: a.nome_arquivo ?? "",
            viewUrl: storageUrl(a.arquivo) ?? "", // 👈 também aqui
          })),
        );
      } catch {
        toast.error(t("errors.load"));
      } finally {
        setLoading(false);
      }
    };

    loadPublicacao();
  }, [isCreate, editId, reset, t]);

  const titleMap: Record<ViewMode, string> = {
    create: t("title.new"),
    edit: t("title.edit"),
  };

  const onSubmit = async (values: CreatePublicacaoPayload) => {
    setSaving(true);
    try {
      const body = new FormData();
      body.append("titulo", values.titulo.trim());
      body.append("autor", values.autor.trim());
      body.append("status", values.status);
      if (values.categoria_id) body.append("categoria_id", values.categoria_id);
      if (values.resumo) body.append("resumo", values.resumo.trim());
      if (values.conteudo) body.append("conteudo", values.conteudo.trim());
      if (values.publicado_em) body.append("publicado_em", values.publicado_em);
      if (values.imagem instanceof File) {
        body.append("imagem", values.imagem);
      } else if (values.imagem_caminho) {
        body.append("imagem_caminho", values.imagem_caminho);
      }
      (values.anexos ?? []).forEach((file) => {
        if (file instanceof File) body.append("anexos[]", file);
      });
      anexosRemovidos.forEach((id) => body.append("anexos_remover[]", id));

      if (!isCreate && editItem?.id) {
        await updatePublicacao(editItem.id, body);
      } else {
        await postPublicacao(body);
      }

      toast.success(
        values.status === "publicado"
          ? t("toast.savedPublished")
          : t("toast.saved"),
      );
      router.push("/publicacoes?modo=interna");
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t("errors.save"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="publicacoes" />
      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3.5}>
            <IconButton
              onClick={() => router.push("/publicacoes?modo=interna")}
            >
              <Icon icon="mdi:arrow-left" width={22} />
            </IconButton>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: "text.primary" }}
            >
              {titleMap[mode]}
            </Typography>
          </Stack>

          <FormProvider {...methods}>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                }}
              >
                <Typography fontWeight={700} mb={2}>
                  {t("steps.data")}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <InputBasico
                      field="titulo"
                      label={t("fields.title")}
                      maxLength={255}
                    />
                  </Box>

                  <Controller
                    name="categoria_id"
                    control={control}
                    render={({ field, fieldState }) => {
                      const selectedCategoria =
                        (categorias ?? []).find(
                          (c) => String(c.id) === field.value,
                        ) ?? null;

                      return (
                        <Autocomplete
                          loading={loadingCategorias}
                          options={categorias ?? []}
                          getOptionLabel={(option) => {
                            const chave = categoriaNomeParaChave[option.nome];
                            return chave ? tPracticeAreas(chave) : option.nome;
                          }}
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          value={selectedCategoria}
                          onChange={(_, value) =>
                            field.onChange(value ? String(value.id) : "")
                          }
                          disabled={loadingCategorias}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t("fields.category")}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loadingCategorias && (
                                      <CircularProgress size={18} />
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      );
                    }}
                  />
                  <InputBasico
                    field="autor"
                    label={t("fields.author")}
                    maxLength={255}
                  />

                  <InputBasico field="status" label="Status" select>
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {t(`fields.statusOptions.${status}`)}
                      </MenuItem>
                    ))}
                  </InputBasico>

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Typography fontWeight={700} color="text.primary" mb={1}>
                      {t("fields.bannerImage")}
                    </Typography>
                    <Controller
                      name="imagem"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <InputImage
                            value={
                              field.value ??
                              watch("imagem_caminho") ??
                              undefined
                            }
                            onImageChange={(file) =>
                              field.onChange(file ?? null)
                            }
                          />
                          {fieldState.error && (
                            <Typography color="error" variant="caption">
                              {fieldState.error.message}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </Box>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                }}
              >
                <Typography fontWeight={700} mb={2}>
                  {t("fields.content")}
                </Typography>
                <Stack spacing={2}>
                  <Controller
                    name="resumo"
                    control={control}
                    render={({ field, fieldState }) => (
                      <HtmlTextEditor
                        label={t("fields.summary")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        minRows={4}
                        helperText={t("fields.summaryCounter", {
                          count: field.value?.length ?? 0,
                        })}
                      />
                    )}
                  />
                  <Controller
                    name="conteudo"
                    control={control}
                    render={({ field, fieldState }) => (
                      <HtmlTextEditor
                        label={t("fields.content")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        minRows={8}
                      />
                    )}
                  />
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                }}
              >
                <Typography fontWeight={700} mb={2}>
                  {t("review.attachments")}
                </Typography>
                <Controller
                  name="anexos"
                  control={control}
                  render={({ field }) => (
                    <InputSingleFile
                      multiple
                      values={field.value ?? []}
                      onFilesChange={field.onChange}
                      existingFiles={anexosExistentes}
                      onRemoveExistingFile={(id) => {
                        setAnexosExistentes((prev) =>
                          prev.filter((f) => f.id !== id),
                        );
                        setAnexosRemovidos((prev) => [...prev, id]);
                      }}
                      tipos_aceitos={[
                        "pdf",
                        "doc",
                        "docx",
                        "jpg",
                        "jpeg",
                        "png",
                      ]}
                      maxSize={10 * 1024 * 1024}
                      label={t("fields.attachment")}
                      helperText={t("fields.attachmentHelper")}
                    />
                  )}
                />
              </Paper>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/publicacoes?modo=interna")}
                >
                  {t("actions.cancel")}
                </Button>
                <Button
                  variant="contained"
                  disabled={saving || (!isCreate && !isDirty)}
                  onClick={() => handleSubmit(onSubmit)()}
                >
                  {saving
                    ? t("actions.saving")
                    : isCreate
                      ? t("actions.savePublication")
                      : t("actions.saveChanges")}
                </Button>
              </Stack>
            </Box>
          </FormProvider>
        </Container>
      </Box>
    </Box>
  );
}
