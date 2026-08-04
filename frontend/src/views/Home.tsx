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
import { teamSpecialties } from "@/data/team";
import { AdvogadoPublicoType, PublicacaoType } from "@/@core/types";
import { useTranslations } from "next-intl";
import SpecialtiesSection from "@/components/SpecialtiesSection";

type HomeViewProps = {
  publicacoes: PublicacaoType[];
  advogados: AdvogadoPublicoType[];
};

export default function HomeView({ publicacoes, advogados }: HomeViewProps) {
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
        <SpecialtiesSection />
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
