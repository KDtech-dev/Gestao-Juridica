"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import PublicationsView from "@/views/Publications";
import PublicacoesView from "@/views/Publicacoes";

function shouldShowPublicSite() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("origem") === "home";
}

export default function PublicacoesRouteView() {
  const { isAuthenticated, loading } = useAuth();
  const showPublicSite = shouldShowPublicSite();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
          px: 2,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={28} />
          <Typography sx={{ mt: 1.5 }} color="text.secondary" fontSize="0.9rem">
            Carregando publicações...
          </Typography>
        </Box>
      </Box>
    );
  }

  return isAuthenticated && !showPublicSite ? (
    <PublicationsView />
  ) : (
    <PublicacoesView />
  );
}
