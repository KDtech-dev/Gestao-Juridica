"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { homeWhatsappHref } from "@/configs/publicContact";

export function HomeCard() {
  const t = useTranslations("public.home.hero");
  const whatsappHref = homeWhatsappHref(
    "Olá, gostaria de falar sobre o sistema Central Jurídico.",
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 5 },
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ maxWidth: 760, minWidth: 0 }}>
        <Typography
          variant="h2"
          fontWeight={900}
          sx={{
            fontSize: { xs: "2.1rem", md: "3.35rem" },
            lineHeight: 1.08,
            mb: 2,
          }}
        >
          {t("title")}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            maxWidth: 680,
            color: "rgba(255,255,255,0.86)",
            lineHeight: 1.55,
            mb: 4,
          }}
        >
          {t("subtitle")}
        </Typography>

        <Button
          component="a"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
        >
          {t("cta")}
        </Button>
      </Box>
    </Container>
  );
}
