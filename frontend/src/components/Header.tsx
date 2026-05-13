"use client";

import { Box, Container, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/useAuth";
import { getRouteByRole } from "@/utils/redirectByRole";

export function Header() {
  const { isAuthenticated, user, loading } = useAuth();
  const accessHref = isAuthenticated && user ? getRouteByRole(user.roles) : "/login";

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
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ bgcolor: "#2563eb", p: 1, borderRadius: 2 }}>
              <Icon icon="mdi:scale-balance" color="#fff" />
            </Box>

            <Box>
              <Typography fontWeight="bold">Central jurídica</Typography>
              <Typography variant="caption" color="text.secondary">
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
                href="/publicacoes?origem=home"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                Publicações
              </Button>
              <Button
                component={Link}
                href="/#equipe"
                variant="text"
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  fontWeight: 700,
                  px: { xs: 1, sm: 1.5 },
                }}
              >
                Equipe
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
                {isAuthenticated ? "Acessar" : "Login"}
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
