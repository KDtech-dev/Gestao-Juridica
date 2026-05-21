"use client";

import Link from "next/link";
import { Box, Button, Container, Typography } from "@mui/material";

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

        <Button component={Link} href="#contato" variant="contained">
          Consulta Gratuita
        </Button>
      </Box>
    </Container>
  );
}
