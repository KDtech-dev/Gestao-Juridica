"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";
import { formatDate, slugifyPublicacao, storageUrl } from "@/@core/format";

type PublicacoesHeroSliderProps = {
  publicacoes: PublicacaoType[];
  searchCard?: ReactNode;
};

export function PublicacoesHeroSlider({
  publicacoes,
  searchCard,
}: PublicacoesHeroSliderProps) {
  const t = useTranslations("public.publications");
  const slides = useMemo(() => publicacoes.slice(0, 5), [publicacoes]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const activeCategoria = activeSlide.categoria?.nome ?? "Publicação";
  const activeResumo = activeSlide.resumo;
  const activeData = formatDate(
    activeSlide.publicado_em ?? activeSlide.created_at,
  );
  const activeSlug = slugifyPublicacao(
    activeSlide.titulo ?? "publicacao",
    activeSlide.id,
  );
  const activeBanner =
    storageUrl(activeSlide.imagem_caminho) ??
    `/storage/publicacoes/default-publication.png`;
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: { xs: 380, md: 440 },
        color: "#fff",
        overflow: "hidden",
        backgroundColor: "#0f172a",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          transition: "background-image 0.6s ease",
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(30,41,59,0.82), rgba(30,58,138,0.72)), url(${activeBanner})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: { xs: 380, md: 440 },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: searchCard ? "minmax(0, 1fr) minmax(360px, 420px)" : "1fr",
          },
          gap: { xs: 4, md: 7 },
          alignItems: "center",
          py: { xs: 6, md: 8 },
        }}
      >
        <Box sx={{ maxWidth: 760 }}>
          <Stack direction="row" flexWrap="wrap" gap={1.2} mb={2}>
            <Typography
              component="span"
              sx={{
                px: 1.4,
                py: 0.55,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.92)",
                color: "primary.main",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {activeCategoria}
            </Typography>
            <Typography
              component="span"
              sx={{
                px: 1.4,
                py: 0.55,
                borderRadius: 999,
                bgcolor: "rgba(15,23,42,0.52)",
                border: "1px solid rgba(255,255,255,0.22)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {activeData}
            </Typography>
          </Stack>

          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              maxWidth: 760,
              fontSize: { xs: "2.1rem", md: "3.35rem" },
              lineHeight: 1.08,
              mb: 2,
            }}
          >
            {activeSlide.titulo}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 680,
              color: "rgba(255,255,255,0.86)",
              lineHeight: 1.55,
              mb: 4,
            }}
          >
            {activeResumo}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              component={Link}
              href={`/publicacoes/${activeSlug}`}
              variant="contained"
              size="large"
              sx={{ textTransform: "none", fontWeight: 800 }}
            >
              {t("readPublication")}
            </Button>
          </Stack>
        </Box>

        {searchCard ? (
          <Box
            sx={{
              width: "100%",
              maxWidth: 430,
              justifySelf: { xs: "stretch", md: "end" },
            }}
          >
            {searchCard}
          </Box>
        ) : null}
      </Container>

      {slides.length > 1 && (
        <>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              position: "absolute",
              zIndex: 2,
              right: { xs: 20, md: 48 },
              bottom: { xs: 28, md: 44 },
            }}
          >
            <IconButton
              onClick={goToPrevious}
              aria-label={t("previousPublication")}
              sx={{
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.42)",
                bgcolor: "rgba(15,23,42,0.44)",
                "&:hover": { bgcolor: "rgba(15,23,42,0.7)" },
              }}
            >
              <Icon icon="mdi:chevron-left" width={24} />
            </IconButton>
            <IconButton
              onClick={goToNext}
              aria-label={t("nextPublication")}
              sx={{
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.42)",
                bgcolor: "rgba(15,23,42,0.44)",
                "&:hover": { bgcolor: "rgba(15,23,42,0.7)" },
              }}
            >
              <Icon icon="mdi:chevron-right" width={24} />
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: "absolute",
              zIndex: 2,
              left: { xs: 20, md: 48 },
              bottom: { xs: 32, md: 48 },
            }}
          >
            {slides.map((publicacao, index) => (
              <Box
                component="button"
                key={publicacao.id}
                aria-label={t("goToPublication", {
                  title: publicacao.titulo ?? "",
                })}
                onClick={() => setActiveIndex(index)}
                sx={{
                  width: index === activeIndex ? 34 : 10,
                  height: 10,
                  border: 0,
                  borderRadius: 999,
                  cursor: "pointer",
                  bgcolor:
                    index === activeIndex ? "#fff" : "rgba(255,255,255,0.48)",
                  transition: "0.2s ease",
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
