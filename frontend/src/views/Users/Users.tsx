"use client";

import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
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
import { getUsers, postUser, updateUser, deleteUser } from "@/api/ApiUsers";
import { toast } from "@/utils/toast";
import { UserType, RoleType } from "@/@core/types";
import { CreateUserPayload, UpdateUserPayload } from "@/schemas/UserSchema";
import DialogUser from "@/components/modals/DialogUser";

type DialogMode = "create" | "edit" | "view";

const ROLE_LABEL: Record<RoleType, string> = {
  admin: "Administrador",
  advogado: "Advogado",
  funcionario: "Funcionário",
};

const ROLE_COLOR: Record<RoleType, "error" | "primary" | "default"> = {
  admin: "error",
  advogado: "primary",
  funcionario: "default",
};

function getUserRole(user: UserType): RoleType | null {
  return user.roles?.[0] ?? null;
}

function getUserPerfil(user: UserType) {
  return user.funcionario ?? user.advogado ?? null;
}

export default function UsersView() {
  const theme = useTheme();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [users, setUsers] = useState<UserType[]>([]);
  const [userSelecionado, setUserSelecionado] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await getUsers(page);
      setUsers(response.data);
      setCurrentPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
      setTotal(response.meta.total);
    } catch {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const usersFiltrados = users.filter((u) => {
    const matchSearch = [u.name, u.email, u.cpf].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase()),
    );
    const matchRole = roleFilter === "all" || u.roles?.includes(roleFilter);
    return matchSearch && matchRole;
  });

  const handleSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
    setSubmitting(true);
    try {
      if (dialogMode === "create") {
        await postUser(data as CreateUserPayload);
        toast.success("Usuário criado com sucesso!");
      } else {
        await updateUser(userSelecionado!.id, data as UpdateUserPayload);
        toast.success("Usuário atualizado com sucesso!");
      }
      handleDialogClose();
      loadUsers();
    } catch {
      toast.error(
        dialogMode === "create"
          ? "Erro ao criar usuário."
          : "Erro ao atualizar usuário.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserType) => {
    if (!confirm(`Deseja remover ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      toast.success("Usuário removido com sucesso!");
      loadUsers();
    } catch {
      toast.error("Erro ao remover usuário.");
    }
  };

  const openCreate = () => {
    setUserSelecionado(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const openEdit = (user: UserType) => {
    setUserSelecionado(user);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const openView = (user: UserType) => {
    setUserSelecionado(user);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setUserSelecionado(null);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        transition: "background-color 0.2s ease",
      }}
    >
      <SidebarDashboard activeKey="users" />

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
                Usuários
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: "0.95rem", maxWidth: "500px" }}
              >
                Gerencie administradores, advogados e funcionários do sistema.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={openCreate}
              startIcon={<Icon icon="mdi:account-plus-outline" width={20} />}
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
              Novo usuário
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              transition: "box-shadow 0.2s ease",
              "&:hover": { boxShadow: theme.shadows[3] },
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
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} gap={1.2} flex={1}>
                <TextField
                  placeholder="Buscar por nome, e-mail ou CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  sx={{
                    width: { xs: "100%", sm: 380 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      height: 44,
                      bgcolor: "background.paper",
                      transition: "all 0.2s ease",
                      "&:hover": { boxShadow: theme.shadows[1] },
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

                <TextField
                  select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as RoleType | "all")
                  }
                  size="small"
                  label="Perfil"
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      height: 44,
                    },
                  }}
                >
                  <MenuItem value="all">Todos os perfis</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="advogado">Advogado</MenuItem>
                  <MenuItem value="funcionario">Funcionário</MenuItem>
                </TextField>
              </Stack>

              <Chip
                label={`${total} usuário${total !== 1 ? "s" : ""} cadastrado${total !== 1 ? "s" : ""}`}
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
                  <TableRow
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
                  >
                    {["NOME", "CONTATO", "CPF", "PERFIL", "AÇÕES"].map(
                      (col, i) => (
                        <TableCell
                          key={col}
                          sx={{
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            fontSize: "0.75rem",
                            textAlign: i === 4 ? "right" : "left",
                            pr: i === 4 ? 3 : undefined,
                          }}
                        >
                          {col}
                        </TableCell>
                      ),
                    )}
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

                  {!loading && usersFiltrados.length === 0 && (
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
                            Nenhum usuário encontrado
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={openCreate}
                            startIcon={<Icon icon="mdi:plus" />}
                            sx={{ borderRadius: "12px" }}
                          >
                            Adicionar primeiro usuário
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    usersFiltrados.map((user, index) => {
                      const role = getUserRole(user);
                      const perfil = getUserPerfil(user);

                      return (
                        <TableRow
                          key={user.id}
                          sx={{
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              "& .action-buttons": { opacity: 1 },
                            },
                            animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight={700} color="text.primary">
                              {user.name}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              color="text.primary"
                              variant="body2"
                              fontWeight={500}
                            >
                              {user.email}
                            </Typography>
                            {perfil?.celular && (
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
                                  {perfil.celular}
                                </Typography>
                              </Stack>
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography
                              color="text.secondary"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.9rem",
                              }}
                            >
                              {user.cpf
                                ? user.cpf.replace(
                                    /(\d{3})(\d{3})(\d{3})(\d{2})/,
                                    "$1.$2.$3-$4",
                                  )
                                : "-"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {role ? (
                              <Chip
                                label={ROLE_LABEL[role]}
                                color={ROLE_COLOR[role]}
                                size="small"
                                sx={{
                                  borderRadius: "8px",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                }}
                              />
                            ) : (
                              <Typography color="text.disabled" variant="body2">
                                —
                              </Typography>
                            )}
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
                                onClick={() => openView(user)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.info.main,
                                      0.08,
                                    ),
                                    color: "info.main",
                                  },
                                }}
                              >
                                <Icon icon="mdi:eye-outline" width={20} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => openEdit(user)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.warning.main,
                                      0.08,
                                    ),
                                    color: "warning.main",
                                  },
                                }}
                              >
                                <Icon icon="mdi:pencil-outline" width={20} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(user)}
                                sx={{
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.error.main,
                                      0.08,
                                    ),
                                    color: "error.main",
                                  },
                                }}
                              >
                                <Icon icon="mdi:trash-can-outline" width={20} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                Mostrando {usersFiltrados.length} de {total} registro(s)
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => loadUsers(currentPage - 1)}
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
                  sx={{ borderRadius: "10px", fontWeight: 600 }}
                />

                <Button
                  variant="outlined"
                  disabled={currentPage >= lastPage || loading}
                  onClick={() => loadUsers(currentPage + 1)}
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
      </Box>

      <DialogUser
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        submitting={submitting}
        mode={dialogMode}
        user={userSelecionado}
      />
    </Box>
  );
}
