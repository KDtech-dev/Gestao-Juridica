"use client";
import { Box, Container, Typography, Stack, Button } from "@mui/material";
import { Icon } from "@iconify/react";
export function Footer() {
  const mensagem = `Olá, gostaria de agendar uma consulta jurídica.`;
  const telefone = "5533999377986";

  return (
    <Box
      sx={{
        background: "linear-gradient(to right, #0f172a, #1e293b, #1e3a8a)",
        color: "#fff",
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ py: 10, px: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={6}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box maxWidth={400} sx={{ color: "#fff" }}>
            <Typography variant="h4" fontWeight="bold" mb={2}>
              Agende sua primeira consulta jurídica sem custo.
            </Typography>

            <Typography mb={3}>
              Oferecemos consultoria especializada na análise de cada processo
              com a primeira consulta sem custo.
            </Typography>

            <Button
              component="a"
              href={`https://wa.me/${telefone}?text=${mensagem}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<Icon icon="mdi:whatsapp" />}
              sx={{
                bgcolor: "#05a13e",
                "&:hover": { bgcolor: "#05a13ec5" },
              }}
            >
              Conversar pelo WhatsApp
            </Button>
          </Box>
        </Stack>
      </Container>

      <Container maxWidth="xl" disableGutters sx={{ pb: 6, px: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={6}
          justifyContent="space-between"
        >
          <Box>
            <Typography fontWeight="bold">Central jurídica</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Advocacia & Consultoria Jurídica
            </Typography>
          </Box>

          <Box maxWidth={300}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Direito tributário e empresarial com atuação especializada.
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2">Minas Gerais</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Rodovia BR-367, KM 07, S/N, Zona Rural, Almenara, CEP: 39900-000
            </Typography>
          </Box>
        </Stack>

        <Box textAlign="center" mt={6}>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.5,
            }}
          >
            © 2026 Central jurídica - Todos os direitos reservados
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
