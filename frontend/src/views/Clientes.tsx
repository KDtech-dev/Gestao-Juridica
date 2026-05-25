"use client";

import {
  Box,
  Button,
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
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useCallback, useEffect, useState } from "react";
import { NewCaseModal } from "@/components/modals/NewCaseModal";
import {
  getClientes,
  postCliente,
  updateCliente,
  deleteCliente,
} from "@/api/ApiClientes";
import { toast } from "@/utils/toast";
import { ClienteType } from "@/components/publications/types";
import { CreateClientePayload } from "@/schemas/ClienteSchema";
import DialogCliente from "@/components/DialogCliente";

type DialogMode = "create" | "edit" | "view";

export default function ClientesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [caseOpen, setCaseOpen] = useState(false);
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteType | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittingCase, setSubmittingCase] = useState(false);

  const loadClientes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await getClientes();
      setClientes(response.data);
      setCurrentPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
      setTotal(response.meta.total);
    } catch {
      toast.error("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const clientesFiltrados = clientes.filter((c) =>
    [c.name, c.cpf_cnpj, c.email].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  const handleSubmit = async (data: CreateClientePayload) => {
    setSubmitting(true);
    try {
      if (dialogMode === "create") {
        await postCliente(data);
        toast.success("Cliente criado com sucesso!");
      } else {
        await updateCliente(clienteSelecionado!.id, data);
        toast.success("Cliente atualizado com sucesso!");
      }
      handleDialogClose();
      loadClientes();
    } catch {
      toast.error(
        dialogMode === "create"
          ? "Erro ao criar cliente."
          : "Erro ao atualizar cliente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCliente = async (cliente: ClienteType) => {
    if (!confirm(`Deseja remover ${cliente.name}?`)) return;
    try {
      await deleteCliente(cliente.id);
      toast.success("Cliente removido com sucesso!");
      loadClientes();
    } catch {
      toast.error("Erro ao remover cliente.");
    }
  };

  const handleNewCaseSubmit = async (data: unknown) => {
    setSubmittingCase(true);
    try {
      toast.success("Caso criado com sucesso!");
      setCaseOpen(false);
    } catch {
      toast.error("Erro ao criar caso.");
    } finally {
      setSubmittingCase(false);
    }
  };

  const openCreate = () => {
    setClienteSelecionado(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const openEdit = (cliente: ClienteType) => {
    setClienteSelecionado(cliente);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const openView = (cliente: ClienteType) => {
    setClienteSelecionado(cliente);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setClienteSelecionado(null);
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="clientes" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={1.5}
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

            <Button
              variant="contained"
              onClick={openCreate}
              startIcon={<Icon icon="mdi:plus" width={20} />}
              sx={{
                borderRadius: "12px",
                px: 2,
                height: 44,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Novo cliente
            </Button>
          </Stack>

          <Paper
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              gap={1.2}
              sx={{
                px: 2,
                py: 1.8,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <TextField
                placeholder="Buscar por nome, documento ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 450 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    height: 44,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="mdi:magnify" width={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <TableContainer>
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellStyle}>NOME DO CLIENTE</TableCell>
                    <TableCell sx={headCellStyle}>
                      DETALHES DE CONTATO
                    </TableCell>
                    <TableCell sx={headCellStyle}>CPF / CNPJ</TableCell>
                    <TableCell sx={headCellStyle}>DATA NASC.</TableCell>
                    <TableCell
                      sx={{ ...headCellStyle, textAlign: "right", pr: 3 }}
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

                  {!loading && clientesFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={rowCellStyle}>
                        <Typography color="text.secondary">
                          Nenhum cliente encontrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell sx={rowCellStyle}>
                          <Typography fontWeight={600} color="text.primary">
                            {cliente.name}
                          </Typography>
                        </TableCell>

                        <TableCell sx={rowCellStyle}>
                          <Typography color="text.primary">
                            {cliente.email || "-"}
                          </Typography>
                          <Typography color="text.secondary" fontSize="0.86rem">
                            {cliente.telefone || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={rowCellStyle}>
                          <Typography color="text.secondary">
                            {cliente.cpf_cnpj || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={rowCellStyle}>
                          <Typography color="text.secondary">
                            {cliente.data_nascimento || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{ ...rowCellStyle, textAlign: "right", pr: 2 }}
                        >
                          <IconButton
                            sx={actionBtnStyle}
                            onClick={() => openView(cliente)}
                          >
                            <Icon icon="mdi:eye-outline" width={19} />
                          </IconButton>

                          <IconButton
                            sx={actionBtnStyle}
                            onClick={() => openEdit(cliente)}
                          >
                            <Icon icon="mdi:pencil-outline" width={19} />
                          </IconButton>

                          <IconButton
                            sx={actionBtnStyle}
                            onClick={() => handleDeleteCliente(cliente)}
                          >
                            <Icon icon="mdi:trash-can-outline" width={19} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

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
                {`${total} registro(s) encontrado(s)`}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  disabled={currentPage <= 1}
                  onClick={() => loadClientes(currentPage - 1)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    borderColor: "divider",
                  }}
                >
                  Anterior
                </Button>
                <Button
                  variant="outlined"
                  disabled={currentPage >= lastPage}
                  onClick={() => loadClientes(currentPage + 1)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    borderColor: "divider",
                  }}
                >
                  Próximo
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <DialogCliente
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        submitting={submitting}
        mode={dialogMode}
        cliente={clienteSelecionado}
      />
      <NewCaseModal
        open={caseOpen}
        onClose={() => setCaseOpen(false)}
        onSubmit={handleNewCaseSubmit}
        submitting={submittingCase}
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

const actionBtnStyle = { color: "text.secondary" };
