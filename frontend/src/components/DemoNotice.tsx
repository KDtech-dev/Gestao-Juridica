"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { demoModeEnabled } from "@/configs/demoOffice";

export function DemoNotice() {
  const t = useTranslations("common.demoNotice");
  const theme = useTheme();

  if (!demoModeEnabled) return null;

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        px: 2,
        py: 0.8,
        textAlign: "center",
        bgcolor: theme.palette.mode === "dark" ? "#49330f" : "#fff4d6",
        color: theme.palette.mode === "dark" ? "#ffdfa0" : "#624917",
        borderBottom: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#6b4b18" : "#f0e0b7",
      }}
    >
      <Typography component="p" sx={{ fontSize: "0.8rem", fontWeight: 650 }}>
        {t("message")}
      </Typography>
    </Box>
  );
}
