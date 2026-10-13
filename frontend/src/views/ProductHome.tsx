"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { Icon } from "@/components/AppIcon";
import { Header } from "@/components/Header";
import { useTranslations } from "next-intl";

const features = [
  { key: "cases", icon: "mdi:briefcase-outline" },
  { key: "clients", icon: "mdi:account-group-outline" },
  { key: "agenda", icon: "mdi:calendar-month-outline" },
  { key: "finance", icon: "mdi:chart-box-outline" },
] as const;

export default function ProductHome() {
  const t = useTranslations("public.productHome");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header productBrand />

      <Box
        component="section"
        sx={{
          overflow: "hidden",
          position: "relative",
          py: { xs: 7, sm: 9, lg: 12 },
          background:
            "radial-gradient(circle at 80% 25%, rgba(59,130,246,0.19), transparent 34%), linear-gradient(135deg, #0b1220 0%, #14213a 58%, #1e3a5f 100%)",
          color: "#fff",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 6, md: 5, lg: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                component="p"
                variant="overline"
                sx={{
                  color: "#9dc2ff",
                  fontWeight: 800,
                  letterSpacing: ".14em",
                }}
              >
                {t("eyebrow")}
              </Typography>
              <Typography
                component="h1"
                fontWeight={850}
                sx={{
                  mt: 1.2,
                  maxWidth: 760,
                  fontSize: { xs: "2.35rem", sm: "3.1rem", lg: "3.8rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.035em",
                  textWrap: "balance",
                }}
              >
                {t("title")}
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 620,
                  color: "rgba(255,255,255,.76)",
                  fontSize: { xs: "1rem", sm: "1.15rem" },
                  lineHeight: 1.75,
                }}
              >
                {t("subtitle")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 4, alignItems: { xs: "stretch", sm: "center" } }}
              >
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  size="large"
                  endIcon={<Icon icon="mdi:arrow-right" width={20} />}
                  sx={{
                    minHeight: 48,
                    px: 2.6,
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  {t("primaryAction")}
                </Button>
                <Button
                  component={Link}
                  href="/posts"
                  variant="outlined"
                  size="large"
                  sx={{
                    minHeight: 48,
                    px: 2.6,
                    borderRadius: 2,
                    color: "#fff",
                    borderColor: "rgba(255,255,255,.36)",
                    fontWeight: 750,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#fff",
                      bgcolor: "rgba(255,255,255,.06)",
                    },
                  }}
                >
                  {t("secondaryAction")}
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  mx: "auto",
                  maxWidth: 600,
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  color: "#e8eef8",
                  bgcolor: "rgba(13, 24, 42, .84)",
                  border: "1px solid rgba(191, 219, 254, .2)",
                  boxShadow: "0 32px 80px rgba(0,0,0,.3)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>
                      {t("preview.title")}
                    </Typography>
                    <Typography
                      sx={{ color: "#9eacc2", fontSize: ".82rem", mt: 0.5 }}
                    >
                      {t("preview.subtitle")}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.5,
                      color: "#a9ccff",
                      bgcolor: "rgba(59,130,246,.17)",
                    }}
                  >
                    <Icon icon="mdi:view-dashboard-outline" width={22} />
                  </Box>
                </Stack>
                <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                  {features.slice(0, 3).map((feature) => (
                    <Grid key={feature.key} size={{ xs: 12, sm: 4 }}>
                      <Box
                        sx={{
                          minHeight: 108,
                          height: "100%",
                          p: 1.6,
                          borderRadius: 2,
                          border: "1px solid rgba(191,219,254,.13)",
                          bgcolor: "rgba(255,255,255,.035)",
                        }}
                      >
                        <Icon icon={feature.icon} width={21} />
                        <Typography
                          sx={{ mt: 1.8, fontSize: ".79rem", fontWeight: 700 }}
                        >
                          {t(`features.${feature.key}.title`)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box
                  aria-hidden="true"
                  sx={{
                    mt: 2,
                    p: 1.8,
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    borderRadius: 2,
                    bgcolor: "rgba(59,130,246,.1)",
                    color: "#bfd8ff",
                  }}
                >
                  <Icon icon="mdi:shield-check-outline" width={20} />
                  <Typography sx={{ fontSize: ".78rem", lineHeight: 1.5 }}>
                    {t("preview.caption")}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: 720, mx: "auto", textAlign: "center", mb: 5 }}>
            <Typography
              component="h2"
              variant="h4"
              fontWeight={850}
              sx={{ textWrap: "balance" }}
            >
              {t("featuresHeading")}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 1.5, lineHeight: 1.7 }}
            >
              {t("featuresSubtitle")}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {features.map((feature) => (
              <Grid key={feature.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    height: "100%",
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.5,
                      bgcolor: "action.hover",
                      color: "primary.main",
                    }}
                  >
                    <Icon icon={feature.icon} width={24} />
                  </Box>
                  <Typography component="h3" fontWeight={800} sx={{ mt: 2.2 }}>
                    {t(`features.${feature.key}.title`)}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, lineHeight: 1.7 }}
                  >
                    {t(`features.${feature.key}.description`)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{ py: { xs: 6, md: 8 }, bgcolor: "action.hover" }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={3}
          >
            <Box sx={{ maxWidth: 650 }}>
              <Typography component="h2" variant="h5" fontWeight={850}>
                {t("closing.title")}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.7 }}
              >
                {t("closing.subtitle")}
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              size="large"
              sx={{
                minHeight: 48,
                px: 2.8,
                flexShrink: 0,
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              {t("primaryAction")}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          px: 2,
          py: 3,
          bgcolor: "#0b1220",
          color: "rgba(255,255,255,.72)",
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={1.5}
          >
            <Typography sx={{ fontWeight: 750, color: "#fff" }}>
              Gestão Jurídica{" "}
              <Box component="span" sx={{ color: "#91baff", fontWeight: 500 }}>
                · KDTech
              </Box>
            </Typography>
            <Typography variant="body2">
              © {new Date().getFullYear()} {t("copyright")}
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
