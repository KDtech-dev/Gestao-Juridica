"use client";

import { Box, Container, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";
import { Icon } from "@iconify/react";

type Props = {
  isAuthenticated?: boolean;
  userName?: string;
};

export function Header({ isAuthenticated = false, userName }: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          py={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ bgcolor: "#2563eb", p: 1, borderRadius: 2 }}>
              <Icon icon="mdi:scale-balance" color="#fff" />
            </Box>

            <Box>
              <Typography fontWeight="bold">Central jurídica</Typography>
              <Typography variant="caption" color="text.secondary">
                Advocacia & Consultoria
              </Typography>
            </Box>
          </Stack>

          {!isAuthenticated ? (
            <Stack direction="row" spacing={2}>
              <Link href="/login">
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "primary.main",
                    borderRadius: "999px",
                    px: 3,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  Login
                </Button>
              </Link>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography fontWeight="medium">
                {userName || "Usuário"}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
