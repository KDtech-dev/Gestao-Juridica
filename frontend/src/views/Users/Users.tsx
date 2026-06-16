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
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getUsers, postUser, updateUser, deleteUser } from "@/api/ApiUsers";
import { toast } from "@/utils/toast";
import { UserType, RoleType } from "@/@core/types";
import { CreateUserPayload, UpdateUserPayload } from "@/schemas/UserSchema";
import DialogUser from "@/components/modals/DialogUser";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

type DialogMode = "create" | "edit" | "view";

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
  const t = useTranslations("internal.users");
  const theme = useTheme();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [users, setUsers] = useState<UserType[]>([]);
  const [userSelecionado, setUserSelecionado] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleType | "all">("all");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(
    async (page = 1) => {
      setLoading(true);

      try {
        const response = await getUsers(page);

        setUsers(response.data);
        setTotal(response.meta.total);
      } catch {
        toast.error(t("errors.load"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );
  useEffect(() => {
    loadUsers(paginationModel.page + 1);
  }, [paginationModel, loadUsers]);

  const usersFiltrados = users.filter((u) => {
    const matchSearch = [u.name, u.email, u.cpf].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase()),
    );
    const matchRole = roleFilter === "all" || u.roles?.includes(roleFilter);
    return matchSearch && matchRole;
  });
  const isSearching = search.trim().length > 0 || roleFilter !== "all";

  const rowsExibidos = isSearching ? usersFiltrados : users;

  const totalCount = isSearching ? usersFiltrados.length : total;

  const handleSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
    setSubmitting(true);
    try {
      if (dialogMode === "create") {
        await postUser(data as CreateUserPayload);
        toast.success(t("toast.created"));
      } else {
        await updateUser(userSelecionado!.id, data as UpdateUserPayload);
        toast.success(t("toast.updated"));
      }
      handleDialogClose();
      loadUsers();
    } catch {
      toast.error(
        dialogMode === "create" ? t("errors.create") : t("errors.update"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserType) => {
    if (!confirm(t("confirmDelete", { name: user.name }))) return;
    try {
      await deleteUser(user.id);
      toast.success(t("toast.deleted"));
      loadUsers();
    } catch {
      toast.error(t("errors.delete"));
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
  const columns: GridColDef<UserType>[] = [
    {
      field: "name",
      headerName: t("table.name"),
      flex: 1,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Typography fontWeight={700}>{row.name}</Typography>
      ),
    },
    {
      field: "contact",
      headerName: t("table.contact"),
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: ({ row }) => {
        const perfil = getUserPerfil(row);

        return (
          <Stack spacing={0.3}>
            <Typography variant="body2">{row.email}</Typography>

            {perfil?.celular && (
              <Typography variant="caption" color="text.secondary">
                {perfil.celular}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: "cpf",
      headerName: t("table.cpf"),
      flex: 0.6,
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontFamily: "monospace",
          }}
        >
          {row.cpf
            ? row.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
            : "-"}
        </Typography>
      ),
    },
    {
      field: "role",
      headerName: t("table.role"),
      flex: 0.5,
      minWidth: 140,
      sortable: false,
      renderCell: ({ row }) => {
        const role = getUserRole(row);

        return role ? (
          <Chip
            label={t(`roles.${role}`)}
            color={ROLE_COLOR[role]}
            size="small"
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
            }}
          />
        ) : (
          <Typography color="text.disabled">—</Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: t("table.actions"),
      width: 140,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openView(row);
            }}
          >
            <Icon icon="mdi:eye-outline" width={20} />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
          >
            <Icon icon="mdi:pencil-outline" width={20} />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            <Icon icon="mdi:trash-can-outline" width={20} />
          </IconButton>
        </Stack>
      ),
    },
  ];
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
                {t("title")}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: "0.95rem", maxWidth: "500px" }}
              >
                {t("subtitle")}
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
              {t("newUser")}
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
                  placeholder={t("searchPlaceholder")}
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
                  label={t("filters.role")}
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      height: 44,
                    },
                  }}
                >
                  <MenuItem value="all">{t("filters.allRoles")}</MenuItem>
                  <MenuItem value="admin">{t("roles.admin")}</MenuItem>
                  <MenuItem value="advogado">{t("roles.advogado")}</MenuItem>
                  <MenuItem value="funcionario">
                    {t("roles.funcionario")}
                  </MenuItem>
                </TextField>
              </Stack>

              <Chip
                label={t("registeredCount", { count: total })}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: "12px",
                  height: 32,
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            </Stack>
            <DataGrid
              rows={rowsExibidos}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              autoHeight
              getRowHeight={() => "auto"}
              disableRowSelectionOnClick
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              rowCount={totalCount}
              paginationMode={isSearching ? "client" : "server"}
              sx={{
                border: "none",

                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: `${theme.palette.primary.main}08`,
                  fontWeight: 800,
                },

                "& .MuiDataGrid-row": {
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                },

                "& .MuiDataGrid-cell": {
                  borderColor: theme.palette.divider,
                  alignItems: "center",
                  py: 1,
                },
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 200,
                      gap: 1,
                    }}
                  >
                    <Icon
                      icon="mdi:account-group-outline"
                      width={48}
                      color={theme.palette.text.secondary}
                    />

                    <Typography color="text.secondary" variant="h6">
                      {t("empty.title")}
                    </Typography>

                    <Button
                      variant="outlined"
                      onClick={openCreate}
                      startIcon={<Icon icon="mdi:plus" />}
                      sx={{ borderRadius: "12px" }}
                    >
                      {t("empty.action")}
                    </Button>
                  </Box>
                ),
              }}
            />
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
