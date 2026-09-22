"use client";

import { Paper, Typography } from "@mui/material";
import type { PublicacaoItem } from "@/api/publicacoes/types";
import { useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";

type PublicacaoResumoCardProps = {
  publicacao: PublicacaoType;
};

export function PublicacaoResumoCard({
  publicacao,
}: PublicacaoResumoCardProps) {
  const t = useTranslations("public.publicationDetail");

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={1.5}>
        {t("summary")}
      </Typography>
      <Typography
        variant="h6"
        component="div"
        sx={{ opacity: 0.84, lineHeight: 1.65, "& p": { margin: 0 } }}
        dangerouslySetInnerHTML={{ __html: publicacao.resumo ?? "" }}
      />
    </Paper>
  );
}
