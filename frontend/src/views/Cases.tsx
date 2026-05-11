"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { CaseForm } from "@/components/forms/CaseForm";

import { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationsContext";
import { cases, type CaseItem } from "@/data/cases";

export default function CasesView() {
  const [caseOpen, setCaseOpen] = useState(false);
  const { addNotification } = useNotifications();

  const handleOpenNewCaseModal = () => setCaseOpen(true);
  const handleCloseNewCaseModal = () => setCaseOpen(false);

  const handleNewCaseSubmit = () =>
    addNotification({
      title: "Novo caso criado",
      description: "Um novo caso foi adicionado.",
    });

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="cases" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
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
                Casos
              </Typography>
              <Typography color="text.secondary" fontSize="0.95rem">
                Gerencie todos os casos e processos jurídicos.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={handleOpenNewCaseModal}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                px: 1,
                minWidth: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
              }}
            >
              <Icon icon="mdi:plus" width={20} />
              Novo Caso
            </Button>
          </Stack>

          <Paper
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                px: 2,
                py: 1.8,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <TextField
                placeholder={
                  "Buscar por título, número do processo ou cliente..."
                }
                sx={{
                  width: { xs: "100%", sm: 550 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.paper",
                    borderRadius: "12px",
                    height: 44,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon
                        icon="mdi:magnify"
                        color="currentColor"
                        width={20}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="outlined"
                startIcon={<Icon icon="mdi:filter-variant" />}
                sx={{
                  textTransform: "none",
                  borderRadius: "12px",
                  borderColor: "divider",
                  color: "text.secondary",
                  minWidth: 100,
                }}
              >
                Filtros
              </Button>
            </Stack>

            <Table>
              <TableHead sx={{ bgcolor: "background.paper" }}>
                <TableRow>
                  <TableCell sx={headCellStyle}>CLIENTE</TableCell>
                  <TableCell sx={headCellStyle}>TÍTULO DO CASO</TableCell>
                  <TableCell sx={headCellStyle}>NÚMERO DO PROCESSO</TableCell>
                  <TableCell sx={headCellStyle}>PRÓXIMA AUDIÊNCIA</TableCell>
                  <TableCell sx={headCellStyle}>ADVOGADO</TableCell>
                  <TableCell
                    sx={{
                      ...headCellStyle,
                      textAlign: "right",
                      pr: 3,
                    }}
                  >
                    AÇÕES
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cases.map((caseItem) => {
                  return (
                    <TableRow key={caseItem.caseSlug}>
                      <TableCell sx={rowCellStyle}>
                        <Typography fontWeight={600} color="text.primary">
                          {caseItem.clientName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        <Typography color="text.primary">
                          {caseItem.caseTitle}
                        </Typography>
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        <Typography color="text.secondary">
                          {caseItem.processNumber}
                        </Typography>
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        <Typography color="text.primary">
                          {caseItem.nextHearing}
                        </Typography>
                      </TableCell>
                      <TableCell sx={rowCellStyle}>
                        <Typography color="text.primary">
                          {caseItem.lawyerName}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          ...rowCellStyle,
                          textAlign: "right",
                          pr: 2,
                        }}
                      >
                        <IconButton
                          sx={actionBtnStyle}
                          component={Link}
                          href={`/acompanhamento/${caseItem.clientSlug}/${caseItem.caseSlug}`}
                        >
                          <Icon icon="mdi:eye-outline" width={19} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                px: 2,
                py: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography color="text.secondary" fontSize="0.95rem">
                {`Mostrando 1 até ${cases.length} de ${cases.length} registros`}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  disabled
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    borderColor: "divider",
                    minWidth: 88,
                  }}
                >
                  Anterior
                </Button>
                <Button
                  variant="outlined"
                  disabled
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    borderColor: "divider",
                    minWidth: 88,
                  }}
                >
                  Próximo
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <BaseModal
        open={caseOpen}
        onClose={handleCloseNewCaseModal}
        title="Novo Caso"
        onSubmit={handleNewCaseSubmit}
      >
        <CaseForm />
      </BaseModal>
    </Box>
  );
}

const headCellStyle = {
  color: "text.secondary",
  fontWeight: 700,
  fontSize: "0.9rem",
  borderBottom: "1px solid",
  borderColor: "divider",
};

const rowCellStyle = {
  py: 1.9,
  borderBottom: "1px solid",
  borderColor: "divider",
};

const actionBtnStyle = {
  color: "text.secondary",
};
