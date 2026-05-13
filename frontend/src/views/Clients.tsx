"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
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
import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationsContext";
import { NewClientModal } from "@/components/modals/NewClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { NewCaseModal } from "@/components/modals/NewCaseModal";
import useClients, { Client } from "@/hooks/useClients";
import { getApiErrorMessage } from "@/configs/ApiError";
import { CasePayload, createCase } from "@/services/caseService";

function statusStyles(status?: Client["status"]) {
  if (status === "Ativo") {
    return { color: "#047857", bg: "#b8ead2" };
  }
  if (status === "Inativo") {
    return { color: "#334155", bg: "#e2e8f0" };
  }
  return { color: "#1d4ed8", bg: "#c7d8f2" };
}

export default function ClientesView() {
  const [open, setOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [caseOpen, setCaseOpen] = useState(false);
  const [submittingClient, setSubmittingClient] = useState(false);
  const [submittingCase, setSubmittingCase] = useState(false);
  const { clients, loading, error, total, search, setSearch, createClient } =
    useClients(1, 100);
  const { addNotification } = useNotifications();
  const statusLabel = (status?: Client["status"]) => status ?? "Ativo";
  const handleOpenNewClientModal = () => setOpen(true);
  const handleCloseNewClientModal = () => setOpen(false);
  const handleOpenMenu = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenNewCaseModal = () => setCaseOpen(true);
  const handleCloseNewCaseModal = () => setCaseOpen(false);
  const handleOpenEditClientModal = () => setEditClientOpen(true);
  const handleCloseEditClientModal = () => setEditClientOpen(false);
  const handleNewClientSubmit = async (payload: Partial<Client>) => {
    try {
      setSubmittingClient(true);
      await createClient(payload);
      setOpen(false);
      addNotification({
        title: "Novo cliente cadastrado",
        description: "O cliente foi adicionado com sucesso.",
      });
    } catch (err) {
      addNotification({
        title: "Erro ao cadastrar cliente",
        description: getApiErrorMessage(err),
      });
    } finally {
      setSubmittingClient(false);
    }
  };
  const handleNewCaseSubmit = async (payload: CasePayload) => {
    try {
      setSubmittingCase(true);
      await createCase(payload);
      setCaseOpen(false);
      addNotification({
        title: "Novo caso criado",
        description: "Um novo caso foi adicionado no painel.",
      });
    } catch (err) {
      addNotification({
        title: "Erro ao criar caso",
        description: getApiErrorMessage(err),
      });
    } finally {
      setSubmittingCase(false);
    }
  };
  const handleEditClientSubmit = () =>
    addNotification({
      title: "Cliente atualizado",
      description: "Os dados do cliente foram atualizados.",
    });

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="clientes" />

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
                Clientes
              </Typography>
              <Typography color="text.secondary" fontSize="0.95rem">
                Gerencie seu diretório de clientes e contas corporativas.
              </Typography>
            </Box>

            <>
              <Button
                variant="contained"
                onClick={handleOpenMenu}
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
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    handleOpenNewClientModal();
                  }}
                >
                  Novo Cliente
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    handleOpenNewCaseModal();
                  }}
                >
                  Novo Caso
                </MenuItem>
              </Menu>
            </>
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
                placeholder={"Buscar por nome, documento ou e-mail..."}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{
                  width: { xs: "100%", sm: 450 },
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
                  <TableCell sx={headCellStyle}>NOME DO CLIENTE</TableCell>
                  <TableCell sx={headCellStyle}>DETALHES DE CONTATO</TableCell>
                  <TableCell sx={headCellStyle}>CPF / CNPJ</TableCell>
                  <TableCell sx={headCellStyle}>STATUS</TableCell>
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
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={rowCellStyle}>
                      <Typography color="text.secondary">
                        Carregando clientes...
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={5} sx={rowCellStyle}>
                      <Typography color="error">{error}</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && clients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={rowCellStyle}>
                      <Typography color="text.secondary">
                        Nenhum cliente encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  !error &&
                  clients.map((client) => {
                    const { color, bg } = statusStyles(client.status);

                    return (
                      <TableRow key={client.id ?? client.slug}>
                        <TableCell sx={rowCellStyle}>
                          <Typography
                            fontWeight={600}
                            color="text.primary"
                            mb={0.3}
                          >
                            {client.name}
                          </Typography>
                          <Typography color="text.secondary" fontSize="0.86rem">
                            Contato: {client.contactName || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={rowCellStyle}>
                          <Typography color="text.primary">
                            {client.email || "-"}
                          </Typography>
                          <Typography color="text.secondary" fontSize="0.86rem">
                            {client.phone || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={rowCellStyle}>
                          <Typography color="text.secondary">
                            {client.cpfCnpj || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={rowCellStyle}>
                          <Chip
                            label={statusLabel(client.status)}
                            sx={{
                              bgcolor: bg,
                              color,
                              fontWeight: 500,
                            }}
                          />
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
                            href={`/acompanhamento/${client.slug}`}
                          >
                            <Icon icon="mdi:eye-outline" width={19} />
                          </IconButton>
                          <>
                            <IconButton
                              sx={actionBtnStyle}
                              onClick={handleOpenEditClientModal}
                            >
                              <Icon icon="mdi:pencil-outline" width={19} />
                            </IconButton>
                            <IconButton sx={actionBtnStyle}>
                              <Icon icon="mdi:trash-can-outline" width={19} />
                            </IconButton>
                          </>
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
                {`Mostrando ${clients.length ? 1 : 0} até ${clients.length} de ${total} registros`}
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

      <NewClientModal
        open={open}
        onClose={handleCloseNewClientModal}
        onSubmit={handleNewClientSubmit}
        submitting={submittingClient}
      />
      <NewCaseModal
        open={caseOpen}
        onClose={handleCloseNewCaseModal}
        onSubmit={handleNewCaseSubmit}
        submitting={submittingCase}
      />
      <EditClientModal
        open={editClientOpen}
        onClose={handleCloseEditClientModal}
        onSubmit={handleEditClientSubmit}
      />
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
