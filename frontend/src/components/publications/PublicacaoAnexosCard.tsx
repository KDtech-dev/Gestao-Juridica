"use client";
import {
  Box,
  Divider,
  Paper,
  Stack,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";

type PublicacaoAnexosCardProps = {
  publicacao: PublicacaoType;
};

export function PublicacaoAnexosCard({
  publicacao,
}: PublicacaoAnexosCardProps) {
  const t = useTranslations("public.publicationDetail");

  return (
    <Paper elevation={3} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Icon icon="mdi:paperclip" width={22} />
        <Typography variant="h6" fontWeight={800}>
          {t("attachments")}
        </Typography>
      </Stack>

      {publicacao.anexos.length === 0 ? (
        <Typography color="text.secondary">{t("noAttachments")}</Typography>
      ) : (
        <Stack spacing={1}>
          {publicacao.anexos.map((anexo) => {
            const url =
              anexo.url ??
              (anexo.arquivo
                ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${anexo.arquivo}`
                : undefined);
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
                    cursor: url ? "pointer" : "default",
                    ":hover": url ? { color: "primary.main" } : undefined,
                  }}
                  title={anexo.nome_arquivo ?? ""}
                  onClick={() => url && window.open(url, "_blank")}
                >
                  {anexo.nome_arquivo || "Anexo"}
                </Typography>

                {url && (
                  <Tooltip title={t("view")}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(url, "_blank");
                      }}
                    >
                      <Icon icon="mdi:eye-outline" width="1em" height="1em" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
