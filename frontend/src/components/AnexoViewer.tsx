"use client";

import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useEffect, useState } from "react";
import api from "@/configs/axios";

type AnexoViewerProps = {
  nomeArquivo: string;
  url: string;
  downloadUrl: string;
};

export function AnexoViewer({
  nomeArquivo,
  url,
  downloadUrl,
}: AnexoViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [arquivoUrl, setArquivoUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const extensao =
    nomeArquivo.split(".").pop()?.toLowerCase() ?? "";

  const isPdf = extensao === "pdf";

  const isImage = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "svg",
  ].includes(extensao);

  useEffect(() => {
    let blobUrl: string | null = null;

    const carregarArquivo = async () => {
      try {
        setCarregando(true);

        const response = await api.get(url, {
          responseType: "blob",
        });

        blobUrl = URL.createObjectURL(response.data);

        setArquivoUrl(blobUrl);
      } catch (error) {
        console.error(
          "Erro ao carregar anexo:",
          error
        );
      } finally {
        setCarregando(false);
      }
    };

    carregarArquivo();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  const aumentarZoom = () => {
    setZoom((value) => Math.min(value + 0.1, 3));
  };

  const diminuirZoom = () => {
    setZoom((value) => Math.max(value - 0.1, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "+" || event.key === "=") {
        aumentarZoom();
      }

      if (event.key === "-") {
        diminuirZoom();
      }

      if (event.key === "0") {
        resetZoom();
      }

      if (event.key === "Escape") {
        window.history.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  const voltar = () => {
    window.close();
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#252525",
          borderBottom:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "58px !important",
            px: { xs: 1, md: 2 },
          }}
        >
          <Tooltip title="Voltar">
            <IconButton
              onClick={voltar}
              sx={{
                color: "white",
                mr: 1,
              }}
            >
              <Icon
                icon="mdi:arrow-left"
                width={22}
              />
            </IconButton>
          </Tooltip>

          <Typography
            sx={{
              flex: 1,
              color: "white",
              fontSize: {
                xs: 13,
                md: 15,
              },
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={nomeArquivo}
          >
            {nomeArquivo}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.3}
          >
            {isImage && (
              <>
                <Tooltip title="Diminuir zoom">
                  <IconButton
                    onClick={diminuirZoom}
                    sx={{ color: "white" }}
                  >
                    <Icon
                      icon="mdi:magnify-minus-outline"
                      width={21}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Redefinir zoom">
                  <IconButton
                    onClick={resetZoom}
                    sx={{
                      color: "white",
                      minWidth: 45,
                      fontSize: 13,
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </IconButton>
                </Tooltip>

                <Tooltip title="Aumentar zoom">
                  <IconButton
                    onClick={aumentarZoom}
                    sx={{ color: "white" }}
                  >
                    <Icon
                      icon="mdi:magnify-plus-outline"
                      width={21}
                    />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Tooltip title="Baixar">
              <IconButton
                component="a"
                href={downloadUrl}
                sx={{ color: "white" }}
              >
                <Icon
                  icon="mdi:download-outline"
                  width={22}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="Abrir em nova aba">
              <IconButton
                component="a"
                href={arquivoUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "white",
                  pointerEvents: arquivoUrl
                    ? "auto"
                    : "none",
                  opacity: arquivoUrl ? 1 : 0.5,
                }}
              >
                <Icon
                  icon="mdi:open-in-new"
                  width={21}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: isImage
            ? "flex-start"
            : "stretch",
          p: isImage
            ? { xs: 2, md: 4 }
            : 0,
        }}
      >
        {carregando && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: "100%",
              color: "white",
            }}
          >
            <Typography>
              Carregando arquivo...
            </Typography>
          </Stack>
        )}

        {!carregando && !arquivoUrl && (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{
              width: "100%",
              color: "white",
              p: 4,
            }}
          >
            <Icon
              icon="mdi:alert-circle-outline"
              width={64}
              height={64}
            />

            <Typography variant="h6">
              Não foi possível carregar o arquivo
            </Typography>
          </Stack>
        )}

        {!carregando && arquivoUrl && isPdf && (
          <Box
            component="iframe"
            src={arquivoUrl}
            title={nomeArquivo}
            sx={{
              width: "100%",
              height: "100%",
              border: 0,
              bgcolor: "white",
            }}
          />
        )}

        {!carregando && arquivoUrl && isImage && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              minWidth: "100%",
              minHeight: "100%",
            }}
          >
            <Box
              component="img"
              src={arquivoUrl}
              alt={nomeArquivo}
              sx={{
                maxWidth: "none",
                width: `${zoom * 100}%`,
                height: "auto",
                objectFit: "contain",
                transition:
                  "width 0.15s ease",
                borderRadius: 1,
                boxShadow:
                  "0 4px 30px rgba(0,0,0,0.35)",
              }}
            />
          </Box>
        )}

        {!carregando &&
          arquivoUrl &&
          !isPdf &&
          !isImage && (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{
                width: "100%",
                color: "white",
                p: 4,
              }}
            >
              <Icon
                icon="mdi:file-outline"
                width={64}
                height={64}
              />

              <Typography variant="h6">
                Visualização não disponível
              </Typography>

              <Typography
                color="rgba(255,255,255,0.65)"
                textAlign="center"
              >
                Este tipo de arquivo não pode ser
                visualizado diretamente no navegador.
              </Typography>
            </Stack>
          )}
      </Box>
    </Box>
  );
}