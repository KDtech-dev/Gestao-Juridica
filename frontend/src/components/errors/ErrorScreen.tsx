"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export type ErrorScreenMode = "sessionExpired" | "application" | "notFound";

type Props = {
  mode: ErrorScreenMode;
  onRetry?: () => void;
};

const modeConfig: Record<ErrorScreenMode, { code: string; icon: string }> = {
  sessionExpired: { code: "401", icon: "mdi:clock-alert-outline" },
  application: { code: "500", icon: "mdi:alert-circle-outline" },
  notFound: { code: "404", icon: "mdi:file-search-outline" },
};

export default function ErrorScreen({ mode, onRetry }: Props) {
  const t = useTranslations("common.errorPages");
  const router = useRouter();
  const config = modeConfig[mode];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 5,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 560,
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 76,
              height: 76,
              display: "grid",
              placeItems: "center",
              borderRadius: "24px",
              color: "primary.main",
              bgcolor: "action.hover",
            }}
          >
            <Icon icon={config.icon} width={38} />
          </Box>
          <Typography
            component="p"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: ".12em" }}
          >
            {config.code}
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={800}>
            {t(`${mode}.title`)}
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 430 }}>
            {t(`${mode}.description`)}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            sx={{ pt: 1, width: { xs: "100%", sm: "auto" } }}
          >
            {onRetry && (
              <Button variant="contained" onClick={onRetry}>
                {t("application.retry")}
              </Button>
            )}
            <Button
              variant={onRetry ? "outlined" : "contained"}
              onClick={() => router.replace(mode === "sessionExpired" ? "/login" : "/")}
            >
              {mode === "sessionExpired" ? t("sessionExpired.login") : t("goHome")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
