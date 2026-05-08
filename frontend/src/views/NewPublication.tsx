"use client";

import {
  Alert,
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
import { useMemo, useState } from "react";
import { StepDadosBasicos } from "@/components/publications/StepDadosBasicos";
import { StepConteudo } from "@/components/publications/StepConteudo";
import { StepRevisao } from "@/components/publications/StepRevisao";
import {
  BasicErrors,
  ContentErrors,
  PublicacaoFormData,
} from "@/components/publications/types";
import { findPublicacaoBySlug } from "@/data/publicacoes";

const initialForm: PublicacaoFormData = {
  titulo: "",
  tipo: "",
  cliente: "",
  processo: "",
  data: "",
  responsavel: "",
  resumo: "",
  conteudo: "",
  anexos: [],
};

type Props = {
  editSlug?: string;
};

export default function NewPublicationView({ editSlug }: Props) {
  const steps = ["Dados Básicos", "Conteúdo", "Revisão"];
  const editItem = useMemo(
    () => (editSlug ? findPublicacaoBySlug(editSlug) : undefined),
    [editSlug],
  );
  const isEditMode = Boolean(editItem);
  const initialResolvedForm = useMemo<PublicacaoFormData>(() => {
    if (!editItem) return initialForm;
    return {
      titulo: editItem.titulo,
      tipo: editItem.tipo,
      cliente: editItem.cliente,
      processo: editItem.processo,
      data: "",
      responsavel: editItem.autor,
      resumo: editItem.resumo,
      conteudo: editItem.conteudoHtml.replace(/<[^>]*>/g, " ").trim(),
      anexos: [],
    };
  }, [editItem]);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<PublicacaoFormData>(initialResolvedForm);
  const [basicErrors, setBasicErrors] = useState<BasicErrors>({});
  const [contentErrors, setContentErrors] = useState<ContentErrors>({});
  const [published, setPublished] = useState(false);

  const handleChange = <K extends keyof PublicacaoFormData>(
    field: K,
    value: PublicacaoFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    if (activeStep === 0) {
      const errors: BasicErrors = {};
      if (!form.titulo.trim()) errors.titulo = "Informe o título.";
      if (!form.tipo) errors.tipo = "Selecione o tipo.";
      if (!form.cliente) errors.cliente = "Selecione o cliente.";
      if (!form.processo) errors.processo = "Selecione o processo.";
      if (!form.data) errors.data = "Selecione a data.";
      if (!form.responsavel.trim())
        errors.responsavel = "Informe o responsável.";
      setBasicErrors(errors);
      return Object.keys(errors).length === 0;
    }
    if (activeStep === 1) {
      const errors: ContentErrors = {};
      if (!form.resumo.trim()) errors.resumo = "Informe o resumo.";
      if (!form.conteudo.trim())
        errors.conteudo = "Informe o conteúdo completo.";
      setContentErrors(errors);
      return Object.keys(errors).length === 0;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const publish = () => {
    setPublished(true);
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
                errors={basicErrors}
                onChange={handleChange}
              />
            )}
            {activeStep === 1 && (
              <StepConteudo
                data={form}
                errors={contentErrors}
                onChange={handleChange}
              />
            )}
            {activeStep === 2 && <StepRevisao data={form} />}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
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

          {published && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: "12px" }}>
              {isEditMode
                ? "Alterações prontas para envio. Quando integrar com o back-end, aqui será feita a atualização."
                : "Publicação pronta para envio. Quando integrar com o back-end, aqui será feita a requisição."}
            </Alert>
          )}
        </Container>
      </Box>
    </Box>
  );
}
