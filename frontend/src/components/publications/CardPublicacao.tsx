"use client";

import Link from "next/link";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useLocale, useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";
import {
  estimateReadTime,
  formatDateByLocale,
  slugify,
  stripHtml,
} from "@/@core/format";

type CardPublicacaoProps = {
  publicacao: PublicacaoType;
};

export function CardPublicacao({ publicacao }: CardPublicacaoProps) {
  const t = useTranslations("public.publications");
  const locale = useLocale();
  const titulo = publicacao.titulo?.trim() || "Publicação";
  const slug = `${slugify(titulo) || "publicacao"}-${publicacao.id}`;
  const resumo =
    publicacao.resumo?.trim() ||
    stripHtml(publicacao.conteudo ?? "").slice(0, 180);
  const categoria = publicacao.categoria?.nome?.trim() || "Publicação";
  const data = formatDateByLocale(
    publicacao.publicado_em ?? publicacao.created_at,
    locale,
  );
  const readTime = estimateReadTime(publicacao.conteudo);
  const autor =
    publicacao.autor?.trim() ||
    publicacao.user?.name?.trim() ||
    "Autor não informado";
  const bannerImage = publicacao.imagem_url || undefined;

  return (
    <Paper
      component="article"
      sx={{
        height: "100%",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "0.25s ease",
        "&:hover": {
          boxShadow: "0 12px 28px rgba(15,23,42,0.14)",
          transform: "translateY(-4px)",
        },
      }}
    >
      <Box sx={{ position: "relative", height: 150, bgcolor: "action.hover" }}>
        <Box
          component="img"
          src={bannerImage}
          alt={titulo}
          sx={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
        <Chip
          label={categoria}
          size="small"
          sx={{
            position: "absolute",
            left: 12,
            bottom: 12,
            bgcolor: "rgba(255,255,255,0.92)",
            color: "primary.main",
            fontWeight: 800,
          }}
        />
      </Box>

      <Box sx={{ p: 2.4, display: "flex", flex: 1, flexDirection: "column" }}>
        <Stack direction="row" justifyContent="flex-end" gap={1} mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Icon icon="mdi:clock-outline" width={16} />
            <Typography variant="caption" color="text.secondary">
              {readTime}
            </Typography>
          </Stack>
        </Stack>

        <Typography fontWeight={800} color="text.primary" mb={1}>
          {titulo}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{ flex: 1 }}
        >
          {resumo}
        </Typography>

        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Icon icon="mdi:calendar-month-outline" width={16} />
            <Typography variant="caption" color="text.secondary">
              {data}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Icon icon="mdi:account-outline" width={16} />
            <Typography variant="caption" color="text.secondary">
              {autor}
            </Typography>
          </Stack>
          <Box pt={1}>
            <Button
              component={Link}
              href={`/publicacoes/${slug}`}
              variant="outlined"
              fullWidth
              sx={{ textTransform: "none", borderColor: "divider" }}
            >
              {t("readPublication")}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}