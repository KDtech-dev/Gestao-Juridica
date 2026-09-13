"use client";

import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { Icon } from "@/components/AppIcon";
import { useMemo, useState } from "react";
import { LawyerProfileCard } from "@/components/team/LawyerProfileCard";
import { AdvogadoPublicoType } from "@/@core/types";
import { useTranslations } from "next-intl";

type Props = {
  lawyers: AdvogadoPublicoType[];
};

export function LawyerCarousel({ lawyers }: Props) {
  const t = useTranslations("public.home.team");
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleLawyers = useMemo(() => {
    if (lawyers.length === 0) return [];

    return Array.from({ length: Math.min(3, lawyers.length) }, (_, index) => {
      return lawyers[(activeIndex + index) % lawyers.length];
    });
  }, [activeIndex, lawyers]);

  const handlePrevious = () => {
    setActiveIndex(
      (current) => (current - 1 + lawyers.length) % lawyers.length,
    );
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % lawyers.length);
  };

  return (
    <Container maxWidth="lg">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {t("title")}
          </Typography>
          <Typography color="text.secondary" mt={1}>
            {t("subtitle")}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={handlePrevious}
            aria-label="Anterior"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <Icon icon="mdi:chevron-left" width={22} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            aria-label="Próximo"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <Icon icon="mdi:chevron-right" width={22} />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 3,
        }}
      >
        {visibleLawyers.map((lawyer) => (
          <LawyerProfileCard key={lawyer.uuid} lawyer={lawyer} />
        ))}
      </Box>

      <Stack alignItems="center" mt={4}>
        <Button
          component={Link}
          href="/equipe"
          variant="contained"
          endIcon={<Icon icon="mdi:arrow-right" />}
          sx={{ textTransform: "none", borderRadius: "999px", px: 3 }}
        >
          {t("button")}
        </Button>
      </Stack>
    </Container>
  );
}
