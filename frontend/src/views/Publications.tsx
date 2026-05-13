"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import Link from "next/link";
import { useMemo, useState } from "react";
import { publicacoes as posts, type PublicacaoItem } from "@/data/publicacoes";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/context/AuthContext";
import { getStoredPublicacoes } from "@/utils/publicationsStorage";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isOwnPublication(post: PublicacaoItem, user: AuthUser | null) {
  if (!user) return false;

  const userEmail = normalize(user.email);
  const userName = normalize(user.name);

  return (
    Boolean(post.authorEmail && normalize(post.authorEmail) === userEmail) ||
    normalize(post.autor) === userName
  );
}

export default function PublicationsView() {
  const { hasRole, user } = useAuth();
  const [search, setSearch] = useState("");
  const [storedPosts] = useState<PublicacaoItem[]>(() =>
    getStoredPublicacoes(),
  );
  const canManagePublications = hasRole("admin") || hasRole("advogado");
  const allPosts = useMemo(() => {
    const storedSlugs = new Set(storedPosts.map((post) => post.slug));

    return [
      ...storedPosts,
      ...posts.filter((post) => !storedSlugs.has(post.slug)),
    ];
  }, [storedPosts]);
  const ownPosts = useMemo(
    () => allPosts.filter((post) => isOwnPublication(post, user)),
    [allPosts, user],
  );
  const filteredPosts = useMemo(() => {
    const term = normalize(search);

    if (!term) return ownPosts;

    return ownPosts.filter((post) =>
      [
        post.titulo,
        post.categoria,
        post.autor,
        post.tipo,
        post.resumo,
        post.cliente,
        post.processo,
      ].some((value) => normalize(value).includes(term)),
    );
  }, [ownPosts, search]);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "block",
      }}
    >
      <SidebarDashboard activeKey="publicacoes" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            gap={1.5}
            mb={2.2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                Publicações
              </Typography>
              <Typography color="text.secondary" fontSize="0.94rem">
                Gerencie as publicações criadas por você.
              </Typography>
            </Box>

            {canManagePublications ? (
              <Button
                component={Link}
                href="/publicacoes/nova"
                variant="contained"
                startIcon={<Icon icon="mdi:plus" />}
                sx={{
                  textTransform: "none",
                  borderRadius: "12px",
                }}
              >
                Adicionar publicação
              </Button>
            ) : null}
          </Stack>

          <Paper
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
              mb: 2,
            }}
          >
            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={"Buscar nas suas publicações..."}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:magnify" width={20} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "background.default",
                },
              }}
            />
          </Paper>

          {filteredPosts.length === 0 ? (
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                textAlign: "center",
              }}
            >
              <Icon icon="mdi:newspaper-remove-outline" width={42} />
              <Typography
                color="text.primary"
                fontWeight={700}
                fontSize="1.05rem"
                mt={1}
              >
                {search
                  ? "Nenhuma publicação encontrada"
                  : "Você ainda não criou publicações"}
              </Typography>
              <Typography color="text.secondary" fontSize="0.9rem" mt={0.5}>
                {search
                  ? "Tente buscar por outro título, categoria ou cliente."
                  : canManagePublications
                    ? "Crie sua primeira publicação para ela aparecer nesta lista."
                    : "Quando houver publicações vinculadas ao seu usuário, elas aparecerão aqui."}
              </Typography>

              {canManagePublications && !search ? (
                <Button
                  component={Link}
                  href="/publicacoes/nova"
                  variant="contained"
                  startIcon={<Icon icon="mdi:plus" />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "12px",
                    mt: 2,
                  }}
                >
                  Adicionar publicação
                </Button>
              ) : null}
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {filteredPosts.map((post) => (
                <Paper
                  key={post.id}
                  sx={{
                    p: 2.1,
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "flex-start",
                      md: "center",
                    }}
                    gap={1}
                    mb={1}
                  >
                    <Chip
                      label={post.categoria}
                      sx={{
                        bgcolor: "action.hover",
                        color: "primary.main",
                        fontWeight: 600,
                      }}
                    />
                    <Typography color="text.secondary" fontSize="0.82rem">
                      {post.data} • {post.readTime}
                    </Typography>
                  </Stack>

                  <Typography
                    fontWeight={700}
                    color="text.primary"
                    fontSize="1.08rem"
                    mb={0.7}
                  >
                    {post.titulo}
                  </Typography>
                  <Typography color="text.secondary" fontSize="0.9rem" mb={1.2}>
                    {post.resumo}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography color="text.secondary" fontSize="0.84rem">
                      Por {post.autor}
                    </Typography>
                    <Button
                      component={Link}
                      href={`/publicacoes/editar/${post.slug}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        borderColor: "divider",
                      }}
                    >
                      Editar
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    </Box>
  );
}
