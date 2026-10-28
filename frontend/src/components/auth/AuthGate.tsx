"use client";

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: React.ReactNode;
};

type RoutePermission = {
  permission: string;
  adminOnly?: boolean;
};

function permissionForPath(pathname: string): RoutePermission | null {
  if (pathname === "/admin/team") {
    return { permission: "usuarios.visualizar", adminOnly: true };
  }

  if (pathname === "/agenda" || pathname.startsWith("/compromissos")) {
    return { permission: "compromissos.visualizar" };
  }

  if (pathname === "/clientes/novo") {
    return { permission: "clientes.criar" };
  }
  if (/^\/clientes\/[^/]+\/editar$/.test(pathname)) {
    return { permission: "clientes.editar" };
  }
  if (pathname === "/clientes" || /^\/clientes\/[^/]+$/.test(pathname)) {
    return { permission: "clientes.visualizar" };
  }

  if (pathname === "/casos/novo") {
    return { permission: "casos.criar" };
  }
  if (/^\/casos\/[^/]+\/editar$/.test(pathname)) {
    return { permission: "casos.editar" };
  }
  if (pathname === "/casos" || pathname.startsWith("/casos/")) {
    return { permission: "casos.visualizar" };
  }

  if (pathname === "/publicacoes") {
    return { permission: "publicacoes.visualizar" };
  }
  if (pathname === "/publicacoes/nova") {
    return { permission: "publicacoes.criar" };
  }
  if (pathname.startsWith("/publicacoes/editar/")) {
    return { permission: "publicacoes.editar" };
  }

  if (pathname === "/users/new") {
    return { permission: "usuarios.criar", adminOnly: true };
  }
  if (/^\/users\/[^/]+\/edit$/.test(pathname)) {
    return { permission: "usuarios.editar", adminOnly: true };
  }
  if (pathname === "/users" || /^\/users\/[^/]+$/.test(pathname)) {
    return { permission: "usuarios.visualizar", adminOnly: true };
  }

  return null;
}

export function AuthGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { loading, isAuthenticated, hasPermission, hasRole } = useAuth();
  const t = useTranslations("common.accessDenied");

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
      /^\/advogados\/[^/]+\/?$/.test(pathname) ||
      isPublicacaoDetail
    );
  }, [pathname]);
  const routePermission = permissionForPath(pathname);
  const permissionDenied = routePermission !== null && (
    !hasPermission(routePermission.permission) ||
    (routePermission.adminOnly && !hasRole("admin"))
  );

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

  if (permissionDenied) {
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
        <Box sx={{ textAlign: "center", maxWidth: 440 }}>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            {t("title")}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>
            {t("description")}
          </Typography>
          <Button variant="contained" onClick={() => router.back()}>
            {t("back")}
          </Button>
        </Box>
      </Box>
    );
  }

  return children;
}

export default AuthGate;
