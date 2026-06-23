"use client";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";
import { formatDate } from "@/@core/format";

type PublicacaoTextoCardProps = {
  publicacao: PublicacaoType;
};

export function PublicacaoTextoCard({ publicacao }: PublicacaoTextoCardProps) {
  const t = useTranslations("public.publicationDetail");

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 2,
        minHeight: { xs: "auto", md: "30em" },
      }}
    >
      <Typography variant="h5" fontWeight={800} align="center" mb={2}>
        {publicacao.titulo}
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 3 }}
        justifyContent="center"
        alignItems="center"
        color="text.secondary"
        mb={4}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Icon icon="mdi:account-outline" width={18} />
          <Typography variant="subtitle1">
            {t("byAuthor", {
              author: publicacao.autor ?? "Autor não informado",
            })}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Icon icon="mdi:calendar-month-outline" width={18} />
          <Typography variant="subtitle1">
            {formatDate(publicacao.publicado_em ?? publicacao.created_at)}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          color: "text.secondary",
          fontSize: "1rem",
          lineHeight: 1.8,
          "& p": { mb: 2 },
        }}
        dangerouslySetInnerHTML={{
          __html: publicacao.conteudo ?? "",
        }}
      />
    </Paper>
  );
}
