"use client";

import { Box, Container, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getRouteByRole } from "@/utils/redirectByRole";
import { logoSrc } from "./Footer";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("public.header");
  const { isAuthenticated, user, loading } = useAuth();
  const accessHref =
    isAuthenticated && user ? getRouteByRole(user.roles) : "/login";

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          py={2}
        >
          <Stack
            component={Link}
            href="/"
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              minWidth: 0,
              color: "text.primary",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt="Central Jurídica"
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                objectFit: "contain",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))",
              }}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                fontWeight={900}
                sx={{ fontSize: "0.95rem", lineHeight: 1.1 }}
              >
                Central Jurídica
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.35, lineHeight: 1.1, fontSize: "0.75rem" }}
              >
                Advocacia & Consultoria
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Stack
              component="nav"
              direction="row"
              spacing={{ xs: 0.5, sm: 1 }}
              alignItems="center"
            >
              <Button
                component={Link}
                href="/"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                {t("home")}
              </Button>
              <Button
                component={Link}
                href="/posts"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                {t("publications")}
              </Button>
              <Button
                component={Link}
                href="/equipe"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                {t("team")}
              </Button>
            </Stack>

            {!loading && (
              <Button
                component={Link}
                href={accessHref}
                variant="contained"
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: "999px",
                  px: 3,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                {isAuthenticated ? t("access") : t("login")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
