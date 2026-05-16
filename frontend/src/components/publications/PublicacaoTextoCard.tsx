"use client";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import type { PublicacaoItem } from "@/api/publicacoes/types";
import { useTranslations } from "next-intl";

type PublicacaoTextoCardProps = {
  publicacao: PublicacaoItem;
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
            {t("byAuthor", { author: publicacao.autor })}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Icon icon="mdi:calendar-month-outline" width={18} />
          <Typography variant="subtitle1">{publicacao.data}</Typography>
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
          __html: publicacao.conteudoHtml,
        }}
      />
    </Paper>
  );
}
