"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import auth from "@/configs/auth";
import { authStorage, getAxios } from "@/configs/axios";
import { getRouteByRole } from "@/utils/redirectByRole";

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  idioma?: "pt" | "en" | "es" | null;
  foto_perfil_url?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  setAuth: (userData: AuthUser, token: string, remember?: boolean) => void;
  logout: () => void;
  redirectByRole: () => void;
  refreshUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function safeParseUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser> | null;
    if (!parsed || typeof parsed !== "object") return null;
    const roles = Array.isArray(parsed.roles)
      ? parsed.roles.map(String)
      : parsed.roles && typeof parsed.roles === "object"
        ? Object.values(parsed.roles as unknown as Record<string, unknown>).map(
            String,
          )
        : [];
    if (
      !parsed.id ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string"
    )
      return null;
    const idioma =
      parsed.idioma === "pt" || parsed.idioma === "en" || parsed.idioma === "es"
        ? parsed.idioma
        : null;
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      roles,
      permissions: Array.isArray(parsed.permissions)
        ? parsed.permissions.map(String)
        : [],
      idioma,
      foto_perfil_url:
        typeof parsed.foto_perfil_url === "string" ? parsed.foto_perfil_url : null,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = authStorage.get();
    const storedUser = safeParseUser(
      localStorage.getItem(auth.userDataKeyName) ??
      sessionStorage.getItem(auth.userDataKeyName),
    );
    const nextUser = token && storedUser ? storedUser : null;

    if (!nextUser) {
      queueMicrotask(() => {
        setUser(null);
        setLoading(false);
      });
      return;
    }

    setUser(nextUser);
    getAxios()
      .get("/profile")
      .then((response) => {
        const profile = safeParseUser(
          JSON.stringify(response.data?.data?.user ?? response.data?.user),
        );
        if (!profile) return;

        const storage = localStorage.getItem(auth.userDataKeyName)
          ? localStorage
          : sessionStorage;
        storage.setItem(auth.userDataKeyName, JSON.stringify(profile));
        setUser(profile);
      })
      .catch(() => {
        // Keep the cached user when the profile refresh is temporarily unavailable.
      })
      .finally(() => setLoading(false));
  }, []);

  const isAuthenticated = !!user;

  const hasRole = useCallback(
    (role: string) => user?.roles?.includes(role) ?? false,
    [user],
  );

  const hasPermission = useCallback(
    (permission: string) => user?.permissions?.includes(permission) ?? false,
    [user],
  );

  const setAuth = useCallback(
    (userData: AuthUser, token: string, remember = true) => {
      if (typeof window !== "undefined") {
        const targetStorage = remember ? localStorage : sessionStorage;
        const otherStorage = remember ? sessionStorage : localStorage;
        authStorage.set(token, remember);
        targetStorage.setItem(auth.userDataKeyName, JSON.stringify(userData));
        otherStorage.removeItem(auth.userDataKeyName);
      }
      setUser(userData);
      setLoading(false);
    },
    [],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      authStorage.set(null);
      localStorage.removeItem(auth.userDataKeyName);
      sessionStorage.removeItem(auth.userDataKeyName);
    }
    setUser(null);
    setLoading(false);
    router.replace("/");
  }, [router]);

  const redirectByRole = useCallback(() => {
    if (!user) return;
    const route = getRouteByRole(user.roles);
    router.replace(route);
  }, [router, user]);

  const refreshUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, ...partial };

      if (typeof window !== "undefined") {
        const serialized = JSON.stringify(updated);
        if (localStorage.getItem(auth.userDataKeyName)) {
          localStorage.setItem(auth.userDataKeyName, serialized);
        } else {
          sessionStorage.setItem(auth.userDataKeyName, serialized);
        }
      }

      return updated;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated,
      hasRole,
      hasPermission,
      setAuth,
      logout,
      redirectByRole,
      refreshUser,
    }),
    [
      user,
      loading,
      isAuthenticated,
      hasRole,
      hasPermission,
      setAuth,
      logout,
      redirectByRole,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado com AuthProvider.");
  return ctx;
}
