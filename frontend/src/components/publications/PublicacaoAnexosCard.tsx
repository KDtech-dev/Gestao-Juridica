"use client";

import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import type { PublicacaoItem } from "@/data/publicacoes";

type PublicacaoAnexosCardProps = {
  publicacao: PublicacaoItem;
};

export function PublicacaoAnexosCard({
  publicacao,
}: PublicacaoAnexosCardProps) {
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
          Anexos
        </Typography>
      </Stack>

      {publicacao.anexos.length === 0 ? (
        <Typography color="text.secondary">
          Esta publicação não possui anexos disponíveis.
        </Typography>
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
                    <Typography color="text.primary" fontWeight={700}>
                      {anexo.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Documento da publicação
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  component="a"
                  href={anexo.url}
                  download
                  variant="outlined"
                  size="small"
                  startIcon={<Icon icon="mdi:download" />}
                  sx={{ textTransform: "none", borderColor: "divider" }}
                >
                  Download
                </Button>
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
