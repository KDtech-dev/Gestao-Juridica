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
import { publicacoes as posts } from "@/data/publicacoes";
import { useAuth } from "@/hooks/useAuth";

export default function PublicationsView() {
  const { hasRole } = useAuth();
  const canManagePublications = hasRole("admin") || hasRole("advogado");
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
                Notícias jurídicas, análises práticas e conteúdos do escritório.
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
                Nova Publicação
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
              placeholder={"Buscar por título, categoria ou autor..."}
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

          <Stack spacing={1.5}>
            {posts.map((post) => (
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
                    href={`/publicacoes/${post.slug}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderColor: "divider",
                    }}
                  >
                    Ler Publicação
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
