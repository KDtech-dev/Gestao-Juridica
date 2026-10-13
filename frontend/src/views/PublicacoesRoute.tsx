"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import PublicacoesView from "./Publicacoes";
import { PublicacaoType } from "@/@core/types";
import PublicationsView from "./Publicacoes/Publications";
import { demoModeEnabled } from "@/configs/demoOffice";
import { getDemoPublicData } from "@/data/publicDemo";

type PublicacoesRouteViewProps = {
  publicacoesPublicas: PublicacaoType[];
};

export default function PublicacoesRouteView({
  publicacoesPublicas,
}: PublicacoesRouteViewProps) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("public.publications");
  const locale = useLocale();
  const displayedPublications = demoModeEnabled
    ? getDemoPublicData(locale === "en" || locale === "es" ? locale : "pt")
        .demoPublicacoes
    : publicacoesPublicas;

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
            {t("loading")}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isPublicRoute) {
    return <PublicacoesView publicacoes={displayedPublications} />;
  }

  if (isAuthenticated) {
    return <PublicationsView />;
  }

  return <PublicacoesView publicacoes={displayedPublications} />;
}
