"use client";
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
import { PublicacaoType } from "@/@core/types";

type HomeViewProps = {
  publicacoes: PublicacaoType[];
};

export default function HomeView({ publicacoes }: HomeViewProps) {
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
                Sobre o Escritório
              </Typography>
              <Typography
                color="text.secondary"
                fontSize="1.02rem"
                lineHeight={1.75}
              >
                Com atuação pautada na ética, responsabilidade e compromisso com
                resultados, o escritório Manfrine Chaves de Almeida & Advogados
                reúne uma equipe multidisciplinar preparada para atender
                demandas nas áreas do Direito Público, Trabalhista, Cível,
                Previdenciário e Bancário.
              </Typography>
              <Typography
                color="text.secondary"
                fontSize="1.02rem"
                lineHeight={1.75}
                mt={2}
              >
                À frente do escritório está Manfrine Chaves de Almeida, advogado
                e contador, especialista em Direito Público, Trabalhista e
                Cível. A equipe é formada por profissionais com atuações
                complementares, incluindo direito previdenciário, consultoria
                legislativa e demandas judiciais estratégicas.
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
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                >
                  Integra a equipe Carollaine Damasceno Barros, advogada e
                  contadora, especialista em Direito Público e Cível. Com
                  atuação destacada na assessoria jurídica legislativa e
                  consultoria técnica, contribui com análises precisas e
                  fundamentadas, especialmente nas áreas que envolvem gestão
                  pública e controle de legalidade. Na área previdenciária, o
                  escritório conta com Luiz Fernando Novais Neves, advogado com
                  atuação focada na garantia de direitos e benefícios junto aos
                  órgãos competentes. O Direito Público também é representado
                  por Anderson Fazendeiro, especialista na área, com experiência
                  em demandas administrativas e judiciais envolvendo entes
                  públicos. Compõe ainda a equipe Saiara Tavares Almeida,
                  advogada especialista em Direito Público e Previdenciário,
                  atuando com dedicação na defesa de direitos sociais e
                  administrativos. Na área bancária e pública, destaca-se
                  Andressa Fazendeiro, especialista em Direito Público e
                  Bancário, com atuação estratégica em demandas contratuais e
                  financeiras. Na área trabalhista e previdenciária, Abraão
                  Lincoln Prates de Almeida, que atua na defesa dos direitos
                  individuais e coletivos nas relações de trabalho e garantia de
                  direitos e benefícios junto ao INSS. O escritório se consolida
                  como referência regional pela atuação técnica, atendimento
                  personalizado e compromisso com a justiça, oferecendo soluções
                  jurídicas seguras, eficientes e alinhadas às necessidades de
                  cada cliente.
                </Typography>
              </Box>
              <Button
                onClick={(e) => {
                  const el = document.getElementById("expandable-text");
                  if (el) {
                    const isExpanded = el.style.webkitLineClamp === "unset";
                    el.style.webkitLineClamp = isExpanded ? "3" : "unset";
                    e.currentTarget.textContent = isExpanded
                      ? "Ler mais"
                      : "Ler menos";
                    if (!isExpanded) {
                      setTimeout(() => {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                        });
                      }, 100);
                    }
                  }
                }}
                sx={{ mt: 1, p: 0, textTransform: "none", fontWeight: 500 }}
              >
                Ler mais
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
                  alt={"Equipe do escritório em reunião"}
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
            <LawyerCarousel lawyers={teamLawyers} />
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