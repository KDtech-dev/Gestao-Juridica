import { Box, Typography, Stack } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import Link from "next/link";

interface StatCardProps {
  title: string;
  href?: string;
  value: string;
  helperText?: string;
  trendText?: string;
  trendColor?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  href,
  value,
  helperText,
  trendText,
  trendColor = "#059669",
  icon = "mdi:chart-line",
  iconBg = "#e2e8f0",
  iconColor = "#334155",
}: StatCardProps) {
  const content = (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: 200, sm: 230, md: 260 },
        p: 3,
        paddingInline: 2.5,
        borderRadius: "12px",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        cursor: href ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": href && {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Typography fontSize="0.92rem" color="text.secondary" mb={1.8}>
          {title}
        </Typography>

        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            bgcolor: iconBg,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon icon={icon} width={18} color={iconColor} />
        </Box>
      </Stack>

      <Typography
        fontSize="2rem"
        fontWeight={700}
        color="text.primary"
        lineHeight={1.2}
      >
        {value}
      </Typography>

      {trendText && (
        <Typography
          fontSize="0.8rem"
          color={trendColor}
          mt={0.8}
          fontWeight={600}
        >
          {trendText}
        </Typography>
      )}

      {helperText && (
        <Typography fontSize="0.78rem" color="text.secondary" mt={0.45}>
          {helperText}
        </Typography>
      )}
    </Box>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}
