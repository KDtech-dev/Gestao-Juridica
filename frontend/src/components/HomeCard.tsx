"use client";

import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

export function HomeCard() {
  return (
    <Container maxWidth="lg">
      <Box maxWidth={600}>
        <Typography variant="h3" fontWeight="bold" mb={3}>
          Direito Tributário e Empresarial
        </Typography>

        <Typography variant="h6" sx={{ opacity: 0.8 }} mb={4}>
          Especialistas em soluções jurídicas corporativas...
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button component={Link} href="#contato" variant="contained">
            Consulta Gratuita
          </Button>
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            sx={{ color: "#fff", borderColor: "#fff" }}
          >
            Acompanhe seu Caso
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
