"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { teamSpecialties } from "@/data/team";
import { useState } from "react";
import { PrivacyTermsModal } from "@/components/PrivacyTermsModal";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";

export function Footer() {
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  const telefone = "5533999377986";

  const email = "contato@centraljuridica.com.br";

  const mensagem = "Olá, gostaria de agendar uma consulta jurídica.";
  const whatsappHref = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  // backend/storage/app/public/logo.png -> normalmente acessível como /storage/logo.png no Laravel
  const logoSrc = "/logo.png";

  return (
    <Box
      component="footer"
      sx={{ bgcolor: "#0b1220", color: "rgba(255,255,255,0.92)" }}
    >
      {/* CTA acima do footer */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 45%, rgba(30,58,138,0.65) 100%)",
        }}
      >
        <Container
          maxWidth="xl"
          disableGutters
          sx={{ px: { xs: 2, md: 3 }, py: { xs: 8, md: 10 } }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 4, md: 6 }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ maxWidth: 680 }}>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  letterSpacing: "-0.02em",
                  mb: 1.2,
                  fontSize: { xs: "1.6rem", md: "2.1rem" },
                }}
              >
                Agende sua primeira consulta jurídica sem custo.
              </Typography>
              <Typography
                color="rgba(255,255,255,0.7)"
                sx={{
                  maxWidth: 560,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.65,
                }}
              >
                Atendimentos com análise técnica e orientação estratégica, com
                clareza desde o primeiro contato.
              </Typography>
            </Box>

            <Button
              component="a"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<Icon icon="mdi:whatsapp" width={20} />}
              sx={{
                alignSelf: { xs: "flex-start", md: "auto" },
                bgcolor: "#05a13e",
                borderRadius: "999px",
                px: 3,
                py: 1.25,
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "0 10px 30px rgba(5,161,62,0.18)",
                transition:
                  "transform 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
                "&:hover": {
                  bgcolor: "#04923a",
                  boxShadow: "0 14px 40px rgba(5,161,62,0.28)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Falar no WhatsApp
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Linha sutil separando CTA e footer principal */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      {/* Footer principal em 4 colunas */}
      <Container
        maxWidth="xl"
        disableGutters
        sx={{ px: { xs: 2, md: 3 }, py: { xs: 7, md: 10 } }}
      >
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
          {/* Coluna 1 */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Stack spacing={2.2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  component="img"
                  src={logoSrc}
                  alt="Logo"
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    objectFit: "contain",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))",
                  }}
                />

                <Box>
                  <Typography fontWeight={900} sx={{ fontSize: "1.05rem" }}>
                    Central Jurídica
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Advocacia & Consultoria
                  </Typography>
                </Box>
              </Stack>

              <Typography
                color="rgba(255,255,255,0.65)"
                sx={{ lineHeight: 1.7 }}
              >
                Atuação estratégica para pessoas e empresas, com foco em
                segurança jurídica e resultados.
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ pt: 0.5, flexWrap: "wrap" }}
              >
                {[
                  { icon: "mdi:instagram", label: "Instagram" },
                  { icon: "mdi:linkedin", label: "LinkedIn" },
                  { icon: "mdi:facebook", label: "Facebook" },
                ].map((s) => (
                  <Button
                    key={s.label}
                    component={Link}
                    href="/"
                    variant="text"
                    aria-label={s.label}
                    sx={{
                      minWidth: 50,
                      p: 0,
                      color: "rgba(255,255,255,0.72)",
                      transition: "opacity 200ms ease, transform 200ms ease",
                      "&:hover": {
                        opacity: 0.95,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <Icon icon={s.icon} width={20} />
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Coluna 2 */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <Stack spacing={1.4}>
              <Typography fontWeight={900} sx={{ fontSize: "1.02rem" }}>
                Especialidades
              </Typography>

              <Stack
                component="ul"
                spacing={0.9}
                sx={{ listStyle: "none", p: 0, m: 0 }}
              >
                {teamSpecialties.map((esp) => (
                  <Box key={esp} component="li">
                    <Typography
                      color="rgba(255,255,255,0.66)"
                      sx={{
                        fontWeight: 650,
                        fontSize: "0.95rem",
                        lineHeight: 1.55,
                      }}
                    >
                      {esp}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Coluna 3 */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1.4}>
              <Typography fontWeight={900} sx={{ fontSize: "1.02rem" }}>
                Navegação
              </Typography>

              <Stack
                component="ul"
                spacing={0.9}
                sx={{ listStyle: "none", p: 0, m: 0 }}
              >
                {[
                  { label: "Início", href: "/" },
                  { label: "Sobre", href: "/sobre" },
                  { label: "Publicações", href: "/posts" },
                  { label: "Contato", href: whatsappHref },
                  { label: "Política de Privacidade", onClick: () => setOpenPrivacy(true) },
                  { label: "Termos", onClick: () => setOpenTerms(true) },
                ].map((item) => (
                  <Box key={item.label} component="li">
                    <MuiLink
                      component="button"
                      type="button"
                      underline="none"
                      onClick={item.onClick}
                      color="rgba(255,255,255,0.7)"
                      sx={{
                        background: "transparent",
                        border: 0,
                        p: 0,
                        fontFamily: "inherit",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        transition:
                          "color 200ms ease, opacity 200ms ease, transform 200ms ease",
                        "&:hover": {
                          color: "rgba(255,255,255,0.95)",
                          opacity: 1,
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {item.label}
                    </MuiLink>
                  </Box>
                ))}

              </Stack>
            </Stack>
          </Grid>

          {/* Coluna 4 */}
          <Grid size={{ xs: 12, md: 2.999 }}>
            <Stack spacing={1.4}>
              <Typography fontWeight={900} sx={{ fontSize: "1.02rem" }}>
                Contato
              </Typography>

              <Stack spacing={1.1}>
                <Stack direction="row" spacing={1.1} alignItems="flex-start">
                  <Icon
                    icon="mdi:map-marker-outline"
                    width={50}
                    style={{ marginTop: 2 }}
                  />
                  <Typography
                    color="rgba(255,255,255,0.66)"
                    sx={{ lineHeight: 1.55 }}
                  >
                    R. Argemiro Aguilar, N° 763, Almenara - MG, CEP: 39900-000
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Icon icon="mdi:phone-outline" width={25} />
                  <Typography
                    color="rgba(255,255,255,0.66)"
                    sx={{ fontWeight: 850 }}
                  >
                    {telefone}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Icon icon="mdi:email-outline" width={30} />
                  <Typography
                    color="rgba(255,255,255,0.66)"
                    sx={{ fontWeight: 850 }}
                  >
                    {email}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Barra inferior */}
        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            borderTop: "1px solid rgba(255,255,255,0.08)",
            pt: { xs: 3.5, md: 4 },
          }}
        >

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.55)"
                sx={{ fontWeight: 850 }}
              >
                © {new Date().getFullYear()} Central Jurídica — Todos os
                direitos reservados
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2 }}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <MuiLink
                  component="button"
                  type="button"
                  onClick={() => setOpenPrivacy(true)}
                  underline="none"
                  color="rgba(255,255,255,0.62)"
                  sx={{
                    fontWeight: 900,
                    transition: "color 200ms ease, opacity 200ms ease",
                    "&:hover": { color: "rgba(255,255,255,0.92)", opacity: 1 },
                  }}
                >
                  Política de Privacidade
                </MuiLink>

                <MuiLink
                  component="button"
                  type="button"
                  onClick={() => setOpenTerms(true)}
                  underline="none"
                  color="rgba(255,255,255,0.62)"
                  sx={{
                    fontWeight: 900,
                    transition: "color 200ms ease, opacity 200ms ease",
                    "&:hover": { color: "rgba(255,255,255,0.92)", opacity: 1 },
                  }}
                >
                  Termos
                </MuiLink>


                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.55)"
                  sx={{ fontWeight: 850 }}
                >
                  Desenvolvido por{" "}
                  <span style={{ color: "rgba(255,255,255,0.78)" }}>
                    KDtech
                  </span>
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <PrivacyPolicyModal open={openPrivacy} onClose={() => setOpenPrivacy(false)} />
      <PrivacyTermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
    </Box>
  );
}

