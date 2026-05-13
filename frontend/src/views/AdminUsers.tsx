"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import type { User, UserType } from "@/services/userService";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "@/services/userService";
import UserTable from "@/components/users/UserTable";
import UserModal, {
  type UserFormSubmitPayload,
} from "@/components/modals/UserModal";
import ConfirmDialog from "@/components/users/ConfirmDialog";

type SnackbarState = {
  open: boolean;
  severity: "success" | "error";
  message: string;
};

function extractApiErrorMessage(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const maybeErr = err as { response?: { data?: unknown } };
  const data = maybeErr.response?.data;
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  return typeof record.message === "string" ? record.message : null;
}

export default function AdminUsersView() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyIds, setBusyIds] = useState<Array<string | number>>([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<UserType | "all">("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });

  const openSnackbar = (severity: SnackbarState["severity"], message: string) =>
    setSnackbar({ open: true, severity, message });

  const closeSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await listUsers({
        search: search.trim() || undefined,
        type: typeFilter,
        limit: 100,
      });
      setUsers(res.items);
    } catch (err) {
      const message =
        extractApiErrorMessage(err) || "Não foi possível carregar usuários.";
      openSnackbar("error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const handle = window.setTimeout(() => {
      loadUsers();
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, isAdmin]);

  const canManage = isAdmin;

  const handleEdit = (user: User) => {
    setEditing(user);
    setFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeleting(user);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleting.id);
      openSnackbar("success", "Usuário excluído.");
      setConfirmOpen(false);
      setDeleting(null);
      await loadUsers();
    } catch (err) {
      const message =
        extractApiErrorMessage(err) || "Não foi possível excluir usuário.";
      openSnackbar("error", message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (user: User, nextActive: boolean) => {
    setBusyIds((prev) => Array.from(new Set([...prev, user.id])));
    // optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        String(u.id) === String(user.id) ? { ...u, active: nextActive } : u,
      ),
    );
    try {
      await updateUser(user.id, { active: nextActive });
      openSnackbar(
        "success",
        nextActive ? "Usuário ativado." : "Usuário desativado.",
      );
    } catch (err) {
      // rollback
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === String(user.id) ? { ...u, active: user.active } : u,
        ),
      );
      const message =
        extractApiErrorMessage(err) || "Não foi possível atualizar status.";
      openSnackbar("error", message);
    } finally {
      setBusyIds((prev) => prev.filter((id) => String(id) !== String(user.id)));
    }
  };

  const submitLabel = useMemo(
    () => (editing ? "Usuário atualizado." : "Usuário criado."),
    [editing],
  );

  const handleSubmit = async (payload: UserFormSubmitPayload) => {
    if (editing) {
      setBusyIds((prev) => Array.from(new Set([...prev, editing.id])));
      try {
        await updateUser(editing.id, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          type: payload.type,
          oabNumber: payload.oabNumber,
          areas: payload.areas,
          position: payload.position,
          active: payload.active,
          password: payload.password,
        });
        openSnackbar("success", submitLabel);
        await loadUsers();
      } catch (err) {
        const message =
          extractApiErrorMessage(err) || "Não foi possível atualizar usuário.";
        openSnackbar("error", message);
        throw err;
      } finally {
        setBusyIds((prev) =>
          prev.filter((id) => String(id) !== String(editing.id)),
        );
      }
    } else {
      setBusyIds((prev) => Array.from(new Set([...prev, "new"])));
      try {
        await createUser({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          type: payload.type,
          cpf: payload.cpf,
          password: payload.password || "",
          oabNumber: payload.oabNumber,
          areas: payload.areas,
          position: payload.position,
          active: payload.active,
        });
        openSnackbar("success", submitLabel);
        await loadUsers();
      } catch (err) {
        const message =
          extractApiErrorMessage(err) || "Não foi possível criar usuário.";
        openSnackbar("error", message);
        throw err;
      } finally {
        setBusyIds((prev) => prev.filter((id) => String(id) !== "new"));
      }
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="admin-users" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack spacing={2.4}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={1.5}
            >
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  Usuários
                </Typography>
                <Typography color="text.secondary" fontSize="0.95rem">
                  Gerencie contas de administradores, advogados e funcionários.
                </Typography>
              </Box>

              {canManage ? (
                <Button
                  component={Link}
                  href="/admin/users/new"
                  variant="contained"
                  startIcon={
                    <Icon icon="mdi:account-plus-outline" width={20} />
                  }
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    borderRadius: "12px",
                    height: 44,
                  }}
                >
                  Adicionar usuário
                </Button>
              ) : null}
            </Stack>

            {!isAdmin ? (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                }}
                elevation={0}
              >
                <Typography variant="h5" fontWeight={600} mb={1}>
                  Acesso restrito
                </Typography>
                <Typography color="text.secondary">
                  Somente administradores podem ver esta página.
                </Typography>
              </Paper>
            ) : (
              <Paper
                sx={{
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                  overflow: "hidden",
                }}
                elevation={0}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", md: "center" }}
                  gap={1.2}
                  sx={{
                    px: 2,
                    py: 1.8,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={"Buscar por nome ou e-mail..."}
                    sx={{
                      width: { xs: "100%", md: 420 },
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
                          <Icon icon="mdi:magnify" width={20} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value as UserType | "all")
                    }
                    label="Tipo"
                    sx={{
                      width: { xs: "100%", md: 220 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        height: 44,
                      },
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="advogado">Advogado</MenuItem>
                    <MenuItem value="funcionario">Funcionário</MenuItem>
                  </TextField>
                </Stack>

                <UserTable
                  users={users}
                  loading={loading}
                  canManage={canManage}
                  busyIds={busyIds}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onToggleActive={handleToggleActive}
                />
              </Paper>
            )}
          </Stack>
        </Container>
      </Box>

      <UserModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir usuário?"
        description={
          deleting
            ? `Isso removerá permanentemente: ${deleting.name}`
            : undefined
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={deleteLoading}
        onClose={() => {
          if (deleteLoading) return;
          setConfirmOpen(false);
          setDeleting(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
