"use client";
import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AdvogadoPublicoType } from "@/@core/types";

type Props = {
  lawyer: AdvogadoPublicoType;
};

export function LawyerProfileCard({ lawyer }: Props) {
  const oab = lawyer.advogado
    ? `OAB/${lawyer.advogado.oab_uf} ${lawyer.advogado.oab_numero}`
    : null;
  const categories = lawyer.advogado?.categorias ?? [];
  const initials = lawyer.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Paper
      sx={{
        "--lawyer-accent": lawyer.cor_perfil ?? "currentColor",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 18px 42px rgba(0,0,0,0.22)"
            : "0 16px 36px rgba(15,23,42,0.08)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 0 auto",
          height: 4,
          bgcolor: "var(--lawyer-accent)",
        },
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "divider",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 24px 52px rgba(0,0,0,0.34)"
              : "0 24px 48px rgba(15,23,42,0.14)",
        },
      }}
    >
      <Stack spacing={2.4} height="100%" p={{ xs: 2.5, sm: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              position: "relative",
              flexShrink: 0,
              "&::after": {
                content: '""',
                position: "absolute",
                right: 2,
                bottom: 4,
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: "var(--lawyer-accent)",
                border: "2px solid",
                borderColor: "background.paper",
                boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
              },
            }}
          >
            <Avatar
              src={lawyer.advogado?.foto_perfil_url ?? undefined}
              alt={lawyer.name}
              sx={{
                width: 84,
                height: 84,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "1.35rem",
                fontWeight: 800,
                border: "3px solid",
                borderColor: "background.paper",
                boxShadow: "0 12px 26px rgba(15,23,42,0.18)",
              }}
            >
              {initials}
            </Avatar>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={850}
              color="text.primary"
              lineHeight={1.2}
              fontSize="1.08rem"
            >
              {lawyer.name}
            </Typography>
            {oab && (
              <Typography
                color="primary"
                fontSize="0.78rem"
                fontWeight={700}
                mt={0.7}
                sx={{ textTransform: "uppercase" }}
              >
                {oab}
              </Typography>
            )}
          </Box>
        </Stack>

        <Typography
          color="text.secondary"
          fontSize="0.95rem"
          lineHeight={1.7}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {lawyer.advogado?.resumo_pessoal ?? ""}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} mt="auto">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.nome}
              size="small"
              variant="outlined"
              sx={{
                height: 28,
                borderRadius: 1.5,
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.28),
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                color: "text.primary",
                fontWeight: 650,
                "& .MuiChip-label": {
                  px: 1.2,
                },
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
