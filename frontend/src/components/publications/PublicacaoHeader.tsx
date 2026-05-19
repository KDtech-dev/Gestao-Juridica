"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useRouter } from "next/navigation";

type Props = {
  canManage?: boolean;
  onDelete: () => void;
  onShare: () => void;
  onEdit: () => void;
};

export function PublicacaoHeader({
  canManage = true,
  onDelete,
  onShare,
  onEdit,
}: Props) {
  const router = useRouter();
  const handleBack = () => router.back();

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      gap={1.2}
      mb={2.2}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Icon icon="mdi:arrow-left" />}
          sx={{ textTransform: "none", borderColor: "divider" }}
          onClick={handleBack}
        >
          Voltar
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Publicação
        </Typography>
      </Stack>

      {canManage && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<Icon icon="mdi:pencil-outline" />}
            sx={{ textTransform: "none", borderColor: "divider" }}
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Icon icon="mdi:trash-can-outline" />}
            sx={{ textTransform: "none" }}
            onClick={onDelete}
          >
            Excluir
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:share-variant-outline" />}
            sx={{ textTransform: "none" }}
            onClick={onShare}
          >
            Compartilhar
          </Button>
        </Box>
      )}
    </Stack>
  );
}
