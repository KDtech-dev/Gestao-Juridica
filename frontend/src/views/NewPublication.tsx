"use client";

import {
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
import { useEffect, useMemo, useRef, useState } from "react";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import {
  CategoriaType,
  PublicacaoFormData,
  PublicationErrors,
} from "@/@core/types";
import { toast } from "@/utils/toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  buildPublicacaoFromForm,
  getStoredPublicacoes,
  saveStoredPublicacao,
} from "@/utils/publicationsStorage";
import {
  atualizarPublicacaoClient,
  buscarPublicacaoClient,
  criarPublicacaoClient,
} from "@/api/publicacoes/apiPublicacoesClient";
import { getApiErrorMessage } from "@/configs/ApiError";
import type {
  PublicacaoItem,
  PublicacaoPayload,
} from "@/api/publicacoes/types";
import { useTranslations } from "next-intl";
import { getCategorias } from "@/api/ApiCategorias";
import { Icon } from "@/components/AppIcon";
import InputImage from "@/components/InputImage";
import InputSingleFile from "@/components/InputSingleFile";
import { HtmlTextEditor } from "@/components/publications/HtmlTextEditor";
import { STATUS_OPTIONS } from "@/schemas/PublicationSchema";

const initialForm: PublicacaoFormData = {
  titulo: "",
  categoria: "",
  categoriaId: "",
  bannerImage: "",
  autor: "",
  resumo: "",
  conteudo: "",
  status: "publicado",
  anexos: [],
  anexosExistentes: [],
  anexosRemovidos: [],
};

function getTextValue(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value && typeof value === "object" && "nome" in value) {
    const nome = (value as { nome?: unknown }).nome;

    return typeof nome === "string" ? nome : fallback;
  }

  return fallback;
}

function getBannerImageValue(value: unknown) {
  return isFile(value) || typeof value === "string" ? value : "";
}

function getFormFiles(value: unknown) {
  return Array.isArray(value)
    ? value.filter((file): file is File => isFile(file))
    : [];
}

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function getStatusValue(value: unknown): PublicacaoFormData["status"] {
  return value === "rascunho" || value === "publicado" || value === "arquivado"
    ? value
    : "publicado";
}

function getFormSnapshot(form: PublicacaoFormData) {
  return JSON.stringify({
    ...form,
    bannerImage: isFile(form.bannerImage)
      ? {
          name: form.bannerImage.name,
          size: form.bannerImage.size,
          type: form.bannerImage.type,
          lastModified: form.bannerImage.lastModified,
        }
      : form.bannerImage,
    anexos: getFormFiles(form.anexos).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    })),
    anexosExistentes: form.anexosExistentes,
    anexosRemovidos: form.anexosRemovidos,
  });
}

function isBackendPublicationId(id?: string) {
  return Boolean(
    id?.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ),
  );
}

type PublicacaoRequestPayload = PublicacaoPayload & {
  anexos_remover?: string[];
};

function buildPublicacaoPayload(
  form: PublicacaoFormData,
): PublicacaoRequestPayload {
  const bannerImage = getBannerImageValue(form.bannerImage);
  const anexosRemover = form.anexosRemovidos.filter(Boolean);

  return {
    titulo: getTextValue(form.titulo).trim(),
    categoria_id: getTextValue(form.categoriaId).trim() || null,
    imagem_caminho:
      typeof bannerImage === "string" ? bannerImage.trim() || null : null,
    autor: getTextValue(form.autor).trim(),
    resumo: getTextValue(form.resumo).trim() || null,
    conteudo: getTextValue(form.conteudo).trim() || null,
    status: getStatusValue(form.status),
    ...(anexosRemover.length > 0 ? { anexos_remover: anexosRemover } : {}),
  };
}

function buildPublicacaoRequestBody(form: PublicacaoFormData) {
  const payload = buildPublicacaoPayload(form);

  const anexos = getFormFiles(form.anexos);
  const anexosRemover = form.anexosRemovidos.filter(Boolean);

  if (
    anexos.length === 0 &&
    anexosRemover.length === 0 &&
    !isFile(form.bannerImage)
  ) {
    return payload;
  }

  const body = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key !== "anexos_remover" && value !== null && value !== undefined) {
      body.append(key, String(value));
    }
  });

  anexos.forEach((file) => {
    body.append("anexos[]", file);
  });

  if (isFile(form.bannerImage)) {
    body.append("imagem", form.bannerImage);
  }

  anexosRemover.forEach((id) => {
    body.append("anexos_remover[]", id);
  });

  return body;
}

type Props = {
  editSlug?: string;
};

export default function NewPublicationView({ editSlug }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const t = useTranslations("internal.publicationForm");
  const categoriesErrorMessage = t("errors.categories");
  const [fetchedEditItem, setFetchedEditItem] = useState<
    PublicacaoItem | undefined
  >();
  const localEditItem = useMemo(() => {
    if (!editSlug) return undefined;

    return getStoredPublicacoes().find(
      (item) => item.slug === editSlug || item.id === editSlug,
    );
  }, [editSlug]);
  const editItem = fetchedEditItem ?? localEditItem;
  const isEditMode = Boolean(editItem);
  const initialResolvedForm = useMemo<PublicacaoFormData>(() => {
    if (!editItem) {
      return {
        ...initialForm,
        autor: user?.name ?? "",
      };
    }
    return {
      titulo: getTextValue(editItem.titulo),
      categoria: getTextValue(editItem.categoria),
      categoriaId:
        editItem.categoriaId !== null && editItem.categoriaId !== undefined
          ? String(editItem.categoriaId)
          : "",
      bannerImage: getBannerImageValue(editItem.bannerImage),
      autor: getTextValue(editItem.autor),
      resumo: getTextValue(editItem.resumo),
      conteudo: getTextValue(editItem.conteudoHtml),
      status: getStatusValue(editItem.status),
      anexos: [],
      anexosExistentes: editItem.anexos,
      anexosRemovidos: [],
    };
  }, [editItem, user?.name]);
  const [form, setForm] = useState<PublicacaoFormData>(initialResolvedForm);
  const [initialSnapshot, setInitialSnapshot] = useState(() =>
    getFormSnapshot(initialResolvedForm),
  );
  const [errors, setErrors] = useState<PublicationErrors>({});
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [savingDraftOnLeave, setSavingDraftOnLeave] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const allowNavigationRef = useRef(false);

  const hasUnsavedChanges = useMemo(
    () => getFormSnapshot(form) !== initialSnapshot,
    [form, initialSnapshot],
  );

  const selectedCategoria = useMemo(
    () =>
      categorias.find((categoria) => String(categoria.id) === form.categoriaId),
    [categorias, form.categoriaId],
  );

  useEffect(() => {
    if (!editSlug) return;

    const id =
      editSlug.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )?.[0] ?? editSlug;
    let active = true;

    buscarPublicacaoClient(id)
      .then((publicacao) => {
        if (active) {
          setFetchedEditItem(publicacao);
        }
      })
      .catch(() => {
        if (active) {
          setFetchedEditItem(undefined);
        }
      });

    return () => {
      active = false;
    };
  }, [editSlug]);

  useEffect(() => {
    setForm(initialResolvedForm);
    setInitialSnapshot(getFormSnapshot(initialResolvedForm));
  }, [initialResolvedForm]);

  useEffect(() => {
    let active = true;

    getCategorias()
      .then((items) => {
        console.log("categorias recebidas:", items); // undefined aqui?
        if (active) setCategorias(items);
      })
      .catch((error) => {
        if (active) {
          toast.error(getApiErrorMessage(error) || categoriesErrorMessage);
        }
      })
      .finally(() => {
        if (active) {
          setCategoriasLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [categoriesErrorMessage]);

  useEffect(() => {
    const categoriaAtual = getTextValue(form.categoria);

    if (!categoriaAtual || form.categoriaId || categorias.length === 0) return;

    const matchedCategoria = categorias.find(
      (categoria) =>
        categoria.nome.trim().toLowerCase() ===
        categoriaAtual.trim().toLowerCase(),
    );

    if (matchedCategoria) {
      setForm((prev) => ({
        ...prev,
        categoriaId: String(matchedCategoria.id),
      }));
    }
  }, [categorias, form.categoria, form.categoriaId]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const currentHref = window.location.href;

    const requestLeave = (href: string) => {
      if (allowNavigationRef.current || !hasUnsavedChanges) return false;

      setPendingHref(href);
      setLeaveDialogOpen(true);
      return true;
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) return;
      if (nextUrl.href === currentUrl.href) return;

      if (requestLeave(nextUrl.href)) {
        event.preventDefault();
      }
    };

    const handlePopState = () => {
      if (allowNavigationRef.current || !hasUnsavedChanges) return;

      const nextHref = window.location.href;
      window.history.pushState(null, "", currentHref);
      requestLeave(nextHref);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleChange = <K extends keyof PublicacaoFormData>(
    field: K,
    value: PublicacaoFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: PublicationErrors = {};
    const titulo = getTextValue(form.titulo).trim();
    const categoriaId = getTextValue(form.categoriaId).trim();
    const autor = getTextValue(form.autor).trim();
    const resumo = getTextValue(form.resumo).trim();
    const conteudo = getTextValue(form.conteudo).trim();

    if (!titulo) nextErrors.titulo = t("validation.titulo");
    if (!categoriaId) nextErrors.categoriaId = t("validation.categoriaId");
    if (!form.bannerImage) nextErrors.bannerImage = t("validation.bannerImage");
    if (!autor) nextErrors.autor = t("validation.autor");
    if (!resumo) nextErrors.resumo = t("validation.resumo");
    if (!conteudo) nextErrors.conteudo = t("validation.conteudo");
    if (!["rascunho", "publicado", "arquivado"].includes(form.status)) {
      nextErrors.status = t("validation.status");
    }

    if (resumo.length > 2000) nextErrors.resumo = t("validation.resumo");

    if (Object.keys(nextErrors).length === 0) {
      setErrors({});
      return true;
    }

    setErrors(nextErrors);
    toast.error(t("validation.reviewFields"));

    return false;
  };

  const publish = async () => {
    if (submitting) return;

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPublicacaoRequestBody(form);
      const publicacao =
        isEditMode && isBackendPublicationId(editItem?.id)
          ? await atualizarPublicacaoClient(editItem?.id ?? "", payload)
          : await criarPublicacaoClient(payload);

      saveStoredPublicacao({
        ...buildPublicacaoFromForm(form, user, editItem),
        ...publicacao,
        authorEmail: undefined,
      });

      toast.success(
        form.status === "publicado"
          ? t("toast.savedPublished")
          : t("toast.saved"),
      );
      router.push("/publicacoes?modo=interna");
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t("errors.save"));
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    const draftForm: PublicacaoFormData = {
      ...form,
      titulo: getTextValue(form.titulo).trim() || t("draft.untitled"),
      autor:
        getTextValue(form.autor).trim() ||
        user?.name ||
        t("draft.unknownAuthor"),
      status: "rascunho",
    };
    const payload = buildPublicacaoRequestBody(draftForm);
    const publicacao =
      isEditMode && isBackendPublicationId(editItem?.id)
        ? await atualizarPublicacaoClient(editItem?.id ?? "", payload)
        : await criarPublicacaoClient(payload);

    saveStoredPublicacao({
      ...buildPublicacaoFromForm(draftForm, user, editItem),
      ...publicacao,
      status: "rascunho",
      authorEmail: undefined,
    });
  };

  const requestCancel = () => {
    if (!hasUnsavedChanges) {
      router.push("/publicacoes?modo=interna");
      return;
    }

    setPendingHref(`${window.location.origin}/publicacoes?modo=interna`);
    setLeaveDialogOpen(true);
  };

  const confirmLeave = async () => {
    if (savingDraftOnLeave) return;

    const href =
      pendingHref ?? `${window.location.origin}/publicacoes?modo=interna`;
    const url = new URL(href, window.location.href);

    if (hasUnsavedChanges) {
      setSavingDraftOnLeave(true);

      try {
        await saveDraft();
        toast.success(t("toast.draftSent"));
      } catch (error) {
        toast.error(getApiErrorMessage(error) || t("errors.draft"));
        setSavingDraftOnLeave(false);
        return;
      }
    }

    allowNavigationRef.current = true;
    setLeaveDialogOpen(false);
    setSavingDraftOnLeave(false);

    if (url.origin === window.location.origin) {
      router.push(`${url.pathname}${url.search}${url.hash}`);
      return;
    }

    window.location.href = url.href;
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="publicacoes" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3.5}>
            <IconButton onClick={requestCancel}>
              <Icon icon="mdi:arrow-left" width={22} />
            </IconButton>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: "text.primary" }}
            >
              {isEditMode ? t("title.edit") : t("title.new")}
            </Typography>
          </Stack>

          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              publish();
            }}
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
                  <TextField
                    fullWidth
                    label={t("fields.title")}
                    value={form.titulo}
                    onChange={(event) =>
                      handleChange("titulo", event.target.value)
                    }
                    error={Boolean(errors.titulo)}
                    helperText={errors.titulo}
                    inputProps={{ maxLength: 255 }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Box>

                <TextField
                  select
                  fullWidth
                  label={t("fields.category")}
                  value={form.categoriaId}
                  onChange={(event) => {
                    const categoriaId = event.target.value;
                    const categoria = categorias.find(
                      (item) => String(item.id) === categoriaId,
                    );

                    handleChange("categoriaId", categoriaId);
                    handleChange("categoria", categoria?.nome ?? "");
                  }}
                  error={Boolean(errors.categoriaId || errors.categoria)}
                  helperText={
                    errors.categoriaId ||
                    errors.categoria ||
                    selectedCategoria?.descricao ||
                    (categoriasLoading
                      ? t("fields.categoriesLoading")
                      : t("fields.categoryHelper"))
                  }
                  disabled={categoriasLoading}
                  InputLabelProps={{ shrink: true }}
                >
                  {categoriasLoading && (
                    <MenuItem value="">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} />
                        <span>{t("fields.categoriesLoading")}</span>
                      </Stack>
                    </MenuItem>
                  )}
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria.id} value={String(categoria.id)}>
                      {categoria.nome}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label={t("fields.author")}
                  value={form.autor}
                  onChange={(event) =>
                    handleChange("autor", event.target.value)
                  }
                  error={Boolean(errors.autor)}
                  helperText={errors.autor}
                  inputProps={{ maxLength: 255 }}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={form.status}
                  onChange={(event) =>
                    handleChange(
                      "status",
                      event.target.value as PublicacaoFormData["status"],
                    )
                  }
                  error={Boolean(errors.status)}
                  helperText={errors.status || t("fields.statusHelper")}
                  InputLabelProps={{ shrink: true }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {t(`fields.statusOptions.${status}`)}
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography fontWeight={700} color="text.primary" mb={1}>
                    {t("fields.bannerImage")}
                  </Typography>
                  <InputImage
                    value={form.bannerImage}
                    onImageChange={(file) =>
                      handleChange("bannerImage", file ?? "")
                    }
                    cropImage
                    aspect={16 / 9}
                    imageHeight={300}
                    subBoxInput={{
                      sx: {
                        borderColor: errors.bannerImage
                          ? "error.main"
                          : "divider",
                        bgcolor: "background.default",
                      },
                    }}
                  />
                  <Typography
                    color={errors.bannerImage ? "error.main" : "text.secondary"}
                    fontSize="0.78rem"
                    mt={0.75}
                  >
                    {errors.bannerImage || t("fields.bannerImageHelper")}
                  </Typography>
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
                <HtmlTextEditor
                  label={t("fields.summary")}
                  value={form.resumo}
                  onChange={(value) => handleChange("resumo", value)}
                  error={errors.resumo}
                  minRows={4}
                  helperText={t("fields.summaryCounter", {
                    count: form.resumo.length,
                  })}
                />

                <HtmlTextEditor
                  label={t("fields.content")}
                  value={form.conteudo}
                  onChange={(value) => handleChange("conteudo", value)}
                  error={errors.conteudo}
                  minRows={8}
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

              <InputSingleFile
                multiple
                values={form.anexos}
                existingFiles={form.anexosExistentes}
                onFilesChange={(files) => handleChange("anexos", files)}
                onRemoveExistingFile={(id) => {
                  handleChange(
                    "anexosExistentes",
                    form.anexosExistentes.filter((anexo) => anexo.id !== id),
                  );
                  handleChange("anexosRemovidos", [
                    ...form.anexosRemovidos,
                    id,
                  ]);
                }}
                tipos_aceitos={["pdf", "doc", "docx", "jpg", "jpeg", "png"]}
                maxSize={10 * 1024 * 1024}
                label={t("fields.attachment")}
                helperText={t("fields.attachmentHelper")}
              />
            </Paper>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <Button variant="outlined" onClick={requestCancel}>
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || (isEditMode && !hasUnsavedChanges)}
              >
                {submitting
                  ? t("actions.saving")
                  : isEditMode
                    ? t("actions.saveChanges")
                    : t("actions.savePublication")}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <ConfirmDialog
        open={leaveDialogOpen}
        title={t("leaveDialog.title")}
        description={t("leaveDialog.description")}
        confirmText={t("leaveDialog.confirm")}
        cancelText={t("leaveDialog.cancel")}
        loading={savingDraftOnLeave}
        onConfirm={confirmLeave}
        onClose={() => {
          if (savingDraftOnLeave) return;
          setLeaveDialogOpen(false);
          setPendingHref(null);
        }}
      />
    </Box>
  );
}
