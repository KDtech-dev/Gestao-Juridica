"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { GridDePublicacoes } from "@/components/publications/GridDePublicacoes";
import { PublicacoesHeroSlider } from "@/components/publications/PublicacoesHeroSlider";
import type { PublicacaoItem } from "@/api/publicacoes/types";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type PublicacoesViewProps = {
  publicacoes: PublicacaoItem[];
};

const PublicacoesView = ({ publicacoes }: PublicacoesViewProps) => {
  const [titleFilter, setTitleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    title: "",
    category: "",
  });

  const categorias = useMemo(
    () => Array.from(new Set(publicacoes.map((item) => item.categoria))).sort(),
    [publicacoes],
  );

  const publicacoesFiltradas = useMemo(() => {
    const title = normalizeSearch(appliedFilters.title);
    const category = normalizeSearch(appliedFilters.category);

    return publicacoes.filter((publicacao) => {
      const matchesTitle =
        !title || normalizeSearch(publicacao.titulo).includes(title);
      const matchesCategory =
        !category || normalizeSearch(publicacao.categoria) === category;

      return matchesTitle && matchesCategory;
    });
  }, [appliedFilters, publicacoes]);

  const handleSearch = () => {
    setAppliedFilters({
      title: titleFilter,
      category: categoryFilter,
    });
  };

  const handleClearFilters = () => {
    setTitleFilter("");
    setCategoryFilter("");
    setAppliedFilters({ title: "", category: "" });
  };

  const searchCard = (
    <Paper
      component="form"
      elevation={0}
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch();
      }}
      sx={{
        p: { xs: 2, sm: 2.4 },
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 16px 34px rgba(15, 23, 42, 0.28)",
      }}
    >
      <Typography
        component="h2"
        textAlign="center"
        fontWeight={800}
        sx={{ color: "primary.main", fontSize: "1.2rem", mb: 0.4 }}
      >
        Localizar Publicações
      </Typography>
      <Typography
        textAlign="center"
        sx={{ color: "text.secondary", fontSize: "0.78rem", mb: 1.5 }}
      >
        Encontre conteúdos por título ou categoria.
      </Typography>

      <Stack spacing={1}>
        <TextField
          value={titleFilter}
          onChange={(event) => setTitleFilter(event.target.value)}
          placeholder="Título da Publicação"
          fullWidth
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "7px",
              bgcolor: "background.default",
              minHeight: 44,
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
            "& input": {
              color: "text.primary",
              fontWeight: 600,
              fontSize: "0.82rem",
              "&::placeholder": {
                color: "text.secondary",
                opacity: 0.9,
              },
            },
          }}
        />

        <TextField
          select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          fullWidth
          size="small"
          SelectProps={{
            displayEmpty: true,
            renderValue: (selected) =>
              selected ? String(selected) : "Categoria",
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "7px",
              bgcolor: "background.default",
              minHeight: 44,
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
            "& .MuiSelect-select": {
              color: "text.primary",
              fontWeight: 600,
              fontSize: "0.82rem",
            },
          }}
        >
          <MenuItem value="">Todas as categorias</MenuItem>
          {categorias.map((categoria) => (
            <MenuItem key={categoria} value={categoria}>
              {categoria}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Icon icon="mdi:magnify" width={18} />}
            sx={{
              flex: 1,
              borderRadius: "7px",
              textTransform: "none",
              fontWeight: 800,
              minHeight: 32,
            }}
          >
            Localizar
          </Button>
          <Button
            type="button"
            variant="outlined"
            startIcon={<Icon icon="mdi:filter-remove" width={18} />}
            onClick={handleClearFilters}
            sx={{
              flex: 1,
              borderColor: "divider",
              color: "primary.main",
              borderRadius: "7px",
              textTransform: "none",
              fontWeight: 800,
              minHeight: 32,
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            Limpar filtros
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Header />
      <PublicacoesHeroSlider
        publicacoes={publicacoes}
        searchCard={searchCard}
      />

      <Box id="publicacoes-lista" py={8} sx={{ scrollMarginTop: "80px" }}>
        {publicacoesFiltradas.length > 0 ? (
          <GridDePublicacoes
            key={`${appliedFilters.title}-${appliedFilters.category}`}
            publicacoes={publicacoesFiltradas}
            hideVerMais
            clientPageSize={12}
          />
        ) : (
          <Container maxWidth="md">
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Icon icon="mdi:file-search-outline" width={42} />
              <Typography fontWeight={800} color="text.primary" mt={1}>
                Nenhuma publicação encontrada
              </Typography>
              <Typography color="text.secondary" fontSize="0.9rem" mt={0.5}>
                Tente buscar por outro título ou categoria.
              </Typography>
            </Paper>
          </Container>
        )}
      </Box>

      <Footer />
    </Box>
  );
};

export default PublicacoesView;
