"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTranslations } from "next-intl";
import {
  AdvogadoPublicoType,
  CategoriaType,
  LawyerCardType,
} from "@/@core/types";
import { formatToastErrorMessage, toast } from "@/utils/toast";
import { categoriaNomeParaChave } from "@/constants/categorias";
import { getCategorias } from "@/api/ApiCategorias";
import SpecialtyLawyersCarousel from "./SpecialtyLawyersCarousel";
import { getAdvogadosPublicos } from "@/api/ApiAdvogados";

import { advogadoHref, advogadoOab } from "@/utils/advogadoPublico";

type Props = {
  translations: ReturnType<typeof useTranslations>;
  advogados?: AdvogadoPublicoType[];
};

export default function SpecialtiesSection({ translations }: Props) {
  const t = translations;
  const tPracticeAreas = useTranslations("internal.profile.practiceAreas");

  const [advogadosCategoria, setAdvogadosCategoria] = useState<
    AdvogadoPublicoType[]
  >([]);
  const [loadingAdvogados, setLoadingAdvogados] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<CategoriaType | null>(null);
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    if (!selectedSpecialty) {
      setAdvogadosCategoria([]);
      return;
    }

    const loadAdvogados = async () => {
      setLoadingAdvogados(true);

      try {
        const response = await getAdvogadosPublicos(selectedSpecialty.id);
        setAdvogadosCategoria(response.data);
      } catch (err) {
        toast.error(formatToastErrorMessage(err, t("toast.loadLawyersError")));
      } finally {
        setLoadingAdvogados(false);
      }
    };

    loadAdvogados();
  }, [selectedSpecialty, t]);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const response = await getCategorias();
        setCategorias(response.data);
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

  const handleToggle = (categoria: CategoriaType) => {
    setSelectedSpecialty((prev) =>
      prev?.id === categoria.id ? null : categoria,
    );
  };

  const lawyersForSpecialty: LawyerCardType[] = advogadosCategoria.map(
    (advogado) => ({
      id: advogado.uuid,
      href: advogadoHref(advogado),
      name: advogado.name,
      image: advogado.foto_perfil_url ?? undefined,
      role: t("specialities.roleAdvogado"),
      oab: advogadoOab(advogado) ?? "",
      description: advogado.resumo_pessoal ?? "",
    }),
  );

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
            const isSelected = selectedSpecialty?.id === categoria.id;

            return (
              <Box
                key={categoria.id}
                onClick={() => handleToggle(categoria)}
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

      {selectedSpecialty &&
        (loadingAdvogados ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <SpecialtyLawyersCarousel
            translations={t}
            title={`${t("specialities.expertsIn")}${traduzirNome(
              selectedSpecialty.nome,
            )}`}
            lawyers={lawyersForSpecialty}
          />
        ))}
    </Container>
  );
}
