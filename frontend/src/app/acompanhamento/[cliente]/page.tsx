import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { cases, listCasesByClient } from "@/data/cases";

const clients = Array.from(new Set(cases.map((item) => item.clientSlug)));

export function generateStaticParams() {
  return clients.map((cliente) => ({ cliente }));
}

export default async function AcompanhamentoPage({
  params,
}: {
  params: Promise<{ cliente: string }>;
}) {
  const { cliente } = await params;
  const clientCases = listCasesByClient(cliente);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="clientes" />

      <Box
        sx={{
          ml: { xs: 0, md: "280px" },
          minWidth: 0,
        }}
      >
        <HeaderDashboard />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Box mb={2.2}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Casos do Cliente
            </Typography>
            <Typography color="text.secondary" fontSize="0.92rem">
              Selecione um caso para abrir o acompanhamento detalhado.
            </Typography>
          </Box>

          <Stack spacing={1.4}>
            {clientCases.length === 0 ? (
              <Paper
                sx={{
                  borderRadius: "12px",
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                }}
              >
                <Typography color="text.secondary">
                  Nenhum caso encontrado para este cliente.
                </Typography>
              </Paper>
            ) : (
              clientCases.map((item) => (
                <Paper
                  key={item.caseSlug}
                  sx={{
                    borderRadius: "12px",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography fontWeight={700} color="text.primary">
                      {item.caseTitle}
                    </Typography>
                    <Typography color="text.secondary" fontSize="0.86rem">
                      Processo: {item.processNumber}
                    </Typography>
                  </Box>

                  <Link
                    href={`/acompanhamento/${cliente}/${item.caseSlug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                      }}
                    >
                      Abrir Caso
                    </Button>
                  </Link>
                </Paper>
              ))
            )}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
