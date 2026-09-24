import { Paper, PaperProps } from "@mui/material";

export function CardPaper({ sx, ...props }: PaperProps) {
  return (
    <Paper
      {...props}
      sx={[
        {
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}