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
import { getRouteByRole } from "@/utils/redirectByRole";

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  roles: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  setAuth: (userData: AuthUser, token: string) => void;
  logout: () => void;
  redirectByRole: () => void;
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
    return { id: parsed.id, name: parsed.name, email: parsed.email, roles };
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
    const token = localStorage.getItem(auth.storageTokenKeyName);
    const storedUser = safeParseUser(
      localStorage.getItem(auth.userDataKeyName),
    );

    const nextUser = token && storedUser ? storedUser : null;
    queueMicrotask(() => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const isAuthenticated = !!user;

  const hasRole = useCallback(
    (role: string) => user?.roles?.includes(role) ?? false,
    [user],
  );

  const setAuth = useCallback((userData: AuthUser, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(auth.storageTokenKeyName, token);
      localStorage.setItem(auth.userDataKeyName, JSON.stringify(userData));
    }
    setUser(userData);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(auth.storageTokenKeyName);
      localStorage.removeItem(auth.userDataKeyName);
    }
    setUser(null);
    setLoading(false);
    router.replace("/login");
  }, [router]);

  const redirectByRole = useCallback(() => {
    if (!user) return;
    const route = getRouteByRole(user.roles);
    router.replace(route);
  }, [router, user]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      isAuthenticated,
      hasRole,
      setAuth,
      logout,
      redirectByRole,
    };
  }, [
    user,
    loading,
    isAuthenticated,
    hasRole,
    setAuth,
    logout,
    redirectByRole,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado com AuthProvider.");
  return ctx;
}
