"use client";
import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { publicacoes } from "@/data/publicacoes";
import { HomeCard } from "@/components/HomeCard";
import { GridDePublicacoes } from "@/components/publications/GridDePublicacoes";
import { LawyerCarousel } from "@/components/team/LawyerCarousel";
import { teamLawyers, teamSpecialties } from "@/data/team";

export default function HomeView() {
  const stats = [
    { value: "25+", label: "Anos de Experiência" },
    { value: "1.200+", label: "Clientes Atendidos" },
    { value: "R$ 50M+", label: "Economizados" },
    { value: "98%", label: "Taxa de Sucesso" },
  ];

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
      <Box py={8} bgcolor="background.paper">
        <Container>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            justifyContent="space-between"
          >
            {stats.map((item, i) => (
              <Box key={i} textAlign="center" flex={1}>
                <Typography variant="h4" color="primary">
                  {item.value}
                </Typography>
                <Typography>{item.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Container>
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
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" fontWeight={800} mb={2}>
                Sobre o Escritório
              </Typography>

              <Typography
                color="text.secondary"
                fontSize="1.02rem"
                lineHeight={1.75}
              >
                Fundado com o propósito de oferecer soluções jurídicas
                estratégicas, nosso escritório atua há mais de 20 anos no
                mercado, atendendo empresas e indivíduos com excelência, ética e
                inovação. Nossa equipe é formada por profissionais altamente
                qualificados, especializados em diversas áreas do Direito,
                garantindo um atendimento completo e personalizado.
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1} mt={3}>
                <Chip
                  label="Consultoria estratégica"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  label="Foco corporativo"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  label="Ética e inovação"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                }}
              >
                <Box
                  component="img"
                  alt={"Equipe do escritório em reunião"}
                  src="https://advbox.com.br/blog/wp-content/uploads/2021/11/area-juridica-profissionais.jpg"
                  sx={{
                    width: "100%",
                    height: { xs: 220, md: 340 },
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
            <LawyerCarousel lawyers={teamLawyers} />
          </Box>
        </Container>
      </Box>
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
      <Box id="contato" bgcolor="background.default">
        <Footer />
      </Box>
    </Box>
  );
}
