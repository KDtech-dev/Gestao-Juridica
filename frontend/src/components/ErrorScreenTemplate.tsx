"use client";

import { Icon } from "@iconify/react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";

type ErrorScreenTemplateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function ErrorScreenTemplate({
  title = "Não foi possível carregar esta tela",
  description = "A ação solicitada não foi concluída como esperado. Tente novamente ou volte para a página inicial.",
  actionLabel = "Tentar novamente",
  onAction,
}: ErrorScreenTemplateProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            px: { xs: 1, sm: 2 },
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 72,
              height: 72,
              mx: "auto",
              mb: 3,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: "error.main",
              bgcolor: "rgba(211, 47, 47, 0.1)",
              border: "1px solid",
              borderColor: "rgba(211, 47, 47, 0.22)",
            }}
          >
            <Icon icon="mdi:alert-circle-outline" width={38} />
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "1.55rem", sm: "1.9rem" },
              lineHeight: 1.2,
              fontWeight: 800,
              mb: 1.25,
              letterSpacing: 0,
            }}
          >
            {title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: "0.98rem",
              lineHeight: 1.65,
              maxWidth: 520,
              mx: "auto",
            }}
          >
            {description}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 3.5 }}
          >
            {onAction ? (
              <Button
                type="button"
                variant="contained"
                startIcon={<Icon icon="mdi:refresh" width={18} />}
                onClick={onAction}
                sx={{
                  minHeight: 42,
                  px: 2.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {actionLabel}
              </Button>
            ) : null}

            <Button
              component={Link}
              href="/"
              variant={onAction ? "outlined" : "contained"}
              startIcon={<Icon icon="mdi:home-outline" width={18} />}
              sx={{
                minHeight: 42,
                px: 2.5,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Ir para o início
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
