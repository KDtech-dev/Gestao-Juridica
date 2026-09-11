"use client";

import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";
import { storageUrl } from "@/@core/format";

type PublicacaoDetailBannerProps = {
  publicacao: PublicacaoType;
};

export function PublicacaoDetailBanner({
  publicacao,
}: PublicacaoDetailBannerProps) {
  const t = useTranslations("public.publicationDetail");

  const imagemUrl = publicacao.imagem_url;
  return (
    <Box
      component="section"
      sx={{
        backgroundImage: imagemUrl
          ? `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(30,41,59,0.82), rgba(30,58,138,0.72)), url(${imagemUrl})`
          : `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(30,41,59,0.82), rgba(30,58,138,0.72))`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        color: "#fff",
        minHeight: { xs: 420, md: 520 },
        py: { xs: 7, md: 10 },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Button
          component={Link}
          href="/posts"
          variant="outlined"
          startIcon={<Icon icon="mdi:arrow-left" />}
          sx={{
            color: "#fff",
            borderColor: "rgba(255,255,255,0.55)",
            textTransform: "none",
            mb: 4,
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
            },
          }}
        >
          {t("backToPublications")}
        </Button>

        <Box maxWidth={820}>
          <Typography variant="overline" sx={{ opacity: 0.78, letterSpacing: 0, fontWeight: 700 }}>
            {publicacao.categoria?.nome}
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            mt={1}
            mb={2}
            sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
          >
            {publicacao.titulo}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.84, lineHeight: 1.65 }}>
            {publicacao.resumo}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 3 }}
            mt={3}
            sx={{ opacity: 0.86 }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Icon icon="mdi:account-outline" width={18} />
              <Typography variant="subtitle1">
                {t("byAuthor", {
                  author: publicacao.autor ?? "Autor não informado",
                })}
              </Typography>
            </Stack>
            <Typography
              variant="overline"
              sx={{ opacity: 0.78, letterSpacing: 0, fontWeight: 700 }}
            >
              {publicacao.categoria?.nome}
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
