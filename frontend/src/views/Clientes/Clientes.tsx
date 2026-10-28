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
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { postCliente, deleteCliente, getClientes } from "@/api/ApiClientes";
import { toast } from "@/utils/toast";
import { ClienteType } from "@/@core/types";
import { CreateClientePayload } from "@/schemas/ClienteSchema";
import DialogCliente from "@/components/DialogCliente";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import { formatCpfCnpj, formatDateFromApi } from "@/@core/format";
import { useApiErrorTranslator } from "@/utils/translateApiErrors";
import { useDebounce } from "@/@core/hooks/custom/useDebounce";
import usePermission from "@/@core/hooks/custom/usePermission";

export default function ClientesView() {
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("clientes.criar");
  const canEdit = hasPermission("clientes.editar");
  const canDelete = hasPermission("clientes.excluir");
  const translateError = useApiErrorTranslator();
  const locale = useLocale();
  const t = useTranslations("internal.clients");
  const tCommon = useTranslations("common");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClienteType | null>(null);
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebounce(search, 300);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const theme = useTheme();
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getClientes({
      page: paginationModel.page + 1,
      perPage: paginationModel.pageSize,
      search: debouncedSearch,
      signal: controller.signal,
    })
      .then(({ data, meta }) => {
        setClientes(data);
        setTotal(meta.total);
      })
      .catch(() => {
        if (!controller.signal.aborted) toast.error(t("errors.load"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [paginationModel, debouncedSearch, refreshKey, t]);

  const isSearching = search.trim().length > 0;

  const handleSubmit = async (data: CreateClientePayload) => {
    if (!canCreate) return;
    setSubmitting(true);
    try {
      await postCliente(data);
      toast.success(t("toast.created"));
      setDialogOpen(false);
      setPaginationModel((current) => ({ ...current, page: 0 }));
      setRefreshKey((current) => current + 1);
    } catch (err) {
      toast.error(translateError(err));
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!canDelete || !deleteTarget) return;

    setDeleting(true);
    try {
      await deleteCliente(deleteTarget.id);
      toast.success(t("toast.deleted"));
      if (clientes.length === 1 && paginationModel.page > 0) {
        setPaginationModel((current) => ({ ...current, page: current.page - 1 }));
      } else {
        setRefreshKey((current) => current + 1);
      }
      setDeleteTarget(null);
    } catch {
      toast.error(t("errors.delete"));
    } finally {
      setDeleting(false);
    }
  };

  const columns: GridColDef<ClienteType>[] = [
    {
      flex: 1,
      minWidth: 200,
      field: "name",
      headerName: t("table.clientName"),
      renderCell: ({ row }) => (
        <Typography fontWeight={700} variant="body2">
          {row.name}
        </Typography>
      ),
    },
    {
      flex: 1,
      minWidth: 200,
      field: "email",
      headerName: t("table.contactDetails"),
      renderCell: ({ row }) => (
        <Stack spacing={0.3}>
          <Typography variant="body2" fontWeight={500}>
            {row.email || "-"}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Icon
              icon="mdi:phone"
              width={13}
              color={theme.palette.text.secondary}
            />
            <Typography variant="caption" color="text.secondary">
              {row.telefone || "-"}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      flex: 0.7,
      minWidth: 160,
      field: "cpf_cnpj",
      headerName: t("table.document"),
      renderCell: ({ row }) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: "monospace" }}
        >
          {formatCpfCnpj(row.cpf_cnpj || "-")}
        </Typography>
      ),
    },
    {
      flex: 0.5,
      minWidth: 140,
      field: "data_nascimento",
      headerName: t("table.birthDate"),
      renderCell: ({ row }) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateFromApi(row.data_nascimento, locale)}
        </Typography>
      ),
    },
    {
      flex: 0,
      width: 130,
      field: "actions",
      headerName: t("table.actions"),
      sortable: false,
      align: "right",
      headerAlign: "right",
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={() => router.push(`/clientes/${row.id}`)}
            sx={{ "&:hover": { color: "info.main" } }}
          >
            <Icon icon="mdi:eye-outline" width={20} />
          </IconButton>
          {canEdit && (
            <IconButton
              size="small"
              onClick={() => router.push(`/clientes/${row.id}/editar`)}
              sx={{ "&:hover": { color: "warning.main" } }}
            >
              <Icon icon="mdi:pencil-outline" width={20} />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={() => setDeleteTarget(row)}
              sx={{ "&:hover": { color: "error.main" } }}
            >
              <Icon icon="mdi:trash-can-outline" width={20} />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

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
            gap={2}
            mb={3.5}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {t("title")}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "0.95rem" }}>
                {t("subtitle")}
              </Typography>
            </Box>

            {canCreate && <Button
              variant="contained"
              onClick={() => setDialogOpen(true)}
              startIcon={<Icon icon="mdi:plus" width={20} />}
              sx={{
                borderRadius: "14px",
                px: 2.5,
                height: 44,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              {t("newClient")}
            </Button>}
          </Stack>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
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
                bgcolor: `${theme.palette.primary.main}08`,
              }}
            >
              <TextField
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPaginationModel((current) => ({ ...current, page: 0 }));
                }}
                size="small"
                sx={{
                  width: { xs: "100%", sm: 450 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    height: 44,
                    bgcolor: "background.paper",
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
              rows={clientes}
              rowCount={total}
              paginationMode="server"
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              autoHeight
              getRowHeight={() => "auto"}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              slotProps={{
                basePagination: {
                  material: {
                    labelRowsPerPage: tCommon("dataGrid.rowsPerPage"),
                  },
                },
              }}
              sx={{
                border: "none",
                "--DataGrid-overlayHeight": "220px",
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: `${theme.palette.primary.main}08`,
                  fontWeight: 800,
                },
                "& .MuiDataGrid-row:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
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
                      height: "100%",
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
                    {!isSearching && canCreate && (
                      <Button
                        variant="outlined"
                        onClick={() => setDialogOpen(true)}
                        startIcon={<Icon icon="mdi:plus" />}
                        sx={{ borderRadius: "12px" }}
                      >
                        {t("empty.action")}
                      </Button>
                    )}
                  </Box>
                ),
              }}
            />
          </Paper>
        </Container>

        <DialogCliente
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
          mode="create"
          cliente={null}
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
    </Box>
  );
}
