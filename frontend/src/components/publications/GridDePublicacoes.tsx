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
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CardPublicacao } from "@/components/publications/CardPublicacao";
import { useTranslations } from "next-intl";
import { PublicacaoType } from "@/@core/types";

type GridDePublicacoesProps = {
  publicacoes: PublicacaoType[];
  title?: string;
  subtitle?: string;
  hideVerMais?: boolean;
  controlledPage?: number;
  controlledPageCount?: number;
  onPageChange?: (page: number) => void;
  clientPageSize?: number;
  verMaisHref?: string;
};

export function GridDePublicacoes({
  publicacoes,
  title,
  subtitle,
  hideVerMais = false,
  controlledPage,
  controlledPageCount,
  onPageChange,
  clientPageSize,
  verMaisHref = "/publicacoes",
}: GridDePublicacoesProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const t = useTranslations("public.publications");
  const shouldScrollToTopRef = useRef(false);

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

  useEffect(() => {
    if (!shouldScrollToTopRef.current) return;

    shouldScrollToTopRef.current = false;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const firstFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    return () => window.cancelAnimationFrame(firstFrame);
  }, [boundedPage]);

  const handlePageChange = (value: number) => {
    shouldScrollToTopRef.current = true;

    if (isControlled) {
      onPageChange?.(value);
    } else {
      setPage(value);
    }
  };

  return (
    <Container
      component="section"
      maxWidth={false}
      sx={{ mb: 8, maxWidth: { lg: 1680, xl: 1840 } }}
    >
      <Box sx={{ minHeight: 300 }}>
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          sx={{ color: "text.primary", mb: 1 }}
        >
          {title ?? t("sectionTitle")}
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ color: "text.secondary", mb: 4, fontSize: { xs: 16, md: 18 } }}
        >
          {subtitle ?? t("sectionSubtitle")}
        </Typography>

        <Grid
          container
          columns={{ xs: 12, sm: 12, md: 12, lg: 16, xl: 16 }}
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          {publicacoesPaginadas.map((publicacao) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 4 }}
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
              onChange={(_, value) => handlePageChange(value)}
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
          <Box
            display="flex"
            justifyContent="center"
            sx={{ my: { xs: 5, md: 8 } }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(verMaisHref)}
              sx={{ textTransform: "none" }}
            >
              {t("seeMore")}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
