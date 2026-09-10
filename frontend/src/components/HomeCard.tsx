"use client";

import Link from "next/link";
import { Box, Button, Container, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export function HomeCard() {
  const t = useTranslations("public.home.hero");

  return (
    <Container maxWidth="lg">
      <Box maxWidth={600}>
        <Typography variant="h3" fontWeight="bold" mb={3}>
          {t("title")}
        </Typography>

        <Typography variant="h6" sx={{ opacity: 0.8 }} mb={4}>
          {t("subtitle")}
        </Typography>

        <Button component={Link} href="#contato" variant="contained">
          {t("cta")}
        </Button>
      </Box>
    </Container>
  );
}
