"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import { Icon } from "@iconify/react";
export function Footer() {
  const inputStyle = {
    "& .MuiInputBase-input": {
      color: "#fff",
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#2563eb",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.3)",
      },
      "&:hover fieldset": {
        borderColor: "#fff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2563eb",
      },
    },
  };
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    empresa: "",
    mensagem: "",
  });
  const mensagem = `Olá, gostaria de agendar uma consulta jurídica.`;
  const telefone = "5533999377986";
  const handleChange = (campo: string, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };
  const montarMensagem = () => {
    return encodeURIComponent(
      `Olá, gostaria de agendar uma consulta jurídica.\n\n` +
        `Nome: ${form.nome}\n` +
        `Telefone: ${form.telefone}\n` +
        `E-mail: ${form.email}\n` +
        `Empresa: ${form.empresa}\n` +
        `Mensagem: ${form.mensagem}`,
    );
  };
  const enviarWhatsApp = () => {
    const mensagem = montarMensagem();

    const url = `https://wa.me/${telefone}?text=${mensagem}`;

    window.open(url, "_blank");
  };
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
              endIcon={<Icon icon="mdi:whatsapp" />}
              sx={{
                bgcolor: "#a16207",
                "&:hover": { bgcolor: "#854d0e" },
              }}
            >
              Conversar pelo WhatsApp
            </Button>
          </Box>

          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Nome"
                fullWidth
                size="small"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                sx={inputStyle}
              />
              <TextField
                label="Telefone"
                fullWidth
                size="small"
                value={form.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                sx={inputStyle}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="E-mail"
                fullWidth
                size="small"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                sx={inputStyle}
              />
              <TextField
                label="Empresa"
                fullWidth
                size="small"
                value={form.empresa}
                onChange={(e) => handleChange("empresa", e.target.value)}
                sx={inputStyle}
              />
            </Stack>

            <TextField
              label="Como podemos te ajudar?"
              multiline
              rows={3}
              fullWidth
              value={form.mensagem}
              onChange={(e) => handleChange("mensagem", e.target.value)}
              sx={inputStyle}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={enviarWhatsApp}
              sx={{
                bgcolor: "#0f172a",
                color: "text.secondary",
                "&:hover": { bgcolor: "#020617" },
              }}
            >
              Conversar pelo WhatsApp
            </Button>
          </Stack>
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
