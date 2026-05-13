import { Box, Container, Stack } from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PublicacaoAnexosCard } from "@/components/publications/PublicacaoAnexosCard";
import { PublicacaoDetailBanner } from "@/components/publications/PublicacaoDetailBanner";
import { PublicacaoResumoCard } from "@/components/publications/PublicacaoResumoCard";
import { PublicacaoTextoCard } from "@/components/publications/PublicacaoTextoCard";
import type { PublicacaoItem } from "@/data/publicacoes";

type Props = {
  publicacao: PublicacaoItem;
};

export default function PublicationDetailView({ publicacao }: Props) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Header isAuthenticated={false} userName="Diego" />

      <PublicacaoDetailBanner publicacao={publicacao} />

      <Box
        sx={{
          height: { xs: 32, md: 48 },
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <PublicacaoTextoCard publicacao={publicacao} />
          <PublicacaoResumoCard publicacao={publicacao} />
          <PublicacaoAnexosCard publicacao={publicacao} />
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}
