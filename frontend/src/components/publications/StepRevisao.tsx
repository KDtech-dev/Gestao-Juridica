"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import { PublicacaoFormData } from "./types";

type Props = {
  data: PublicacaoFormData;
  isEn?: boolean;
};

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography fontSize="0.8rem" color="text.secondary" mb={0.2}>
        {label}
      </Typography>
      <Typography color="text.primary" fontWeight={600}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

export function StepRevisao({ data, isEn = false }: Props) {
  return (
    <Stack spacing={1.4}>
      <Paper
        sx={{
          p: 1.6,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1.1}>
          <ReviewItem label={isEn ? "Title" : "Título"} value={data.titulo} />
          <ReviewItem label={isEn ? "Type" : "Tipo"} value={data.tipo} />
          <ReviewItem
            label={isEn ? "Client" : "Cliente"}
            value={data.cliente}
          />
          <ReviewItem
            label={isEn ? "Process" : "Processo"}
            value={data.processo}
          />
          <ReviewItem label={isEn ? "Date" : "Data"} value={data.data} />
          <ReviewItem
            label={isEn ? "Responsible" : "Responsável"}
            value={data.responsavel}
          />
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 1.6,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1.1}>
          <ReviewItem label={isEn ? "Summary" : "Resumo"} value={data.resumo} />
          <ReviewItem
            label={isEn ? "Full content" : "Conteúdo completo"}
            value={data.conteudo}
          />
          <ReviewItem
            label={isEn ? "Attachments" : "Anexos"}
            value={
              data.anexos.length > 0
                ? data.anexos.map((a) => a.name).join(", ")
                : isEn
                  ? "No attachments"
                  : "Nenhum anexo"
            }
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
