"use client";

import {
  Box,
  Chip,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActivityLogType, getActivityLogs } from "@/api/ActivityLogs";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { Icon } from "@/components/AppIcon";
import { formatToastErrorMessage, toast } from "@/utils/toast";

const MODULES = ["users", "clients", "cases", "appointments", "publications", "access_control", "auth"];
const EVENTS = ["created", "updated", "deleted", "signed_in", "signed_out", "role_changed", "permissions_updated", "permission_granted", "permission_revoked"];

const DATE_LOCALES: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

function formatActivityDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(DATE_LOCALES[locale] ?? locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function ActivityLogsView() {
  const t = useTranslations("internal.activityLogs");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const theme = useTheme();
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [module, setModule] = useState("");
  const [event, setEvent] = useState("");
  const [actor, setActor] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getActivityLogs({
        page: pagination.page + 1,
        per_page: pagination.pageSize,
        date: date || undefined,
        module: module || undefined,
        event: event || undefined,
        actor: actor.trim() || undefined,
        search: search.trim() || undefined,
      });
      setLogs(result.data);
      setTotal(result.meta.total);
    } catch (error) {
      toast.error(formatToastErrorMessage(error, t("errors.load")));
    } finally {
      setLoading(false);
    }
  }, [actor, date, event, module, pagination.page, pagination.pageSize, search, t]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadLogs(), 250);
    return () => window.clearTimeout(timeout);
  }, [loadLogs]);

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPagination((current) => ({ ...current, page: 0 }));
  };

  const columns: GridColDef<ActivityLogType>[] = [
    {
      field: "created_at",
      headerName: t("table.date"),
      width: 160,
      valueFormatter: (value) => formatActivityDate(String(value ?? ""), locale),
    },
    {
      field: "actor_name",
      headerName: t("table.actor"),
      minWidth: 170,
      flex: 0.8,
    },
    {
      field: "module",
      headerName: t("table.module"),
      width: 150,
      valueFormatter: (value) => t(`modules.${String(value)}`),
    },
    {
      field: "event",
      headerName: t("table.action"),
      width: 165,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          variant="outlined"
          label={t(`events.${row.event}`)}
          color={row.event === "deleted" ? "error" : row.event.includes("permission") ? "warning" : "default"}
        />
      ),
    },
    {
      field: "subject_label",
      headerName: t("table.item"),
      minWidth: 180,
      flex: 1,
      valueGetter: (_value, row) => row.subject_label || row.subject_type || "—",
    },
    {
      field: "changed_fields",
      headerName: t("table.changedFields"),
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" gap={0.5} flexWrap="wrap" py={0.5}>
          {row.changed_fields.slice(0, 4).map((field) => (
            <Chip key={field} label={field.replaceAll("_", " ")} size="small" />
          ))}
          {row.changed_fields.length > 4 && (
            <Chip label={`+${row.changed_fields.length - 4}`} size="small" variant="outlined" />
          )}
        </Stack>
      ),
    },
    {
      field: "ip_address",
      headerName: t("table.ip"),
      width: 140,
      valueGetter: (value) => value || "—",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <SidebarDashboard activeKey="admin-logs" />
      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={1} mb={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {t("title")}
              </Typography>
              <Typography color="text.secondary" mt={0.6}>{t("subtitle")}</Typography>
            </Box>
            <Chip icon={<Icon icon="mdi:counter" width={18} />} label={t("count", { count: total })} variant="outlined" />
          </Stack>

          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              alignItems={{ xs: "stretch", lg: "center" }}
              gap={1.25}
              sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: `${theme.palette.primary.main}08` }}
            >
              <TextField
                type="date"
                label={t("filters.day")}
                value={date}
                onChange={(e) => updateFilter(setDate)(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { lg: 165 } }}
              />
              <TextField
                select
                label={t("filters.module")}
                value={module}
                onChange={(e) => updateFilter(setModule)(e.target.value)}
                size="small"
                sx={{ minWidth: { lg: 175 } }}
              >
                <MenuItem value="">{t("filters.allModules")}</MenuItem>
                {MODULES.map((value) => <MenuItem key={value} value={value}>{t(`modules.${value}`)}</MenuItem>)}
              </TextField>
              <TextField
                select
                label={t("filters.action")}
                value={event}
                onChange={(e) => updateFilter(setEvent)(e.target.value)}
                size="small"
                sx={{ minWidth: { lg: 175 } }}
              >
                <MenuItem value="">{t("filters.allActions")}</MenuItem>
                {EVENTS.map((value) => <MenuItem key={value} value={value}>{t(`events.${value}`)}</MenuItem>)}
              </TextField>
              <TextField
                label={t("filters.actor")}
                placeholder={t("filters.actorPlaceholder")}
                value={actor}
                onChange={(e) => updateFilter(setActor)(e.target.value)}
                size="small"
                sx={{ minWidth: { lg: 190 } }}
              />
              <TextField
                label={t("filters.search")}
                placeholder={t("filters.searchPlaceholder")}
                value={search}
                onChange={(e) => updateFilter(setSearch)(e.target.value)}
                size="small"
                sx={{ minWidth: { lg: 220 }, flex: 1 }}
              />
            </Stack>

            <DataGrid
              rows={logs}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              autoHeight
              getRowHeight={() => "auto"}
              paginationModel={pagination}
              onPaginationModelChange={setPagination}
              rowCount={total}
              paginationMode="server"
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
                border: 0,
                "& .MuiDataGrid-columnHeaders": { bgcolor: `${theme.palette.primary.main}08`, fontWeight: 800 },
                "& .MuiDataGrid-cell": { py: 1 },
              }}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
