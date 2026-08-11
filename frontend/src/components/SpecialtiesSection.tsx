"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Box,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { teamLawyers } from "@/data/team";
import { useTranslations } from "next-intl";
import { CategoriaType } from "@/@core/types";
import { formatToastErrorMessage, toast } from "@/utils/toast";
import { categoriaNomeParaChave } from "@/constants/categorias";
import { getCategorias } from "@/api/ApiCategorias";
import SpecialtyLawyersCarousel from "./SpecialtyLawyersCarousel";

type Props = {
  translations: ReturnType<typeof useTranslations>;
};

export default function SpecialtiesSection({ translations }: Props) {
  const t = translations;
  const tPracticeAreas = useTranslations("internal.profile.practiceAreas");

  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const { data } = await getCategorias();
        setCategorias(data);
      } catch (err) {
        toast.error(
          formatToastErrorMessage(err, t("toast.loadCategoriesError")),
        );
      } finally {
        setLoadingCategorias(false);
      }
    };
    loadCategorias();
  }, [t]);

  const traduzirNome = (nome: string) => {
    const chave = categoriaNomeParaChave[nome];
    return chave ? tPracticeAreas(chave) : nome;
  };

  const lawyersForSpecialty = selectedSpecialty
    ? teamLawyers.filter((lawyer) =>
        lawyer.specialties.includes(selectedSpecialty),
      )
    : [];

  const handleToggle = (nome: string) => {
    setSelectedSpecialty((prev) => (prev === nome ? null : nome));
  };

  return (
    <Container>
      <Typography variant="h4" textAlign="center" mb={4}>
        {t("specialities.title")}
      </Typography>
      <Typography variant="h6" textAlign="center" mb={6}>
        {t("specialities.subtitle")}
      </Typography>

      {loadingCategorias ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
          {categorias.map((categoria) => {
            const isSelected = selectedSpecialty === categoria.nome;
            return (
              <Box
                key={categoria.id}
                onClick={() => handleToggle(categoria.nome)}
                sx={{
                  width: { xs: "45%", md: "30%" },
                  p: 3,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: isSelected ? "primary.main" : "background.paper",
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 3,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Typography
                  fontWeight="bold"
                  color={isSelected ? "primary.contrastText" : "text.primary"}
                >
                  {traduzirNome(categoria.nome)}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}

      {selectedSpecialty && (
        <SpecialtyLawyersCarousel
          translations={t}
          title={`${t("specialities.expertsIn")}${traduzirNome(selectedSpecialty)}`}
          lawyers={lawyersForSpecialty}
        />
      )}
    </Container>
  );
}
