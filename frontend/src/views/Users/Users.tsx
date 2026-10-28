"use client";

import {
  alpha,
  Avatar,
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
import { useRouter } from "next/navigation";
import { getUsers, deleteUser } from "@/api/ApiUsers";
import { formatToastErrorMessage, toast } from "@/utils/toast";
import { UserType, RoleType } from "@/@core/types";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import usePermission from "@/@core/hooks/custom/usePermission";
import AdminResetPasswordModal from "@/components/modals/AdminResetPasswordModal";

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
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("usuarios.criar");
  const canEdit = hasPermission("usuarios.editar");
  const canDelete = hasPermission("usuarios.excluir");
  const t = useTranslations("internal.users");
  const tCommon = useTranslations("common");
  const theme = useTheme();
  const router = useRouter();
  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleType | "all">("all");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(
    async (page = 1, perPage = 10) => {
      setLoading(true);
      try {
        const response = await getUsers({
          page,
          per_page: perPage,
          search: search.trim() || undefined,
          role: roleFilter === "all" ? undefined : roleFilter,
        });
        setUsers(response.data);
        setTotal(response.meta.total);
      } catch (err) {
        toast.error(formatToastErrorMessage(err, t("errors.load")));
      } finally {
        setLoading(false);
      }
    },
    [roleFilter, search, t],
  );
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadUsers(paginationModel.page + 1, paginationModel.pageSize);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [paginationModel, loadUsers]);

  const handleDelete = async () => {
    if (!canDelete || !deleteTarget) return;

    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success(t("toast.deleted"));
      if (users.length === 1 && paginationModel.page > 0) {
        setPaginationModel((current) => ({
          ...current,
          page: current.page - 1,
        }));
      } else {
        loadUsers(paginationModel.page + 1, paginationModel.pageSize);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      const errorCode = err?.response?.data?.error_code;

      if (errorCode === "last_admin") {
        toast.error(t("errors.lastAdmin"));
        setDeleteTarget(null);
      } else {
        toast.error(formatToastErrorMessage(err, t("errors.delete")));
      }
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    if (canCreate) router.push("/users/new");
  };
  const openEdit = (user: UserType) => {
    if (canEdit) router.push(`/users/${user.id}/edit`);
  };
  const openView = (user: UserType) => router.push(`/users/${user.id}`);
  const columns: GridColDef<UserType>[] = [
    {
      field: "avatar",
      headerName: "",
      width: 64,
      minWidth: 64,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Avatar
            src={row.foto_perfil_url ?? undefined}
            sx={{ width: 36, height: 36 }}
          >
            {!row.foto_perfil_url && row.name?.[0]?.toUpperCase()}
          </Avatar>
        </Box>
      ),
    },
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
      minWidth: 120,
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
      width: 160,
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

          {canEdit && <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
          >
            <Icon icon="mdi:pencil-outline" width={20} />
          </IconButton>}
          {canEdit && <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setResetPasswordTarget(row);
            }}
          >
            <Icon icon="mdi:key-outline" width={20} />
          </IconButton>}
          {canDelete && <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
          >
            <Icon icon="mdi:trash-can-outline" width={20} />
          </IconButton>}
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

            {canCreate && <Button
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
              {t("newUser")}
            </Button>}
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPaginationModel((current) => ({ ...current, page: 0 }));
                  }}
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
                  onChange={(e) => {
                    setRoleFilter(e.target.value as RoleType | "all");
                    setPaginationModel((current) => ({ ...current, page: 0 }));
                  }}
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
              rows={users}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              autoHeight
              getRowHeight={() => "auto"}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={total}
              paginationMode="server"
              pageSizeOptions={[10, 25, 50]}
              slotProps={{
                basePagination: {
                  material: {
                    labelRowsPerPage: tCommon("dataGrid.rowsPerPage"),
                  },
                },
              }}
              disableRowSelectionOnClick
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

                    {canCreate && <Button
                      variant="outlined"
                      onClick={openCreate}
                      startIcon={<Icon icon="mdi:plus" />}
                      sx={{ borderRadius: "12px" }}
                    >
                      {t("empty.action")}
                    </Button>}
                  </Box>
                ),
              }}
            />
          </Paper>
        </Container>
      </Box>

      <AdminResetPasswordModal
        open={canEdit && Boolean(resetPasswordTarget)}
        targetUser={resetPasswordTarget}
        onClose={() => setResetPasswordTarget(null)}
      />
      <ConfirmDialog
        open={canDelete && Boolean(deleteTarget)}
        title={tCommon("delete")}
        description={
          deleteTarget
            ? t("confirmDelete", { name: deleteTarget.name })
            : undefined
        }
        confirmText={tCommon("delete")}
        cancelText={tCommon("cancel")}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
