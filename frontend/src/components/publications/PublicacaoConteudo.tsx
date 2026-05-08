"use client";

import { Box, Card, Chip, Divider, Stack, Typography } from "@mui/material";
import { PublicacaoItem } from "@/data/publicacoes";

type Props = {
  publicacao: PublicacaoItem;
};

export function PublicacaoConteudo({ publicacao }: Props) {
  return (
    <Card
      sx={{
        p: { xs: 2, md: 2.6 },
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
      }}
    >
      <Typography
        fontSize={{ xs: "1.35rem", md: "1.8rem" }}
        fontWeight={700}
        color="text.primary"
        mb={1.2}
      >
        {publicacao.titulo}
      </Typography>

      <Stack direction="row" gap={1} flexWrap="wrap" mb={1.6}>
        <Chip label={publicacao.tipo} />
        <Chip label={publicacao.data} />
        <Chip label={publicacao.autor} />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} gap={2} mb={1.6}>
        <Box>
          <Typography fontSize="0.82rem" color="text.secondary">
            Cliente
          </Typography>
          <Typography color="text.primary" fontWeight={600}>
            {publicacao.cliente}
          </Typography>
        </Box>
        <Box>
          <Typography fontSize="0.82rem" color="text.secondary">
            Processo
          </Typography>
          <Typography color="text.primary" fontWeight={600}>
            {publicacao.processo}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 1.6 }} />

      <Box mb={1.8}>
        <Typography
          fontSize="1rem"
          fontWeight={700}
          color="text.primary"
          mb={0.7}
        >
          Resumo
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            p: 1.4,
            borderRadius: "10px",
            bgcolor: "action.hover",
          }}
        >
          {publicacao.resumo}
        </Typography>
      </Box>

      <Box>
        <Typography
          fontSize="1rem"
          fontWeight={700}
          color="text.primary"
          mb={0.7}
        >
          Conteúdo Completo
        </Typography>
        <Box
          sx={{
            color: "text.secondary",
            lineHeight: 1.7,
            "& p": { mb: 1.2 },
          }}
          dangerouslySetInnerHTML={{
            __html: publicacao.conteudoHtml,
          }}
        />
      </Box>
    </Card>
  );
}
