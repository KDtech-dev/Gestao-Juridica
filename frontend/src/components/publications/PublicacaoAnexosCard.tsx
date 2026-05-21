"use client";

import Link from "next/link";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import type { PublicacaoItem } from "@/api/publicacoes/types";
import { useTranslations } from "next-intl";

type PublicacaoAnexosCardProps = {
  publicacao: PublicacaoItem;
};

export function PublicacaoAnexosCard({
  publicacao,
}: PublicacaoAnexosCardProps) {
  const t = useTranslations("public.publicationDetail");

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Icon icon="mdi:paperclip" width={22} />
        <Typography variant="h6" fontWeight={800}>
          {t("attachments")}
        </Typography>
      </Stack>

      {publicacao.anexos.length === 0 ? (
        <Typography color="text.secondary">{t("noAttachments")}</Typography>
      ) : (
        <Stack spacing={1.5}>
          {publicacao.anexos.map((anexo, index) => (
            <Box key={anexo.id}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1.5}
              >
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "action.hover",
                      color: "primary.main",
                    }}
                  >
                    <Icon icon="mdi:file-document-outline" width={22} />
                  </Box>
                  <Box>
                    <Typography
                      component={Link}
                      href={anexo.viewUrl || anexo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="text.primary"
                      fontWeight={700}
                      sx={{
                        textDecoration: "none",
                        "&:hover": {
                          color: "primary.main",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {anexo.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("publicationDocument")}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
              {index < publicacao.anexos.length - 1 && (
                <Divider sx={{ mt: 1.5 }} />
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
