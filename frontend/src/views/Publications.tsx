"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import ConfirmDialog from "@/components/users/ConfirmDialog";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicacaoItem, StatusPublicacao } from "@/api/publicacoes/types";
import { useAuth } from "@/hooks/useAuth";
import {
  atualizarPublicacaoClient,
  deletarPublicacaoClient,
  listarPublicacoesClient,
} from "@/api/publicacoes/apiPublicacoesClient";
import { toast } from "@/utils/toast";
import { useTranslations } from "next-intl";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const STATUS_TABS: StatusPublicacao[] = ["publicado", "rascunho", "arquivado"];

export default function PublicationsView() {
  const { hasRole } = useAuth();
  const t = useTranslations("internal.publications");
  const loadErrorFallback = t("errors.load");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<PublicacaoItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] =
    useState<StatusPublicacao>("publicado");
  const [deleteTarget, setDeleteTarget] = useState<PublicacaoItem | null>(null);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const canManagePublications = hasRole("admin") || hasRole("advogado");

  useEffect(() => {
    let active = true;

    const loadPublicacoes = async () => {
      setLoadingPosts(true);
      setLoadError(null);

      try {
        const data = await listarPublicacoesClient();

        if (active) {
          setPosts(data);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : loadErrorFallback,
          );
        }
      } finally {
        if (active) {
          setLoadingPosts(false);
        }
      }
    };

    loadPublicacoes();

    return () => {
      active = false;
    };
  }, [loadErrorFallback]);

  const filteredPosts = useMemo(() => {
    const term = normalize(search);
    const postsByStatus = posts.filter(
      (post) => (post.status ?? "publicado") === activeStatus,
    );

    if (!term) return postsByStatus;

    return postsByStatus.filter((post) =>
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
  }, [activeStatus, posts, search]);

  const statusCounts = useMemo(() => {
    return STATUS_TABS.reduce(
      (acc, status) => ({
        ...acc,
        [status]: posts.filter(
          (post) => (post.status ?? "publicado") === status,
        ).length,
      }),
      {} as Record<StatusPublicacao, number>,
    );
  }, [posts]);

  const archivePost = async (post: PublicacaoItem) => {
    if (processingPostId) return;

    setProcessingPostId(post.id);

    try {
      const updated = await atualizarPublicacaoClient(post.id, {
        status: "arquivado",
      });

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                ...updated,
                status: "arquivado",
              }
            : item,
        ),
      );
      toast.success(t("toast.archived"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.archive"));
    } finally {
      setProcessingPostId(null);
    }
  };

  const confirmDeletePost = async () => {
    if (!deleteTarget || processingPostId) return;

    setProcessingPostId(deleteTarget.id);

    try {
      await deletarPublicacaoClient(deleteTarget.id);
      setPosts((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      toast.success(t("toast.deleted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.delete"));
    } finally {
      setProcessingPostId(null);
    }
  };

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
                {t("title")}
              </Typography>
              <Typography color="text.secondary" fontSize="0.94rem">
                {t("subtitle")}
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
                {t("add")}
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
            <Tabs
              value={activeStatus}
              onChange={(_, value: StatusPublicacao) => setActiveStatus(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                minHeight: 38,
                "& .MuiTab-root": {
                  minHeight: 38,
                  textTransform: "none",
                  fontWeight: 700,
                },
              }}
            >
              {STATUS_TABS.map((status) => (
                <Tab
                  key={status}
                  value={status}
                  label={`${t(`tabs.${status}`)} (${statusCounts[status] ?? 0})`}
                />
              ))}
            </Tabs>

            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
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

          {loadingPosts ? (
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
              <Typography color="text.secondary" fontSize="0.9rem">
                {t("loading")}
              </Typography>
            </Paper>
          ) : filteredPosts.length === 0 ? (
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
                  ? t("empty.searchTitle")
                  : loadError
                    ? t("empty.loadTitle")
                    : t("empty.statusTitle", {
                        status: t(`tabs.${activeStatus}`).toLowerCase(),
                      })}
              </Typography>
              <Typography color="text.secondary" fontSize="0.9rem" mt={0.5}>
                {loadError
                  ? loadError
                  : search
                    ? t("empty.searchSubtitle")
                    : canManagePublications
                      ? t("empty.manageSubtitle")
                      : t("empty.userSubtitle")}
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
                  {t("add")}
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
                      {t(`status.${post.status ?? "publicado"}`)} • {post.data}{" "}
                      • {post.readTime}
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
                      {t("byAuthor", { author: post.autor })}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t("actions.edit")}>
                        <IconButton
                          component={Link}
                          href={`/publicacoes/editar/${post.id}`}
                          aria-label={t("actions.edit")}
                          size="small"
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Icon icon="mdi:pencil-outline" width={19} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t("actions.archive")}>
                        <span>
                          <IconButton
                            aria-label={t("actions.archive")}
                            size="small"
                            disabled={
                              post.status === "arquivado" ||
                              processingPostId === post.id
                            }
                            onClick={() => archivePost(post)}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Icon icon="mdi:archive-outline" width={19} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title={t("actions.delete")}>
                        <span>
                          <IconButton
                            aria-label={t("actions.delete")}
                            size="small"
                            disabled={processingPostId === post.id}
                            onClick={() => setDeleteTarget(post)}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              color: "error.main",
                            }}
                          >
                            <Icon icon="mdi:trash-can-outline" width={19} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Container>
      </Box>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("deleteDialog.title")}
        description={
          deleteTarget
            ? t("deleteDialog.description", { title: deleteTarget.titulo })
            : undefined
        }
        confirmText={t("deleteDialog.confirm")}
        cancelText={t("deleteDialog.cancel")}
        loading={Boolean(deleteTarget && processingPostId === deleteTarget.id)}
        onConfirm={confirmDeletePost}
        onClose={() => {
          if (processingPostId) return;
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
