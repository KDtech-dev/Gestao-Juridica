"use client";

import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LawyerProfileCard } from "@/components/team/LawyerProfileCard";
import { teamLawyers, teamSpecialties } from "@/data/team";
import { useMemo, useState } from "react";

export default function TeamView() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Todas");

  const filteredLawyers = useMemo(() => {
    if (selectedSpecialty === "Todas") return teamLawyers;

    return teamLawyers.filter((lawyer) =>
      lawyer.specialties.includes(selectedSpecialty),
    );
  }, [selectedSpecialty]);

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <Header />

      <Box bgcolor="background.paper" py={{ xs: 6, md: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={900} mb={1}>
            Equipe
          </Typography>
          <Typography color="text.secondary" fontSize="1.05rem" maxWidth={760}>
            Conheça os profissionais do escritório por especialidade e encontre
            a atuação mais alinhada à sua demanda jurídica.
          </Typography>
        </Container>
      </Box>

      <Box py={{ xs: 5, md: 7 }}>
        <Container maxWidth="lg">
          <Stack spacing={2.5} mb={4}>
            <Typography variant="h5" fontWeight={800}>
              Especialidades
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.2}>
              {["Todas", ...teamSpecialties].map((specialty) => {
                const active = selectedSpecialty === specialty;

                return (
                  <Button
                    key={specialty}
                    variant={active ? "contained" : "outlined"}
                    onClick={() => setSelectedSpecialty(specialty)}
                    sx={{
                      textTransform: "none",
                      borderRadius: "999px",
                      px: 2,
                    }}
                  >
                    {specialty}
                  </Button>
                );
              })}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
            mb={3}
          >
            <Typography variant="h5" fontWeight={800}>
              Advogados
            </Typography>
            <Typography color="text.secondary">
              {filteredLawyers.length} profissional
              {filteredLawyers.length === 1 ? "" : "ais"}
            </Typography>
          </Stack>

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
              <LawyerProfileCard key={lawyer.id} lawyer={lawyer} />
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
