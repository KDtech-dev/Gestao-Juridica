"use client";

import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { TeamLawyer } from "@/data/team";

type Props = {
  lawyer: TeamLawyer;
};

export function LawyerProfileCard({ lawyer }: Props) {
  return (
    <Paper
      sx={{
        height: "100%",
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 28px rgba(15,23,42,0.14)",
        },
      }}
    >
      <Stack spacing={2.2} height="100%">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={lawyer.image}
            alt={lawyer.name}
            sx={{ width: 72, height: 72 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} color="text.primary">
              {lawyer.name}
            </Typography>
            <Typography color="text.secondary" fontSize="0.9rem">
              {lawyer.role}
            </Typography>
            <Typography color="primary" fontSize="0.82rem" mt={0.4}>
              {lawyer.oab}
            </Typography>
          </Box>
        </Stack>

        <Typography color="text.secondary" fontSize="0.95rem" lineHeight={1.65}>
          {lawyer.description}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} mt="auto">
          {lawyer.specialties.map((specialty) => (
            <Chip
              key={specialty}
              label={specialty}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1.5 }}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
