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
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import { CasoType, StatusCaso } from "@/@core/types";
import { deleteCaso, getCasos } from "@/api/apiCasos";
import { formatNumeroProcesso } from "@/@core/format";
import { categoriaNomeParaChave } from "@/constants/categorias";
import ConfirmDialog from "@/components/users/ConfirmDialog";

const STATUS_COLOR: Record<
  StatusCaso,
  "default" | "primary" | "success" | "warning" | "error"
> = {
  aberto: "primary",
  em_andamento: "warning",
  encerrado: "success",
  arquivado: "default",
};

export default function CasosView() {
  const t = useTranslations("internal.cases");
  const tCommon = useTranslations("common");
  const theme = useTheme();
  const router = useRouter();
  const tPracticeAreas = useTranslations("internal.profile.practiceAreas");
  const [casos, setCasos] = useState<CasoType[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CasoType | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const loadCasos = useCallback(
    async (page = 1, perPage = 10) => {
      setLoading(true);
      try {
        const response = await getCasos({ page, per_page: perPage });
        setCasos(response.data);
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
    loadCasos(paginationModel.page + 1, paginationModel.pageSize);
  }, [paginationModel, loadCasos]);

  const casosFiltrados = casos.filter((c) =>
    [
      c.titulo,
      c.numero_processo,
      ...(c.categorias?.map((cat) => cat.nome) ?? []),
    ].some((field) => field?.toLowerCase().includes(search.toLowerCase())),
  );

  const isSearching = search.trim().length > 0;
  const rowsExibidos = isSearching ? casosFiltrados : casos;
  const totalCount = isSearching ? casosFiltrados.length : total;

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteCaso(deleteTarget.id);
      toast.success(t("toast.deleted"));
      loadCasos(paginationModel.page + 1, paginationModel.pageSize);
      setDeleteTarget(null);
    } catch {
      toast.error(t("errors.delete"));
    } finally {
      setDeleting(false);
    }
  };

  const columns: GridColDef<CasoType>[] = [
    {
      flex: 1,
      minWidth: 220,
      field: "titulo",
      headerName: t("table.case"),
      renderCell: ({ row }) => (
        <Stack spacing={0.2}>
          <Typography fontWeight={700} variant="body2" color="text.primary">
            {row.titulo}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: "monospace" }}
          >
            {row.numero_processo
              ? formatNumeroProcesso(row.numero_processo)
              : "-"}
          </Typography>
        </Stack>
      ),
    },
    {
      flex: 0.5,
      minWidth: 140,
      field: "status",
      headerName: t("table.status"),
      align: "center",
      renderCell: ({ row }) => (
        <Chip
          label={t(`status.${row.status}`)}
          color={STATUS_COLOR[row.status]}
          size="small"
          sx={{ borderRadius: "8px", fontWeight: 600 }}
        />
      ),
    },
    {
      flex: 0.7,
      minWidth: 180,
      field: "categorias",
      headerName: t("table.area"),
      renderCell: ({ row }) => {
        const nomesTraduzidos =
          row.categorias
            ?.map((c) => {
              const chave = categoriaNomeParaChave[c.nome];
              return chave ? tPracticeAreas(chave) : c.nome;
            })
            .join(", ") || "-";

        return (
          <Typography variant="body2" color="text.secondary">
            {nomesTraduzidos}
          </Typography>
        );
      },
    },
    {
      flex: 0.5,
      minWidth: 140,
      field: "data_abertura",
      headerName: t("table.openingDate"),
      renderCell: ({ row }) => (
        <Typography variant="body2" color="text.secondary">
          {row.data_abertura || "-"}
        </Typography>
      ),
    },
    {
      flex: 0,
      width: 130,
      field: "actions",
      headerName: t("table.actions"),
      sortable: false,
      align: "left",
      headerAlign: "center",
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/casos/${row.id}`);
            }}
            sx={{ "&:hover": { color: "info.main" } }}
          >
            <Icon icon="mdi:eye-outline" width={20} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/casos/${row.id}/editar`);
            }}
            sx={{ "&:hover": { color: "warning.main" } }}
          >
            <Icon icon="mdi:pencil-outline" width={20} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            sx={{ "&:hover": { color: "error.main" } }}
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
      <SidebarDashboard activeKey="casos" />

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
              <Typography
                color="text.secondary"
                sx={{ fontSize: "0.95rem", maxWidth: "500px" }}
              >
                {t("subtitle")}
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => router.push("/casos/novo")}
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
              {t("newCase")}
            </Button>
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
                onChange={(e) => setSearch(e.target.value)}
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
                label={t("registeredCount", { count: totalCount })}
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
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              rowCount={totalCount}
              paginationMode={isSearching ? "client" : "server"}
              disableRowSelectionOnClick
              slotProps={{
                pagination: {
                  labelRowsPerPage: "Linhas por página:",
                },
              }}
              sx={{
                border: "none",
                "--DataGrid-overlayHeight": "220px",
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: `${theme.palette.primary.main}08`,
                  fontWeight: 800,
                },
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
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
                      height: "100%",
                      gap: 1,
                    }}
                  >
                    <Icon
                      icon="mdi:briefcase-outline"
                      width={48}
                      color={theme.palette.text.secondary}
                    />
                    <Typography color="text.secondary" variant="h6">
                      {t("empty.title")}
                    </Typography>
                    {!isSearching && (
                      <Button
                        variant="outlined"
                        onClick={() => router.push("/casos/novo")}
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
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title={tCommon("delete")}
          description={
            deleteTarget
              ? t("confirmDelete", { title: deleteTarget.titulo })
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
