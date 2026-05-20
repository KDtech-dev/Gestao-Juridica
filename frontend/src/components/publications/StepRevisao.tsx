"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import { PublicacaoFormData } from "./types";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

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

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function ReviewAttachments({
  label,
  files,
  emptyText,
}: {
  label: string;
  files: File[];
  emptyText: string;
}) {
  return (
    <Box>
      <Typography fontSize="0.8rem" color="text.secondary" mb={0.6}>
        {label}
      </Typography>
      {files.length > 0 ? (
        <Stack spacing={0.75}>
          {files.map((file, index) => (
            <Box
              key={`${file.name}-${file.lastModified}-${index}`}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px",
                bgcolor: "background.default",
                px: 1.2,
                py: 0.9,
              }}
            >
              <Typography
                color="text.primary"
                fontWeight={600}
                sx={{
                  overflowWrap: "anywhere",
                }}
              >
                {file.name}
              </Typography>
              <Typography fontSize="0.78rem" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography color="text.primary" fontWeight={600}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}

export function StepRevisao({ data }: Props) {
  const t = useTranslations("internal.publicationForm.review");
  const imagePreview = useMemo(() => {
    if (!data.bannerImage) return "";
    if (typeof data.bannerImage === "string") return data.bannerImage;

    return URL.createObjectURL(data.bannerImage);
  }, [data.bannerImage]);

  useEffect(() => {
    if (!imagePreview || typeof data.bannerImage === "string") return;

    return () => URL.revokeObjectURL(imagePreview);
  }, [data.bannerImage, imagePreview]);

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
          <ReviewItem label={t("title")} value={data.titulo} />
          <ReviewItem label={t("category")} value={data.categoria} />
          <ReviewItem
            label={t("bannerImage")}
            value={
              data.bannerImage instanceof File
                ? data.bannerImage.name
                : data.bannerImage
            }
          />
          {imagePreview ? (
            <Box
              component="img"
              src={imagePreview}
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
          <ReviewItem label={t("author")} value={data.autor} />
          <ReviewItem
            label={t("status")}
            value={t(`statusOptions.${data.status}`)}
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
          <ReviewHtml label={t("summary")} value={data.resumo} />
          <ReviewHtml label={t("content")} value={data.conteudo} />
          <ReviewAttachments
            label={t("attachments")}
            files={data.anexos}
            emptyText={t("noAttachments")}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
