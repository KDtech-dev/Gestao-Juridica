"use client";

import { Box, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LawyerProfileCard } from "@/components/team/LawyerProfileCard";
import { Icon } from "@/components/AppIcon";
import { AdvogadoPublicoType } from "@/@core/types";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type TeamViewProps = {
  advogados: AdvogadoPublicoType[];
};

const allSpecialtiesValue = "__all__";

export default function TeamView({ advogados }: TeamViewProps) {
  const t = useTranslations("public.teamPage");
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<string>(allSpecialtiesValue);

  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>();

    advogados.forEach((lawyer) => {
      lawyer.categorias.forEach((category) => {
        uniqueSpecialties.add(category);
      });
    });

    return Array.from(uniqueSpecialties).sort((a, b) => a.localeCompare(b));
  }, [advogados]);

  const filteredLawyers = useMemo(() => {
    if (selectedSpecialty === allSpecialtiesValue) return advogados;

    return advogados.filter((lawyer) =>
      lawyer.categorias.some(
        (category) => category === selectedSpecialty,
      ),
    );
  }, [advogados, selectedSpecialty]);

  const categoryCount = specialties.length;
  const hasLawyers = advogados.length > 0;

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <Header />

      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 7, md: 10 },
          borderBottom: "1px solid",
          borderColor: "divider",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(
                  theme.palette.primary.main,
                  0.2,
                )} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(
                  theme.palette.primary.main,
                  0.08,
                )} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <Box maxWidth={820}>
              <Chip
                icon={<Icon icon="mdi:account-group-outline" width={18} />}
                label={t("eyebrow")}
                sx={{
                  mb: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  fontWeight: 700,
                  "& .MuiChip-icon": {
                    color: "primary.main",
                  },
                }}
              />
              <Typography
                variant="h2"
                fontWeight={900}
                lineHeight={1.08}
                sx={{ fontSize: { xs: "2.35rem", md: "3.6rem" } }}
              >
                {t("title")}
              </Typography>
              <Typography
                color="text.secondary"
                fontSize={{ xs: "1rem", md: "1.12rem" }}
                lineHeight={1.75}
                maxWidth={760}
                mt={2}
              >
                {t("subtitle")}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                maxWidth: 620,
              }}
            ></Box>
          </Stack>
        </Container>
      </Box>

      <Box component="section" py={{ xs: 5, md: 7 }}>
        <Container maxWidth="lg">
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: 4,
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
              mb={2.5}
            >
              <Box>
                <Typography variant="h5" fontWeight={850}>
                  {t("filters.title")}
                </Typography>
                <Typography color="text.secondary" mt={0.5}>
                  {t("filters.subtitle")}
                </Typography>
              </Box>
              <Typography color="text.secondary" fontWeight={700}>
                {t("resultCount", { count: filteredLawyers.length })}
              </Typography>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={1}>
              {[allSpecialtiesValue, ...specialties].map((specialty) => {
                const active = selectedSpecialty === specialty;
                const label =
                  specialty === allSpecialtiesValue
                    ? t("filters.all")
                    : specialty;

                return (
                  <Chip
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    label={label}
                    variant={active ? "filled" : "outlined"}
                    color={active ? "primary" : "default"}
                    sx={{
                      height: 36,
                      borderRadius: 2,
                      fontWeight: 700,
                      cursor: "pointer",
                      "& .MuiChip-label": {
                        px: 1.4,
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Paper>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
            mb={3}
          >
            <Typography variant="h5" fontWeight={850}>
              {t("lawyersTitle")}
            </Typography>
            <Typography color="text.secondary" fontWeight={600}>
              {selectedSpecialty === allSpecialtiesValue
                ? t("showingAll")
                : t("showingSpecialty", { specialty: selectedSpecialty })}
            </Typography>
          </Stack>

          {hasLawyers && filteredLawyers.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 3,
              }}
            >
              {filteredLawyers.map((lawyer) => (
                <LawyerProfileCard key={lawyer.uuid} lawyer={lawyer} />
              ))}
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "background.paper",
              }}
            >
              <Icon icon="mdi:account-search-outline" width={42} />
              <Typography variant="h6" fontWeight={850} mt={2}>
                {hasLawyers ? t("emptyFilter.title") : t("empty.title")}
              </Typography>
              <Typography color="text.secondary" mt={1}>
                {hasLawyers ? t("emptyFilter.subtitle") : t("empty.subtitle")}
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
