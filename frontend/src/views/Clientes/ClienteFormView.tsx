"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { ClienteType, CasoType, StatusCaso } from "@/@core/types";
import { formatCpfCnpj } from "@/@core/format";
import { getClienteById, updateCliente } from "@/api/ApiClientes";
import { getCasos } from "@/api/apiCasos";
import { CreateClientePayload } from "@/schemas/ClienteSchema";
import { HeaderDashboard } from "@/components/HeaderADM";
import { Icon } from "@/components/AppIcon";
import { SidebarDashboard } from "@/components/Sidebar";
import { getApiErrorMessage } from "@/configs/ApiError";
import { toast } from "@/utils/toast";

type Props = {
  mode: "create" | "edit" | "view";
  clienteId?: string;
};

const STATUS_COLOR: Record<
  StatusCaso,
  "default" | "primary" | "success" | "warning" | "error"
> = {
  aberto: "primary",
  em_andamento: "warning",
  encerrado: "success",
  arquivado: "default",
};

function detailValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

export default function ClienteFormView({ mode, clienteId }: Props) {
  const [cliente, setCliente] = useState<ClienteType | null>(null);
  const [casos, setCasos] = useState<CasoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateClientePayload>(
    {} as CreateClientePayload,
  );
  const theme = useTheme();
  const t = useTranslations("internal.clients");
  const router = useRouter();
  const isEdit = mode === "edit";

  const loadCliente = useCallback(async () => {
    if (!clienteId) {
      toast.error(t("errors.loadClient"));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [clienteResponse, casosResponse] = await Promise.all([
        getClienteById(clienteId),
        getCasos({ page: 1, per_page: 999 }),
      ]);

      setCliente(clienteResponse);
      setForm({
        name: clienteResponse.name ?? "",
        cpf_cnpj: clienteResponse.cpf_cnpj ?? "",
        email: clienteResponse.email ?? "",
        telefone: clienteResponse.telefone ?? "",
        data_nascimento: clienteResponse.data_nascimento ?? "",
      });

      const casoDoCliente = casosResponse.data.filter((caso) =>
        caso.clientes?.some((c) => String(c.id) === String(clienteId)),
      );
      setCasos(casoDoCliente);
    } catch {
      toast.error(t("errors.loadClient"));
    } finally {
      setLoading(false);
    }
  }, [clienteId, t]);

  useEffect(() => {
    loadCliente();
  }, [loadCliente]);

  const handleEditSubmit = async () => {
    if (!cliente) return;
    setSubmitting(true);
    try {
      const updated = await updateCliente(cliente.id, form);
      setCliente(updated);
      toast.success(t("toast.updated"));
      router.push(`/clientes/${clienteId}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t("errors.update"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="clientes" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3.5}>
            <IconButton onClick={() => router.push("/clientes")}>
              <Icon icon="mdi:arrow-left" width={22} />
            </IconButton>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              {isEdit
                ? t("detail.editTitle", { name: cliente?.name ?? "" })
                : cliente?.name || t("detail.fallbackTitle")}
            </Typography>
          </Stack>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: `1px solid ${theme.palette.divider}`,
                p: 3,
              }}
            >
              <Typography fontWeight={700} mb={2}>
                {t("detail.infoTitle")}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 2,
                }}
              >
                {isEdit ? (
                  <>
                    <EditItem
                      label={t("dialog.fields.name")}
                      value={form.name}
                      onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                    />
                    <EditItem
                      label={t("dialog.fields.document")}
                      value={form.cpf_cnpj}
                      onChange={(v) => setForm((f) => ({ ...f, cpf_cnpj: v }))}
                    />
                    <EditItem
                      label={t("dialog.fields.email")}
                      value={form.email}
                      onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    />
                    <EditItem
                      label={t("dialog.fields.phone")}
                      value={form.telefone}
                      onChange={(v) => setForm((f) => ({ ...f, telefone: v }))}
                    />
                    <EditItem
                      label={t("dialog.fields.birthDate")}
                      value={form.data_nascimento}
                      onChange={(v) =>
                        setForm((f) => ({ ...f, data_nascimento: v }))
                      }
                    />
                  </>
                ) : (
                  <>
                    <DetailItem
                      label={t("dialog.fields.name")}
                      value={cliente?.name}
                    />
                    <DetailItem
                      label={t("dialog.fields.document")}
                      value={formatCpfCnpj(cliente?.cpf_cnpj || "")}
                    />
                    <DetailItem
                      label={t("dialog.fields.email")}
                      value={cliente?.email}
                    />
                    <DetailItem
                      label={t("dialog.fields.phone")}
                      value={cliente?.telefone}
                    />
                    <DetailItem
                      label={t("dialog.fields.birthDate")}
                      value={cliente?.data_nascimento}
                    />
                    <DetailItem
                      label={t("detail.fields.createdAt")}
                      value={cliente?.created_at}
                    />
                  </>
                )}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: `1px solid ${theme.palette.divider}`,
                p: 3,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={2}
              >
                <Typography fontWeight={700}>
                  {t("detail.cases.title")}
                </Typography>
                <Chip
                  label={t("detail.cases.count", { count: casos.length })}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: "10px" }}
                />
              </Stack>

              <Stack divider={<Divider />}>
                {casos.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 1 }}>
                    {t("detail.cases.empty")}
                  </Typography>
                ) : (
                  casos.map((caso) => (
                    <Box
                      key={caso.id}
                      sx={{
                        py: 2,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                        gap: 1.5,
                        alignItems: "center",
                        "&:hover": { bgcolor: "action.hover", mx: -3, px: 3 },
                      }}
                    >
                      <Stack spacing={0.8}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={1}
                        >
                          <Typography color="text.primary" fontWeight={700}>
                            {caso.titulo || t("detail.cases.untitled")}
                          </Typography>
                          <Chip
                            label={caso.status}
                            color={STATUS_COLOR[caso.status]}
                            size="small"
                            sx={{ borderRadius: "10px" }}
                          />
                        </Stack>

                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={{ xs: 0.4, sm: 2 }}
                          color="text.secondary"
                        >
                          <Typography fontSize="0.86rem">
                            {t("detail.cases.process")}:{" "}
                            {detailValue(caso.numero_processo)}
                          </Typography>
                          <Typography fontSize="0.86rem">
                            {t("detail.cases.area")}:{" "}
                            {caso.categorias?.map((c) => c.nome).join(", ") ||
                              "-"}
                          </Typography>
                          <Typography fontSize="0.86rem">
                            {t("detail.cases.lawyer")}:{" "}
                            {detailValue(caso.advogado?.name)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Button
                        component={Link}
                        href={`/casos/${caso.id}`}
                        variant="outlined"
                        endIcon={<Icon icon="mdi:arrow-right" width={18} />}
                        sx={{
                          borderRadius: "12px",
                          justifySelf: { xs: "stretch", md: "end" },
                          textTransform: "none",
                        }}
                      >
                        {t("detail.cases.open")}
                      </Button>
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>

            {isEdit && (
              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                  variant="outlined"
                  disabled={submitting}
                  onClick={() => router.push(`/clientes/${clienteId}`)}
                >
                  {t("detail.cancel")}
                </Button>
                <Button
                  variant="contained"
                  disabled={submitting}
                  onClick={handleEditSubmit}
                >
                  {submitting ? t("detail.saving") : t("detail.save")}
                </Button>
              </Stack>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        px: 1.6,
        py: 1.35,
        minHeight: 72,
      }}
    >
      <Typography
        color="text.secondary"
        fontSize="0.75rem"
        fontWeight={700}
        textTransform="uppercase"
      >
        {label}
      </Typography>
      <Typography color="text.primary" fontWeight={600} sx={{ mt: 0.4 }}>
        {value && value.trim() ? value : "-"}
      </Typography>
    </Box>
  );
}

function EditItem({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      fullWidth
      label={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
