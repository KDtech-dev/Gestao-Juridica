"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Pagination,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicacaoItem } from "@/data/publicacoes";
import { CardPublicacao } from "@/components/publications/CardPublicacao";

type GridDePublicacoesProps = {
  publicacoes: PublicacaoItem[];
  title?: string;
  subtitle?: string;
  hideVerMais?: boolean;
  controlledPage?: number;
  controlledPageCount?: number;
  onPageChange?: (page: number) => void;
  clientPageSize?: number;
};

export function GridDePublicacoes({
  publicacoes,
  title = "Publicações",
  subtitle = "Notícias jurídicas, análises práticas e conteúdos do escritório",
  hideVerMais = false,
  controlledPage,
  controlledPageCount,
  onPageChange,
  clientPageSize,
}: GridDePublicacoesProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const isControlled =
    typeof controlledPage === "number" &&
    typeof controlledPageCount === "number" &&
    typeof onPageChange === "function";

  const PUBLICACOES_PER_PAGE = clientPageSize ?? 12;
  const [page, setPage] = useState(1);
  const activePage = isControlled ? controlledPage : page;
  const pageCount = isControlled
    ? (controlledPageCount ?? 1)
    : Math.ceil(publicacoes.length / PUBLICACOES_PER_PAGE);
  const safePageCount = Math.max(pageCount, 1);
  const boundedPage = Math.min(activePage ?? 1, safePageCount);

  const publicacoesPaginadas = useMemo(() => {
    if (isControlled) return publicacoes;

    return publicacoes.slice(
      (boundedPage - 1) * PUBLICACOES_PER_PAGE,
      boundedPage * PUBLICACOES_PER_PAGE,
    );
  }, [PUBLICACOES_PER_PAGE, boundedPage, isControlled, publicacoes]);

  return (
    <Container component="section" maxWidth="xl" sx={{ mb: 8 }}>
      <Box sx={{ minHeight: 300 }}>
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          sx={{ color: "text.primary", mb: 1 }}
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ color: "text.secondary", mb: 4, fontSize: { xs: 16, md: 18 } }}
        >
          {subtitle}
        </Typography>

        <Grid
          container
          columns={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 20 }}
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          {publicacoesPaginadas.map((publicacao) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 4 }}
              key={publicacao.id}
            >
              <CardPublicacao publicacao={publicacao} />
            </Grid>
          ))}
        </Grid>

        {pageCount > 1 && hideVerMais && (
          <Box display="flex" justifyContent="center" sx={{ mt: 6 }}>
            <Pagination
              count={pageCount}
              page={boundedPage}
              onChange={(_, value) =>
                isControlled ? onPageChange?.(value) : setPage(value)
              }
              color="primary"
              shape="rounded"
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .Mui-selected": {
                  bgcolor: "primary.main !important",
                  color: "#fff",
                },
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        )}

        {!hideVerMais && (
          <Box display="flex" justifyContent="center" sx={{ my: { xs: 5, md: 8 } }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/publicacoes")}
              sx={{ textTransform: "none" }}
            >
              Ver mais publicações
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
