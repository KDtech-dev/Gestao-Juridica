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

function ReviewHtml({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography fontSize="0.8rem" color="text.secondary" mb={0.6}>
        {label}
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "10px",
          p: 1.4,
          bgcolor: "background.default",
          color: "text.primary",
          "& p": { mt: 0, mb: 1 },
          "& p:last-child": { mb: 0 },
        }}
        dangerouslySetInnerHTML={{ __html: value || "-" }}
      />
    </Box>
  );
}

const statusLabels: Record<PublicacaoFormData["status"], string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

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
          <ReviewItem
            label={isEn ? "Category" : "Categoria"}
            value={data.categoria}
          />
          <ReviewItem
            label={isEn ? "Banner image" : "Imagem do banner"}
            value={data.bannerImage}
          />
          {data.bannerImage ? (
            <Box
              component="img"
              src={data.bannerImage}
              alt={data.titulo}
              sx={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: "10px",
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          ) : null}
          <ReviewItem label={isEn ? "Author" : "Autor"} value={data.autor} />
          <ReviewItem label="Status" value={statusLabels[data.status]} />
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
          <ReviewHtml label={isEn ? "Summary" : "Resumo"} value={data.resumo} />
          <ReviewHtml
            label={isEn ? "Publication text" : "Texto da publicação"}
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
