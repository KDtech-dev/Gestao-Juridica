import { ReactNode } from "react";
import { Paper, Typography } from "@mui/material";

interface SummaryStatProps {
  value: ReactNode;
  label: string;
  color?: string;
  centered?: boolean;
  noWrap?: boolean;
}

export function SummaryStat({
  value,
  label,
  color,
  centered = true,
  noWrap = false,
}: SummaryStatProps) {
  return (
    <Paper sx={{ p: 1.2, textAlign: centered ? "center" : "left" }}>
      <Typography fontWeight={700} color={color} noWrap={noWrap}>
        {value}
      </Typography>
      <Typography color="text.secondary" fontSize="0.82rem">
        {label}
      </Typography>
    </Paper>
  );
}