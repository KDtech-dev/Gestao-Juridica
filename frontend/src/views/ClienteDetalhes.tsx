"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ClienteType } from "@/@core/types";
import { formatCpfCnpj } from "@/@core/format";
import { getClienteById, updateCliente } from "@/api/ApiClientes";
import { CreateClientePayload } from "@/schemas/ClienteSchema";
import DialogCliente from "@/components/DialogCliente";
import { HeaderDashboard } from "@/components/HeaderADM";
import { Icon } from "@/components/AppIcon";
import { SidebarDashboard } from "@/components/Sidebar";
import { getApiErrorMessage } from "@/configs/ApiError";
import { LegalCase, listCases } from "@/services/caseService";
import { toast } from "@/utils/toast";

type Props = {
  clienteId: string;
};

function detailValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

function statusColor(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("closed") || normalized.includes("finalizado")) {
    return "default";
  }

  if (normalized.includes("pending") || normalized.includes("pendente")) {
    return "warning";
  }

  return "success";
}

export default function ClienteDetalhesView({ clienteId }: Props) {
  const [cliente, setCliente] = useState<ClienteType | null>(null);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();
  const t = useTranslations("internal.clients");

  const loadCliente = useCallback(async () => {
    if (!clienteId) {
      toast.error(t("errors.loadClient"));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [clienteResponse, casesResponse] = await Promise.all([
        getClienteById(clienteId),
        listCases({ clientId: clienteId, limit: 100 }),
      ]);

      setCliente(clienteResponse);
    } catch {
      toast.error(t("errors.loadClient"));
    } finally {
      setLoading(false);
    }
  }, [clienteId, t]);

  useEffect(() => {
    loadCliente();
  }, [loadCliente]);

  const handleEditSubmit = async (data: CreateClientePayload) => {
    if (!cliente) return;

    setSubmitting(true);

    try {
      const updated = await updateCliente(cliente.id, data);
      setCliente(updated);
      setEditOpen(false);
      toast.success(t("toast.updated"));
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t("errors.update"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <SidebarDashboard activeKey="clientes" />

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
                <Button
                  component={Link}
                  href="/clientes"
                  startIcon={<Icon icon="mdi:arrow-left" width={18} />}
                  sx={{
                    mb: 1,
                    px: 0,
                    color: "text.secondary",
                    textTransform: "none",
                    "&:hover": { bgcolor: "transparent", color: "primary.main" },
                  }}
                >
                  {t("detail.back")}
                </Button>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  {loading
                    ? t("detail.loadingTitle")
                    : cliente?.name || t("detail.fallbackTitle")}
                </Typography>
                <Typography color="text.secondary" fontSize="0.95rem">
                  {t("detail.subtitle")}
                </Typography>
              </Box>

              {cliente && (
                <Button
                  variant="outlined"
                  onClick={() => setEditOpen(true)}
                  startIcon={<Icon icon="mdi:pencil-outline" width={18} />}
                  sx={{
                    borderRadius: "12px",
                    borderColor: "divider",
                    textTransform: "none",
                    minHeight: 42,
                  }}
                >
                  {t("detail.edit")}
                </Button>
              )}
            </Stack>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.2 }}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: `${theme.palette.primary.main}14`,
                      color: "primary.main",
                    }}
                  >
                    <Icon icon="mdi:account-outline" width={24} />
                  </Box>
                  <Box>
                    <Typography fontWeight={800} color="text.primary">
                      {t("detail.infoTitle")}
                    </Typography>
                    <Typography color="text.secondary" fontSize="0.86rem">
                      {t("detail.infoSubtitle")}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                  gap: 2,
                }}
              >
                {loading ? (
                  [...Array(6)].map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={72} />
                  ))
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
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2.2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography fontWeight={800} color="text.primary">
                    {t("detail.cases.title")}
                  </Typography>
                  <Typography color="text.secondary" fontSize="0.86rem">
                    {t("detail.cases.subtitle")}
                  </Typography>
                </Box>

                <Chip
                  label={t("detail.cases.count", { count: cases.length })}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: "10px" }}
                />
              </Stack>

              <Stack divider={<Divider />} sx={{ minHeight: 92 }}>
                {loading ? (
                  [...Array(3)].map((_, index) => (
                    <Box key={index} sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
                      <Skeleton width="45%" />
                      <Skeleton width="70%" />
                    </Box>
                  ))
                ) : cases.length === 0 ? (
                  <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
                    <Typography color="text.secondary">
                      {t("detail.cases.empty")}
                    </Typography>
                  </Box>
                ) : (
                  cases.map((caseItem) => (
                    <CaseListItem
                      key={caseItem.id}
                      caseItem={caseItem}
                      labels={{
                        untitled: t("detail.cases.untitled"),
                        process: t("detail.cases.process"),
                        area: t("detail.cases.area"),
                        lawyer: t("detail.cases.lawyer"),
                        open: t("detail.cases.open"),
                      }}
                    />
                  ))
                )}
              </Stack>
            </Paper>
          </Stack>
        </Container>

        <DialogCliente
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEditSubmit}
          submitting={submitting}
          mode="edit"
          cliente={cliente}
        />
      </Box>
    </Box>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
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
        {detailValue(value)}
      </Typography>
    </Box>
  );
}

function CaseListItem({
  caseItem,
  labels,
}: {
  caseItem: LegalCase;
  labels: {
    untitled: string;
    process: string;
    area: string;
    lawyer: string;
    open: string;
  };
}) {
  const href =
    caseItem.clientSlug && caseItem.caseSlug
      ? `/acompanhamento/${caseItem.clientSlug}/${caseItem.caseSlug}`
      : "/cases";

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
        gap: 1.5,
        alignItems: "center",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <Stack spacing={0.8}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <Typography color="text.primary" fontWeight={800}>
            {caseItem.title || labels.untitled}
          </Typography>
          <Chip
            label={caseItem.status}
            color={statusColor(caseItem.status)}
            size="small"
            sx={{ borderRadius: "10px", alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.4, sm: 2 }}
          color="text.secondary"
        >
          <Typography fontSize="0.86rem">
            {labels.process}: {detailValue(caseItem.processNumber)}
          </Typography>
          <Typography fontSize="0.86rem">
            {labels.area}: {detailValue(caseItem.practiceArea)}
          </Typography>
          <Typography fontSize="0.86rem">
            {labels.lawyer}: {detailValue(caseItem.lawyerName)}
          </Typography>
        </Stack>
      </Stack>

      <Button
        component={Link}
        href={href}
        variant="outlined"
        endIcon={<Icon icon="mdi:arrow-right" width={18} />}
        sx={{
          borderRadius: "12px",
          borderColor: "divider",
          justifySelf: { xs: "stretch", md: "end" },
          textTransform: "none",
        }}
      >
        {labels.open}
      </Button>
    </Box>
  );
}
