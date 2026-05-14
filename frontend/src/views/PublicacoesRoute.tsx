"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import PublicationsView from "@/views/Publications";
import PublicacoesView from "@/views/Publicacoes";
import { usePathname } from "next/navigation";
import type { PublicacaoItem } from "@/api/publicacoes/types";

type PublicacoesRouteViewProps = {
  publicacoesPublicas: PublicacaoItem[];
};

export default function PublicacoesRouteView({
  publicacoesPublicas,
}: PublicacoesRouteViewProps) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = pathname === "/posts";

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

  if (isPublicRoute) {
    return <PublicacoesView publicacoes={publicacoesPublicas} />;
  }

  if (isAuthenticated) {
    return <PublicationsView />;
  }

  return <PublicacoesView publicacoes={publicacoesPublicas} />;
}
