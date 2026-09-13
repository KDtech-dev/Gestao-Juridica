"use client";

import { Box, Button, Card, Divider, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import type { PublicacaoItem } from "@/api/publicacoes/types";

type Props = {
  publicacao: PublicacaoItem;
};

export function PublicacaoAnexos({ publicacao }: Props) {
  return (
    <Card
      sx={{
        p: { xs: 2, md: 2.2 },
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
      }}
    >
      <Typography fontWeight={700} color="text.primary" mb={1.2}>
        Anexos
      </Typography>

      {publicacao.anexos.length === 0 ? (
        <Typography color="text.secondary" fontSize="0.9rem">
          Esta publicação não possui anexos.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {publicacao.anexos.map((anexo, index) => (
            <Box key={anexo.id}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1}
              >
                <Typography color="text.primary">{anexo.nome}</Typography>
                {anexo.viewUrl && (
                  <Button
                    component="a"
                    href={anexo.viewUrl}
                    download
                    variant="outlined"
                  size="small"
                  startIcon={<Icon icon="mdi:download" />}
                  sx={{
                    textTransform: "none",
                    borderColor: "divider",
                    }}
                  >
                    Download
                  </Button>
                )}
              </Stack>
              {index < publicacao.anexos.length - 1 && (
                <Divider sx={{ mt: 1 }} />
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
}
