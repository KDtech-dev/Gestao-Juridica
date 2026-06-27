"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeCard } from "@/components/HomeCard";
import { GridDePublicacoes } from "@/components/publications/GridDePublicacoes";
import { LawyerCarousel } from "@/components/team/LawyerCarousel";
import { teamLawyers, teamSpecialties } from "@/data/team";
import { AdvogadoPublicoType, PublicacaoType } from "@/@core/types";
import { useTranslations } from "next-intl";

type HomeViewProps = {
  publicacoes: PublicacaoType[];
  advogados: AdvogadoPublicoType[];
};

export default function HomeView({ publicacoes,advogados }: HomeViewProps) {
  const t = useTranslations("public.home");
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <Header />
      <Box
        sx={{
          background: "linear-gradient(to right, #0f172a, #1e293b, #1e3a8a)",
          color: "#fff",
          py: 10,
        }}
      >
        <HomeCard />
      </Box>
      <Box
        id="areas"
        sx={{ scrollMarginTop: "80px" }}
        py={8}
        bgcolor="background.default"
      >
        <Container>
          <Typography variant="h4" textAlign="center" mb={4}>
            Especialidades
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={2}
            justifyContent="center"
          >
            {teamSpecialties.map((area, i) => (
              <Box
                key={i}
                sx={{
                  width: { xs: "45%", md: "22%" },
                  p: 3,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography fontWeight="bold">{area}</Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>
      <Box
        id="institucional"
        sx={{ scrollMarginTop: "80px" }}
        py={10}
        bgcolor="background.paper"
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" fontWeight={800} mb={2}>
                {t("about.title")}
              </Typography>
              <Typography
                color="text.secondary"
                fontSize="1.02rem"
                lineHeight={1.75}
              >
                {t("about.paragraph1")}
              </Typography>
              <Typography
                color="text.secondary"
                fontSize="1.02rem"
                lineHeight={1.75}
                mt={2}
              >
                {t("about.paragraph2")}
              </Typography>
              <Box sx={{ position: "relative" }}>
                <Typography
                  id="expandable-text"
                  color="text.secondary"
                  fontSize="1.02rem"
                  lineHeight={1.75}
                  mt={2}
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: isAboutExpanded ? "unset" : 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("about.details")}
                </Typography>
              </Box>
              <Button
                onClick={() => {
                  const el = document.getElementById("expandable-text");
                  const shouldExpand = !isAboutExpanded;

                  setIsAboutExpanded(shouldExpand);

                  if (el && shouldExpand) {
                    setTimeout(() => {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }, 100);
                  }
                }}
                sx={{ mt: 1, p: 0, textTransform: "none", fontWeight: 500 }}
              >
                {t(isAboutExpanded ? "about.readLess" : "about.readMore")}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                  position: "sticky",
                  mt: { xs: 0, md: 20 },
                }}
              >
                <Box
                  component="img"
                  alt={t("about.imageAlt")}
                  src="https://advbox.com.br/blog/wp-content/uploads/2021/11/area-juridica-profissionais.jpg"
                  sx={{
                    width: "100%",
                    height: { xs: 250, md: 340 },
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
          <Box
            id="equipe"
            sx={{ scrollMarginTop: "80px" }}
            mt={{ xs: 7, md: 9 }}
            mb={4}
          >
            <LawyerCarousel lawyers={advogados} />
          </Box>
        </Container>
      </Box>
      {publicacoes.length > 0 ? (
        <Box
          id="publicacoes"
          sx={{ scrollMarginTop: "80px" }}
          py={10}
          bgcolor="background.default"
        >
          <GridDePublicacoes
            publicacoes={publicacoes.slice(0, 4)}
            title="Publicações Recentes"
            subtitle="Mantenha-se atualizado com nossos artigos sobre as últimas mudanças na legislação e jurisprudência."
            verMaisHref="/posts"
          />
        </Box>
      ) : null}
      <Box id="contato" bgcolor="background.default">
        <Footer />
      </Box>
    </Box>
  );
}
