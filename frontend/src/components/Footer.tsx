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
import { Icon } from "@/components/AppIcon";
import { useState } from "react";
import { PrivacyTermsModal } from "@/components/PrivacyTermsModal";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import { useTranslations } from "next-intl";

import { logoSrc } from "@/configs/branding";
import {
  institutionalAddress,
  institutionalEmail,
  institutionalPhone,
} from "@/configs/publicContact";
import { demoOffice } from "@/configs/demoOffice";

export function Footer() {
  const t = useTranslations("public.footer");
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  const telefone = institutionalPhone;
  const endereco = [
    institutionalAddress.street,
    institutionalAddress.district,
    institutionalAddress.city,
  ].join(", ") + " – " + institutionalAddress.state;

  return (
    <Box
      component="footer"
      id="contato"
      sx={{ bgcolor: "#0b1220", color: "rgba(255,255,255,0.92)" }}
    >
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
                {t("cta.title")}
              </Typography>
              <Typography
                color="rgba(255,255,255,0.7)"
                sx={{
                  maxWidth: 560,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.65,
                }}
              >
                {t("cta.subtitle")}
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/login"
              variant="contained"
              startIcon={<Icon icon="mdi:arrow-right" width={20} />}
              sx={{
                alignSelf: { xs: "flex-start", md: "auto" },
                borderRadius: "999px",
                px: 3,
                py: 1.3,
                minHeight: 48,
                textTransform: "none",
                fontWeight: 900,
              }}
            >
              {t("cta.openDemo")}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      <Container
        maxWidth="xl"
        disableGutters
        sx={{ px: { xs: 2, md: 3 }, py: { xs: 7, md: 10 } }}
      >
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  component="img"
                  src={logoSrc}
                  alt={demoOffice.shortName}
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    objectFit: "contain",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))",
                  }}
                />

                <Box>
                  <Typography
                    fontWeight={900}
                    sx={{ fontSize: "1.05rem", lineHeight: 1.2, mb: 0.5 }}
                  >
                    {demoOffice.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.6)"
                    sx={{ lineHeight: 1.35, fontSize: "0.9rem" }}
                  >
                    {demoOffice.productName}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                color="rgba(255,255,255,0.65)"
                sx={{ lineHeight: 1.7 }}
              >
                {t("description")}
              </Typography>

            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1.4}>
              <Typography fontWeight={900} sx={{ fontSize: "1.02rem" }}>
                {t("navigation.title")}
              </Typography>

              <Stack
                component="ul"
                spacing={0.9}
                sx={{ listStyle: "none", p: 0, m: 0 }}
              >
                {[
                  { label: t("navigation.home"), href: "/" },
                  { label: t("navigation.publications"), href: "/posts" },
                  { label: t("navigation.contact"), href: "#contato" },
                  {
                    label: t("navigation.privacy"),
                    onClick: () => setOpenPrivacy(true),
                  },
                  {
                    label: t("navigation.terms"),
                    onClick: () => setOpenTerms(true),
                  },
                ].map((item) => (
                  <Box key={item.label} component="li">
                    <MuiLink
                      component={
                        item.href
                          ? item.href.startsWith("http")
                            ? "a"
                            : Link
                          : "button"
                      }
                      href={item.href}
                      type={item.onClick ? "button" : undefined}
                      target={
                        item.href?.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        item.href?.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
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

          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <Stack spacing={1.4}>
              <Typography fontWeight={900} sx={{ fontSize: "1.02rem" }}>
                {t("contact.title")}
              </Typography>

              <Stack spacing={1.1}>
                <Stack direction="row" spacing={1.1} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.3,
                    }}
                  >
                    <Icon icon="ph:map-pin" width={22} />
                  </Box>
                  <Typography
                    color="rgba(255,255,255,0.66)"
                    sx={{ lineHeight: 1.55, overflowWrap: "anywhere", flex: 1, minWidth: 0 }}
                  >
                    {endereco}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon="ph:phone" width={22} />
                  </Box>
                  <Typography
                    color="rgba(255,255,255,0.66)"
                    sx={{ fontWeight: 850, overflowWrap: "anywhere", flex: 1, minWidth: 0 }}
                  >
                    {telefone}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon="ph:envelope-simple" width={22} />
                  </Box>
                  <Typography
                    color="rgba(255,255,255,0.66)"
                    sx={{ fontWeight: 850, overflowWrap: "anywhere", flex: 1, minWidth: 0 }}
                  >
                    {institutionalEmail}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

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
                © {new Date().getFullYear()} {demoOffice.productName} -{" "}
                {t("copyrightRights")}
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
                  {t("navigation.privacy")}
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
                  {t("navigation.terms")}
                </MuiLink>

                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.55)"
                  sx={{ fontWeight: 850 }}
                >
                  {t("developedBy")}{" "}
                  <span style={{ color: "rgba(255,255,255,0.78)" }}>
                    KDtech
                  </span>
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <PrivacyPolicyModal
        open={openPrivacy}
        onClose={() => setOpenPrivacy(false)}
      />
      <PrivacyTermsModal open={openTerms} onClose={() => setOpenTerms(false)} />
    </Box>
  );
}
