  "use client";
  
  import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useCallback, useEffect, useState } from "react";
import {
  getClientes,
  postCliente,
  updateCliente,
  deleteCliente,
} from "@/api/ApiClientes";
import { toast } from "@/utils/toast";
import { ClienteType } from "@/@core/types";
import { CreateClientePayload } from "@/schemas/ClienteSchema";
import DialogCliente from "@/components/DialogCliente";
import { formatCpfCnpj } from "@/@core/format";

type DialogMode = "create" | "edit" | "view";

export default function ClientesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteType | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  const loadClientes = useCallback(async (page = 1) => {
    setLoading(true);

    try {
      const response = await getClientes(page);

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
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        transition: "background-color 0.2s ease",
      }}
    >
      <SidebarDashboard activeKey="clientes" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
            mb={3.5}
          >
            <Box>
             <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  borderRadius: "10px",
                  color: "text.primary",
                }}
              >
                Clientes
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "0.95rem",
                  maxWidth: "500px",
                }}
              >
                Gerencie seu diretório de clientes e contas corporativas.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={openCreate}
              startIcon={<Icon icon="mdi:plus" width={20} />}
              sx={{
                borderRadius: "14px",
                px: 2.5,
                height: 44,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              Novo cliente
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              transition: "box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: theme.shadows[3],
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              gap={1.5}
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: `${theme.palette.primary.main}08`,
              }}
            >
              <TextField
                placeholder="Buscar por nome, documento ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{
                  width: { xs: "100%", sm: 450 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    height: 44,
                    bgcolor: "background.paper",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: theme.shadows[1],
                    },
                    "&.Mui-focused": {
                      boxShadow: `0 0 0 2px ${(theme.palette.primary.main, 0.2)}`,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon
                        icon="mdi:magnify"
                        width={20}
                        color={theme.palette.text.secondary}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Chip
                label={`${total} clientes cadastrados`}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: "12px",
                  height: 32,
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            </Stack>

            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: `${theme.palette.primary.main}08` }}>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                      }}
                    >
                      NOME DO CLIENTE
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                      }}
                    >
                      DETALHES DE CONTATO
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                      }}
                    >
                      CPF / CNPJ
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                      }}
                    >
                      DATA NASC.
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        pr: 3,
                        fontWeight: 800,
                      }}
                    >
                      AÇÕES
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading &&
                    [...Array(5)].map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell colSpan={5} sx={{ py: 2 }}>
                          <Stack spacing={1}>
                            <Skeleton variant="text" width="80%" height={30} />
                            <Skeleton variant="text" width="60%" height={20} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                  {!loading && clientesFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        sx={{ py: 8, textAlign: "center" }}
                      >
                        <Stack alignItems="center" spacing={2}>
                          <Icon
                            icon="mdi:account-group-outline"
                            width={48}
                            color={theme.palette.text.secondary}
                          />
                          <Typography color="text.secondary" variant="h6">
                            Nenhum cliente encontrado
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={openCreate}
                            startIcon={<Icon icon="mdi:plus" />}
                            sx={{ borderRadius: "12px" }}
                          >
                            Adicionar primeiro cliente
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    clientesFiltrados.map((cliente, index) => (
                      <TableRow
                        key={cliente.id}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: `${theme.palette.primary.main}08`,
                            "& .action-buttons": {
                              opacity: 1,
                            },
                          },
                          animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={700} color="text.primary">
                            {cliente.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            color="text.primary"
                            variant="body2"
                            fontWeight={500}
                          >
                            {cliente.email || "-"}
                          </Typography>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            mt={0.5}
                          >
                            <Icon
                              icon="mdi:phone"
                              width={14}
                              color={theme.palette.text.secondary}
                            />
                            <Typography
                              color="text.secondary"
                              variant="caption"
                            >
                              {cliente.telefone || "-"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography
                            color="text.secondary"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.9rem",
                            }}
                          >
                            {formatCpfCnpj(cliente.cpf_cnpj || "-")}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography color="text.secondary" variant="body2">
                            {cliente.data_nascimento || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ textAlign: "right", pr: 2 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                            className="action-buttons"
                            sx={{ opacity: { xs: 1, md: 0.6 } }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => openView(cliente)}
                              sx={{
                                "&:hover": {
                                  bgcolor: `${theme.palette.info.main}08`,
                                  color: "info.main",
                                },
                              }}
                            >
                              <Icon icon="mdi:eye-outline" width={20} />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => openEdit(cliente)}
                              sx={{
                                "&:hover": {
                                  bgcolor: `${theme.palette.warning.main}08`,
                                  color: "warning.main",
                                },
                              }}
                            >
                              <Icon icon="mdi:pencil-outline" width={20} />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCliente(cliente)}
                              sx={{
                                "&:hover": {
                                  bgcolor: `${theme.palette.error.main}08`,
                                  color: "error.main",
                                },
                              }}
                            >
                              <Icon icon="mdi:trash-can-outline" width={20} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2.5,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Typography color="text.secondary" variant="body2">
                Mostrando {clientes.length} de {total} registro(s)
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => loadClientes(currentPage - 1)}
                  startIcon={<Icon icon="mdi:chevron-left" width={18} />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 2,
                    minWidth: 120,
                    borderColor: theme.palette.divider,
                    transition: "all 0.2s ease",
                    "&:hover:not(:disabled)": {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  Anterior
                </Button>

                <Chip
                  label={`Página ${currentPage} de ${lastPage}`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                />

                <Button
                  variant="outlined"
                  disabled={currentPage >= lastPage || loading}
                  onClick={() => loadClientes(currentPage + 1)}
                  endIcon={<Icon icon="mdi:chevron-right" width={18} />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 2,
                    minWidth: 120,
                    borderColor: theme.palette.divider,
                    transition: "all 0.2s ease",
                    "&:hover:not(:disabled)": {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  Próximo
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>

        <DialogCliente
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleSubmit}
          submitting={submitting}
          mode={dialogMode}
          cliente={clienteSelecionado}
        />
      </Box>
    </Box>
  );
}
