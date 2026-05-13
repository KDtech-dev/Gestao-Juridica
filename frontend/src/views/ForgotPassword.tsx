"use client";

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { handleRequest } from "@/configs/handleRequest";
import { getAxios } from "@/configs/axios";
import Link from "next/link";
import { formatToastErrorMessage, toast } from "@/utils/toast";

const labels = {
  title: "Recuperar senha",
  subtitle: "Informe seu e-mail para receber o link de redefinição.",
  email: "E-mail",
  send: "Enviar link",
  back: "Voltar ao login",
  success: "Se o e-mail existir, enviaremos um link para redefinir a senha.",
  error: "Não foi possível enviar o e-mail. Tente novamente.",
} as const;

export default function ForgotPasswordView() {
  const t = labels;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const { error } = await handleRequest(() =>
      getAxios().post("/auth/forgot-password", { email }),
    );

    if (error) {
      toast.error(formatToastErrorMessage(error, t.error));
    } else {
      toast.success(t.success);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 3,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {t.title}
            </Typography>
            <Typography color="text.secondary" fontSize="0.9rem">
              {t.subtitle}
            </Typography>
          </Box>

          <TextField
            label={t.email}
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!email || loading}
            sx={{
              textTransform: "none",
              py: 1.05,
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            {t.send}
          </Button>

          <Button component={Link} href="/login" sx={{ textTransform: "none" }}>
            {t.back}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
