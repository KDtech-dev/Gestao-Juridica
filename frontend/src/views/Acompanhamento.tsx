"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useState } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { EditCaseModal } from "@/components/modals/EditCaseModal";

type Props = {
  clientName: string;
  caseTitle: string;
  processNumber: string;
  status: "Em Andamento" | "Pendente" | "Concluído";
  nextHearing: string;
  lawyerName: string;
};

const phases = [
  "Cadastro do Caso",
  "Análise Inicial",
  "Documentação",
  "Andamento Processual",
  "Conclusão",
];

const initialUpdates = [
  {
    id: "u1",
    date: "27/03/2026",
    title: "Petição inicial protocolada",
    description: "Protocolo confirmado no sistema do tribunal.",
  },
  {
    id: "u2",
    date: "25/03/2026",
    title: "Documentos complementares recebidos",
    description: "Cliente enviou comprovantes e anexos solicitados.",
  },
  {
    id: "u3",
    date: "22/03/2026",
    title: "Reunião de alinhamento realizada",
    description: "Definição dos próximos passos e estratégia jurídica.",
  },
];

const initialSteps = [
  {
    id: "s1",
    label: "Preparar manifestação até 02/04",
  },
  {
    id: "s2",
    label: "Enviar atualização ao cliente",
  },
  {
    id: "s3",
    label: "Revisar documentos anexados",
  },
];

export default function AcompanhamentoView({
  clientName,
  caseTitle,
  processNumber,
  status,
  nextHearing,
  lawyerName,
}: Props) {
  const { addNotification } = useNotifications();
  const [updates, setUpdates] = useState(initialUpdates);
  const [steps, setSteps] = useState(initialSteps);

  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateDescription, setNewUpdateDescription] = useState("");

  const [newStepLabel, setNewStepLabel] = useState("");
  const [editCaseOpen, setEditCaseOpen] = useState(false);

  const visibleUpdates = updates;
  const visibleSteps = steps;
  const addUpdate = () => {
    if (!newUpdateTitle.trim() || !newUpdateDescription.trim()) return;
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    setUpdates((prev) => [
      {
        id: `u${prev.length + 1}`,
        date,
        title: newUpdateTitle.trim(),
        description: newUpdateDescription.trim(),
      },
      ...prev,
    ]);
    setNewUpdateTitle("");
    setNewUpdateDescription("");
    addNotification({
      title: "Nova atualização registrada",
      description: `${caseTitle}: ${newUpdateTitle.trim()}`,
    });
  };

  const addStep = () => {
    if (!newStepLabel.trim()) return;
    setSteps((prev) => [
      {
        id: `s${prev.length + 1}`,
        label: newStepLabel.trim(),
      },
      ...prev,
    ]);
    setNewStepLabel("");
    addNotification({
      title: "Novo próximo passo criado",
      description: `${caseTitle}: ${newStepLabel.trim()}`,
    });
  };
  const handleOpenEditCaseModal = () => setEditCaseOpen(true);
  const handleCloseEditCaseModal = () => setEditCaseOpen(false);
  const handleEditCaseSubmit = () => {
    setEditCaseOpen(false);
    addNotification({
      title: "Caso atualizado",
      description: `${caseTitle} — ${processNumber}`,
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="casos" />

      <Box
        sx={{
          ml: { xs: 0, md: "280px" },
          minWidth: 0,
        }}
      >
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2.2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                Acompanhamento do Caso{" "}
              </Typography>
              <Typography color="text.secondary" fontSize="0.92rem">
                {`Visão completa do caso ${caseTitle} para ${clientName}.`}{" "}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={status}
                sx={{
                  bgcolor:
                    status === "Concluído"
                      ? "#dcfce7"
                      : status === "Pendente"
                        ? "#ffedd5"
                        : "#d1fae5",
                  color:
                    status === "Concluído"
                      ? "#166534"
                      : status === "Pendente"
                        ? "#c2410c"
                        : "#047857",
                  fontWeight: 600,
                }}
              />
              <Button
                variant="outlined"
                startIcon={<Icon icon="mdi:pencil-outline" />}
                sx={{ textTransform: "none" }}
                onClick={handleOpenEditCaseModal}
              >
                Editar Caso
              </Button>
            </Stack>
          </Stack>

          <Paper sx={cardStyle}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              mb={2}
            >
              <Box>
                <Typography color="text.secondary" fontSize="0.84rem">
                  Processo
                </Typography>
                <Typography
                  color="text.primary"
                  fontSize="1.02rem"
                  fontWeight={700}
                >
                  {processNumber}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" fontSize="0.84rem">
                  Advogado Responsável
                </Typography>
                <Typography
                  color="text.primary"
                  fontSize="1.02rem"
                  fontWeight={700}
                >
                  {lawyerName}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" fontSize="0.84rem">
                  Próxima Audiência
                </Typography>
                <Typography
                  color="text.primary"
                  fontSize="1.02rem"
                  fontWeight={700}
                >
                  {nextHearing}
                </Typography>
              </Box>
            </Stack>

            <Stepper activeStep={3} alternativeLabel>
              {phases.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "1.3fr 0.9fr",
              },
              gap: 2,
            }}
          >
            <Paper sx={cardStyle}>
              <Typography fontWeight={700} color="text.primary" mb={1.4}>
                Últimas Atualizações
              </Typography>

              <Stack spacing={1.2}>
                {visibleUpdates.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "10px",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      fontSize="0.8rem"
                      mb={0.3}
                    >
                      {item.date}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      color="text.primary"
                      fontSize="0.95rem"
                    >
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" fontSize="0.86rem">
                      {item.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Stack spacing={2}>
              <Paper sx={cardStyle}>
                <Typography fontWeight={700} color="text.primary" mb={1.2}>
                  Próximas Ações
                </Typography>
                <Stack spacing={1}>
                  {visibleSteps.map((stepItem) => (
                    <Chip key={stepItem.id} label={stepItem.label} />
                  ))}
                </Stack>
              </Paper>

              <Paper sx={cardStyle}>
                <Typography fontWeight={700} color="text.primary" mb={1.2}>
                  Compartilhamento
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Icon icon="mdi:download-outline" />}
                    sx={actionBtn}
                  >
                    Baixar Relatório
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Icon icon="mdi:email-outline" />}
                    sx={actionBtn}
                  >
                    Enviar por E-mail
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Container>
      </Box>
      <EditCaseModal
        open={editCaseOpen}
        onClose={handleCloseEditCaseModal}
        onSubmit={handleEditCaseSubmit}
      />
    </Box>
  );
}

const cardStyle = {
  borderRadius: "14px",
  p: 2,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
  bgcolor: "background.paper",
};

const actionBtn = {
  justifyContent: "flex-start",
  textTransform: "none",
  borderRadius: "10px",
  borderColor: "divider",
  color: "text.secondary",
};
