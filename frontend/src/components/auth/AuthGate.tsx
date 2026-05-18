"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: React.ReactNode;
};

export function AuthGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { loading, isAuthenticated } = useAuth();

  const isPublicRoute = useMemo(() => {
    const isPublicacaoDetail =
      pathname.startsWith("/publicacoes/") &&
      !pathname.startsWith("/publicacoes/nova") &&
      !pathname.startsWith("/publicacoes/editar");

    return (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/forgot-password" ||
      pathname === "/posts" ||
      pathname === "/equipe" ||
      isPublicacaoDetail
    );
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (isPublicRoute) return;
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isPublicRoute, loading, router]);

  if (isPublicRoute) return children;

  if (loading || !isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={28} />
          <Typography sx={{ mt: 1.5 }} color="text.secondary" fontSize="0.9rem">
            Verificando sessão...
          </Typography>
        </Box>
      </Box>
    );
  }

  return children;
}

export default AuthGate;
