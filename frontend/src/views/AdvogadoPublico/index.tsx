"use client";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { AdvogadoPublicoType } from "@/@core/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LawyerProfileCard } from "@/components/team/LawyerProfileCard";
import { institutionalWhatsappHref } from "@/configs/publicContact";
import { advogadoOab } from "@/utils/advogadoPublico";

export default function AdvogadoPublicoView({
  lawyer,
  others,
}: {
  lawyer: AdvogadoPublicoType;
  others: AdvogadoPublicoType[];
}) {
  const t = useTranslations("public.lawyer");
  const tFooter = useTranslations("public.footer");
  const contactHref = institutionalWhatsappHref(tFooter("whatsappMessage"));
  const bio = lawyer.resumo_pessoal?.trim();
  const categories = [
    ...new Set((lawyer.categorias ?? []).filter((name) => name.trim())),
  ];
  const oab = advogadoOab(lawyer);
  const initials = lawyer.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Box
        component="section"
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 5 }}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Avatar
              variant="rounded"
              src={lawyer.foto_perfil_url ?? undefined}
              alt={lawyer.name}
              sx={{
                width: { xs: 180, sm: 220, md: 280 },
                height: { xs: 210, sm: 260, md: 320 },
                alignSelf: { xs: "center", md: "auto" },
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "3rem",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component="h1"
                variant="h3"
                fontWeight={800}
                sx={{
                  fontSize: { xs: "2rem", md: "2.75rem" },
                  overflowWrap: "anywhere",
                }}
              >
                {lawyer.name}
              </Typography>
              {oab && (
                <Typography color="text.primary" fontWeight={700} mt={1.5}>
                  {oab}
                </Typography>
              )}
              {categories.length > 0 && (
                <Typography color="text.secondary" mt={1.5}>
                  {categories.join(" · ")}
                </Typography>
              )}
              {bio && (
                <Typography color="text.secondary" mt={2} lineHeight={1.75}>
                  {bio.length > 240 ? `${bio.slice(0, 237).trimEnd()}…` : bio}
                </Typography>
              )}
              <Button
                href={contactHref}
                variant="contained"
                sx={{ mt: 3, textTransform: "none" }}
              >
                {t("contact")}
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 4, md: 5 }}>
          {bio && (
            <Box component="section">
              <Typography component="h2" variant="h5" fontWeight={800} mb={2}>
                {t("about")}
              </Typography>
              <Typography
                sx={{
                  maxWidth: "75ch",
                  whiteSpace: "pre-line",
                  overflowWrap: "anywhere",
                }}
                color="text.secondary"
                lineHeight={1.8}
              >
                {bio}
              </Typography>
            </Box>
          )}
          {categories.length > 0 && (
            <Box component="section">
              <Typography component="h2" variant="h5" fontWeight={800} mb={2}>
                {t("practiceAreas")}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                {categories.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: "background.paper",
                      maxWidth: "100%",
                      height: "auto",
                      "& .MuiChip-label": { whiteSpace: "normal", py: 1 },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          {oab && (
            <Paper
              component="section"
              variant="outlined"
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}
            >
              <Typography component="h2" variant="h5" fontWeight={800} mb={2}>
                {t("professionalInfo")}
              </Typography>
              <Typography>{oab}</Typography>
            </Paper>
          )}
          <Paper
            component="section"
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Typography component="h2" variant="h5" fontWeight={800}>
                {t("ctaTitle")}
              </Typography>
              <Button
                href={contactHref}
                variant="contained"
                sx={{ textTransform: "none", flexShrink: 0 }}
              >
                {t("contact")}
              </Button>
            </Stack>
          </Paper>
          {others.length > 0 && (
            <Box component="section">
              <Typography component="h2" variant="h5" fontWeight={800} mb={3}>
                {t("others")}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 3,
                }}
              >
                {others.map((other) => (
                  <LawyerProfileCard
                    key={other.uuid}
                    lawyer={other}
                    showProfileAction
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}
