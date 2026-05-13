import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Box } from "@mui/material";
import { HomeCard } from "@/components/HomeCard";
import { GridDePublicacoes } from "@/components/publications/GridDePublicacoes";
import { publicacoes } from "@/data/publicacoes";

const PublicacoesView = () => {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
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

      <Box py={8}>
        <GridDePublicacoes
          publicacoes={publicacoes}
          hideVerMais
          clientPageSize={12}
        />
      </Box>

      <Footer />
    </Box>
  );
};

export default PublicacoesView;
