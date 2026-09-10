"use client";

import Link from "next/link";
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/AppIcon";
import type { PublicacaoType } from "@/@core/types";
import { estimateReadTime, formatDate, stripHtml } from "@/@core/format";

type CardPublicacaoInternaProps = {
  publicacao: PublicacaoType;
  processingPostId: string | null;
  onArchive: (publicacao: PublicacaoType) => void;
  onDelete: (publicacao: PublicacaoType) => void;
};

const getCategoria = (publicacao: PublicacaoType) =>
  publicacao.categoria?.nome?.trim() ?? "Publicação";

const getAutor = (publicacao: PublicacaoType) =>
  publicacao.autor?.trim() ??
  publicacao.user?.name?.trim() ??
  "Autor não informado";

const getResumo = (publicacao: PublicacaoType) =>
  publicacao.resumo?.trim() ??
  stripHtml(publicacao.conteudo ?? "").slice(0, 180);

const getData = (publicacao: PublicacaoType) =>
  formatDate(publicacao.publicado_em ?? publicacao.created_at);

const getReadTime = (publicacao: PublicacaoType) =>
  estimateReadTime(publicacao.conteudo);

export function getTextoBuscaPublicacaoInterna(publicacao: PublicacaoType) {
  return [
    publicacao.titulo,
    getCategoria(publicacao),
    getAutor(publicacao),
    getResumo(publicacao),
  ];
}

export function CardPublicacaoInterna({
  publicacao,
  processingPostId,
  onArchive,
  onDelete,
}: CardPublicacaoInternaProps) {
  const t = useTranslations("internal.publications");
  const editHref = `/publicacoes/editar/${publicacao.id}`;

  return (
    <Paper
      sx={{
        position: "relative",
        p: 2.1,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 18px 42px rgba(0,0,0,0.22)"
            : "0 1px 2px rgba(15,23,42,0.06)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "divider",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 24px 52px rgba(0,0,0,0.34)"
              : "0 24px 48px rgba(15,23,42,0.14)",
        },
        "&:focus-within": {
          boxShadow: (theme) =>
            `0 0 0 3px ${theme.palette.action.focus}, 0 16px 36px rgba(15,23,42,0.12)`,
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        gap={1}
        mb={1}
      >
        <Chip
          label={getCategoria(publicacao)}
          sx={{
            bgcolor: "action.hover",
            color: "primary.main",
            fontWeight: 600,
          }}
        />
        <Typography color="text.secondary" fontSize="0.82rem">
          {t(`status.${publicacao.status ?? "publicado"}`)} •{" "}
          {getData(publicacao)} • {getReadTime(publicacao)}
        </Typography>
      </Stack>

      <Typography
        fontWeight={700}
        color="text.primary"
        fontSize="1.08rem"
        mb={0.7}
        sx={{
          position: "relative",
          zIndex: 2,
          textDecoration: "none",
          transition: "color 0.2s ease",
          ".MuiPaper-root:hover &": {
            color: "primary.main",
          },
        }}
      >
        {publicacao.titulo}
      </Typography>

      <Typography
        color="text.secondary"
        fontSize="0.9rem"
        mb={1.2}
        sx={{ position: "relative", zIndex: 2 }}
      >
        {getResumo(publicacao)}
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Typography color="text.secondary" fontSize="0.84rem">
          {t("byAuthor", { author: getAutor(publicacao) })}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: "relative", zIndex: 4 }}
        >
          <Tooltip title={t("actions.edit")}>
            <IconButton
              component={Link}
              href={editHref}
              aria-label={t("actions.edit")}
              size="small"
              onClick={(event) => event.stopPropagation()}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <Icon icon="mdi:pencil-outline" width={19} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("actions.archive")}>
            <span>
              <IconButton
                aria-label={t("actions.archive")}
                size="small"
                disabled={
                  publicacao.status === "arquivado" ||
                  processingPostId === publicacao.id
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onArchive(publicacao);
                }}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <Icon icon="mdi:archive-outline" width={19} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t("actions.delete")}>
            <span>
              <IconButton
                aria-label={t("actions.delete")}
                size="small"
                disabled={processingPostId === publicacao.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(publicacao);
                }}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  color: "error.main",
                }}
              >
                <Icon icon="mdi:trash-can-outline" width={19} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
