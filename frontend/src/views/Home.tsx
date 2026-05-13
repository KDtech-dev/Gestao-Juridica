"use client";
import {
  Avatar,
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

export default function HomeView() {
  const areas = [
    "Direito Tributário",
    "Direito Empresarial",
    "Direito Trabalhista",
    "Direito Civil",
    "Direito Digital",
    "Direito Imobiliário",
    "Direito de Família",
    "Direito Penal",
  ];

  const stats = [
    { value: "25+", label: "Anos de Experiência" },
    { value: "1.200+", label: "Clientes Atendidos" },
    { value: "R$ 50M+", label: "Economizados" },
    { value: "98%", label: "Taxa de Sucesso" },
  ];

  const lawyers = [
    {
      name: "Dra. Elena Silva",
      role: "Especialista em Direito Tributário",
      description:
        "Atua há mais de 15 anos com planejamento tributário e defesa fiscal.",
      areas: ["Tributário", "Empresarial"],
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Dr. Roberto Alves",
      role: "Especialista em Direito Trabalhista",
      description:
        "Experiência em relações corporativas e gestão de passivos trabalhistas.",
      areas: ["Trabalhista"],
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Dr. Marcos Santos",
      role: "Especialista em Direito Digital",
      description:
        "Focado em proteção de dados, LGPD e contratos tecnológicos.",
      areas: ["Digital", "Contratos"],
      image: "https://randomuser.me/api/portraits/men/45.jpg",
    },
  ];

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <Header isAuthenticated={false} userName="Diego" />
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
            {areas.map((area, i) => (
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

          <Box textAlign="center" mt={{ xs: 7, md: 9 }} mb={4}>
            <Typography variant="h4" fontWeight="bold">
              Nossa Equipe
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Uma equipe multidisciplinar, focada em resultados práticos.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {lawyers.map((lawyer) => (
              <Grid key={lawyer.name} size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    "&:hover": {
                      transform: "translateY(-2px) scale(1.01)",
                      boxShadow: "0 12px 30px rgba(15,23,42,0.14)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={lawyer.image}
                      alt={lawyer.name}
                      sx={{ width: 56, height: 56 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={800} noWrap>
                        {lawyer.name}
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.92rem">
                        {lawyer.role}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    color="text.secondary"
                    mt={2}
                    fontSize="0.95rem"
                    lineHeight={1.65}
                  >
                    {lawyer.description}
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1} mt={2.2}>
                    {lawyer.areas.map((area) => (
                      <Chip
                        key={area}
                        label={area}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Box
        id="publicacoes"
        sx={{ scrollMarginTop: "80px" }}
        py={10}
        bgcolor="background.default"
      >
        <GridDePublicacoes
          publicacoes={publicacoes.slice(0, 3)}
          title="Publicações Recentes"
          subtitle="Mantenha-se atualizado com nossos artigos sobre as últimas mudanças na legislação e jurisprudência."
        />
      </Box>
      <Box id="contato" bgcolor="background.default">
        <Footer />
      </Box>
    </Box>
  );
}
