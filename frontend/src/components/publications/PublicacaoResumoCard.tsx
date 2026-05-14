"use client";

import { Paper, Typography } from "@mui/material";
import type { PublicacaoItem } from "@/api/publicacoes/types";

type PublicacaoResumoCardProps = {
  publicacao: PublicacaoItem;
};

export function PublicacaoResumoCard({
  publicacao,
}: PublicacaoResumoCardProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={1.5}>
        Resumo
      </Typography>
      <Typography color="text.secondary" lineHeight={1.8}>
        {publicacao.resumo}
      </Typography>
    </Paper>
  );
}
