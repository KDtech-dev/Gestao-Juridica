"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useEffect, useMemo, useRef, useState } from "react";
import { StepDadosBasicos } from "@/components/publications/StepDadosBasicos";
import { StepRevisao } from "@/components/publications/StepRevisao";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import {
  PublicacaoFormData,
  PublicationErrors,
} from "@/components/publications/types";
import { findPublicacaoBySlug } from "@/data/publicacoes";
import { toast } from "@/utils/toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  buildPublicacaoFromForm,
  getStoredPublicacoes,
  saveStoredPublicacao,
} from "@/utils/publicationsStorage";
import { publicationSchema } from "@/schemas/publication.schema";

const initialForm: PublicacaoFormData = {
  titulo: "",
  categoria: "",
  bannerImage: "",
  autor: "",
  resumo: "",
  conteudo: "",
  anexos: [],
};

function getFormSnapshot(form: PublicacaoFormData) {
  return JSON.stringify({
    ...form,
    anexos: form.anexos.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    })),
  });
}

type Props = {
  editSlug?: string;
};

export default function NewPublicationView({ editSlug }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const steps = ["Dados da Publicação", "Revisão"];
  const editItem = useMemo(
    () => {
      if (!editSlug) return undefined;

      return (
        getStoredPublicacoes().find((item) => item.slug === editSlug) ??
        findPublicacaoBySlug(editSlug)
      );
    },
    [editSlug],
  );
  const isEditMode = Boolean(editItem);
  const initialResolvedForm = useMemo<PublicacaoFormData>(() => {
    if (!editItem) {
      return {
        ...initialForm,
        autor: user?.name ?? "",
      };
    }
    return {
      titulo: editItem.titulo,
      categoria: editItem.categoria,
      bannerImage: editItem.bannerImage,
      autor: editItem.autor,
      resumo: editItem.resumo,
      conteudo: editItem.conteudoHtml,
      anexos: [],
    };
  }, [editItem, user?.name]);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<PublicacaoFormData>(initialResolvedForm);
  const [initialSnapshot] = useState(() =>
    getFormSnapshot(initialResolvedForm),
  );
  const [errors, setErrors] = useState<PublicationErrors>({});
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const allowNavigationRef = useRef(false);

  const hasUnsavedChanges = useMemo(
    () => getFormSnapshot(form) !== initialSnapshot,
    [form, initialSnapshot],
  );

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
    const parsed = publicationSchema.safeParse(form);

    if (parsed.success) {
      setErrors({});
      return true;
    }

    const nextErrors: PublicationErrors = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];

      if (typeof key === "string" && key !== "anexos") {
        nextErrors[key as keyof PublicationErrors] = issue.message;
      }
    }

    setErrors(nextErrors);
    toast.error("Revise os campos destacados.");

    return false;
  };

  const validateStep = () => {
    if (activeStep === 0) {
      return validateForm();
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const publish = () => {
    if (!validateForm()) {
      setActiveStep(0);
      return;
    }

    const publicacao = buildPublicacaoFromForm(form, user, editItem);

    saveStoredPublicacao(publicacao);

    toast.success(
      isEditMode ? "Publicação atualizada." : "Publicação adicionada.",
    );
    router.push("/publicacoes?modo=interna");
  };

  const requestCancel = () => {
    if (!hasUnsavedChanges) {
      router.push("/publicacoes?modo=interna");
      return;
    }

    setPendingHref(`${window.location.origin}/publicacoes?modo=interna`);
    setLeaveDialogOpen(true);
  };

  const confirmLeave = () => {
    const href =
      pendingHref ?? `${window.location.origin}/publicacoes?modo=interna`;
    const url = new URL(href, window.location.href);

    allowNavigationRef.current = true;
    setLeaveDialogOpen(false);

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
        <HeaderDashboard />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Box mb={2.2}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {isEditMode ? "Editar Publicação" : "Nova Publicação"}
            </Typography>
            <Typography color="text.secondary" fontSize="0.94rem">
              {isEditMode
                ? "Atualize os dados da publicação em etapas."
                : "Preencha os dados da publicação em etapas."}
            </Typography>
          </Box>

          <Paper
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <StepDadosBasicos
                data={form}
                errors={errors}
                onChange={handleChange}
              />
            )}
            {activeStep === 1 && <StepRevisao data={form} />}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={requestCancel}
                  sx={{
                    textTransform: "none",
                    borderColor: "divider",
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  variant="outlined"
                  onClick={prevStep}
                  disabled={activeStep === 0}
                  sx={{
                    textTransform: "none",
                    borderColor: "divider",
                  }}
                >
                  Voltar
                </Button>
              </Stack>

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={nextStep}
                  sx={{ textTransform: "none" }}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={publish}
                  sx={{ textTransform: "none" }}
                >
                  {isEditMode ? "Salvar Alterações" : "Publicar"}
                </Button>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>

      <ConfirmDialog
        open={leaveDialogOpen}
        title="Sair sem salvar?"
        description="Os dados preenchidos nesta publicação não serão salvos se você sair desta tela."
        confirmText="Sair sem salvar"
        cancelText="Continuar editando"
        onConfirm={confirmLeave}
        onClose={() => {
          setLeaveDialogOpen(false);
          setPendingHref(null);
        }}
      />
    </Box>
  );
}
