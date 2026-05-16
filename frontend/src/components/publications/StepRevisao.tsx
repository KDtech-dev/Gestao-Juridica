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
          <ReviewItem
            label={t("attachments")}
            value={
              data.anexos.length > 0
                ? data.anexos.map((a) => a.name).join(", ")
                : t("noAttachments")
            }
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
