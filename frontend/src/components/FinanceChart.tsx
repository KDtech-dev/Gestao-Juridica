"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const data = [
  { name: "Janeiro", receita: 4000, despesa: 2400 },
  { name: "Fevereiro", receita: 3000, despesa: 1398 },
  { name: "Março", receita: 9800, despesa: 2000 },
  { name: "Abril", receita: 3900, despesa: 2800 },
  { name: "Maio", receita: 4800, despesa: 1800 },
  { name: "Junho", receita: 3800, despesa: 2300 },
  { name: "Julho", receita: 4300, despesa: 3200 },
];

export function FinanceChart() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        height: 350,
        pb: 6,
      }}
    >
      <Typography fontWeight="bold" mb={2} color="text.primary">
        Receitas vs Despesas
      </Typography>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}
          />

          <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
          <YAxis tick={{ fill: theme.palette.text.secondary }} />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="receita"
            stroke="#2563eb"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="despesa"
            stroke="#ef4444"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
