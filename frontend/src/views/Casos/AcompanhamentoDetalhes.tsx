"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Icon as AppIcon } from "@/components/AppIcon";

type AcompanhamentoDetalhesProps = {
  clientSlug: string;
  clientName: string;
  caseTitle: string;
  processNumber: string;
  status: string;
  nextHearing: string;
  lawyerName: string;
};

export default function AcompanhamentoDetalhes({
  clientSlug,
  clientName,
  caseTitle,
  processNumber,
  status,
  nextHearing,
  lawyerName,
}: AcompanhamentoDetalhesProps) {
  const statusColor =
    status === "Concluído"
      ? "success"
      : status === "Pendente"
        ? "warning"
        : "info";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={2.5}>
          <Box>
            <Button
              component={Link}
              href={`/tracking/${clientSlug}`}
              startIcon={<AppIcon icon="mdi:arrow-left" />}
              sx={{
                textTransform: "none",
                mb: 2,
              }}
            >
              Voltar para os casos
            </Button>

            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 0.6 }}
            >
              Acompanhamento do Caso
            </Typography>

            <Typography color="text.secondary">
              Consulte as principais informações do seu processo.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: { xs: 2.5, md: 3.5 },
                py: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="text.primary"
                  >
                    {caseTitle}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Cliente: {clientName}
                  </Typography>
                </Box>

                <Chip
                  label={status}
                  color={statusColor}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={2}>
                <InfoRow
                  icon="mdi:file-document-outline"
                  label="Número do processo"
                  value={processNumber}
                />

                <InfoRow
                  icon="mdi:account-outline"
                  label="Advogado responsável"
                  value={lawyerName}
                />

                <InfoRow
                  icon="mdi:calendar-clock"
                  label="Próxima audiência"
                  value={nextHearing}
                />
              </Stack>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Typography fontWeight={700} color="text.primary" mb={0.7}>
              Informações do acompanhamento
            </Typography>

            <Typography color="text.secondary" fontSize="0.92rem">
              Esta área apresenta as informações disponíveis sobre o
              andamento do caso. Novas movimentações poderão ser
              disponibilizadas pelo escritório conforme forem registradas.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        p: 1.5,
        borderRadius: "12px",
        bgcolor: "action.hover",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: "10px",
          bgcolor: "background.paper",
        }}
      >
        <AppIcon icon={icon} />
      </Box>

      <Box minWidth={0}>
        <Typography
          color="text.secondary"
          fontSize="0.78rem"
          fontWeight={600}
        >
          {label}
        </Typography>

        <Typography
          color="text.primary"
          fontWeight={600}
          sx={{ wordBreak: "break-word" }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
