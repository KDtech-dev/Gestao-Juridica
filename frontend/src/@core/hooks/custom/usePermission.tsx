"use client";

import { useAuthContext } from "@/context/AuthContext";

type PermissionSet = string | readonly string[];
type MatchMode = "all" | "any";

export default function usePermission(
  required?: PermissionSet,
  mode: MatchMode = "all",
) {
  const { loading, hasPermission } = useAuthContext();

  const requiredPermissions =
    typeof required === "string" ? [required] : required ?? [];

  const hasAnyPermission = (permissions: readonly string[]) =>
    permissions.some(hasPermission);
  const hasAllPermissions = (permissions: readonly string[]) =>
    permissions.every(hasPermission);

  const allowed =
    requiredPermissions.length > 0 &&
    (mode === "all"
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions));

  return {
    allowed,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
