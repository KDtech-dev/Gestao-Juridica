"use client";

import {
  Box,
  Paper,
  Stack,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";
import { slugifyPublicacao } from "@/@core/format";
import {
  getAnexoDownloadUrl,
  getAnexoVisualizarUrl,
} from "@/api/apiAnexos";

type PublicacaoAnexosCardProps = {
  publicacao: PublicacaoType;
};

export function PublicacaoAnexosCard({
  publicacao,
}: PublicacaoAnexosCardProps) {
  const t = useTranslations("public.publicationDetail");
  const slug = slugifyPublicacao(
    publicacao.titulo ?? "publicacao",
    publicacao.id
  );

  return (
    <Paper elevation={3} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Icon icon="mdi:paperclip" width={22} />

        <Typography variant="h6" fontWeight={800}>
          {t("attachments")}
        </Typography>
      </Stack>

      {publicacao.anexos.length === 0 ? (
        <Typography color="text.secondary">
          {t("noAttachments")}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {publicacao.anexos.map((anexo) => {
            const viewerUrl =
              `/publicacoes/${slug}/anexos/${anexo.id}/visualizar`;

            const downloadUrl = getAnexoDownloadUrl(
              publicacao.id,
              anexo.id
            );

            return (
              <Box
                key={anexo.id}
                sx={{
                  width: "100%",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    pr: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    ":hover": {
                      color: "primary.main",
                    },
                  }}
                  title={anexo.nome_arquivo ?? ""}
                  onClick={() => {
                    window.open(viewerUrl, "_blank");
                  }}
                >
                  {anexo.nome_arquivo || "Anexo"}
                </Typography>

                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={t("view")}>
                    <IconButton
                      onClick={() => {
                        window.open(viewerUrl, "_blank");
                      }}
                    >
                      <Icon
                        icon="mdi:eye-outline"
                        width="1em"
                        height="1em"
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t("download")}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = downloadUrl;
                      }}
                    >
                      <Icon
                        icon="mdi:download-outline"
                        width="1em"
                        height="1em"
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}