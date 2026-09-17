"use client";

import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LawyerStatus({ retry }: { retry?: () => void }) {
  const t = useTranslations("public.lawyer");
  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="flex-start">
          <Typography component="h1" variant="h4">
            {t(retry ? "errorTitle" : "notFoundTitle")}
          </Typography>
          <Typography color="text.secondary">
            {t(retry ? "errorDescription" : "notFoundDescription")}
          </Typography>
          {retry && (
            <Button variant="contained" onClick={retry}>
              {t("retry")}
            </Button>
          )}
          <Button component={Link} href="/" variant="outlined">
            {t("home")}
          </Button>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}
