export function getRouteByRole(roles: string[]): string {
  const normalized = roles.map((r) => r.toLowerCase());

  if (normalized.includes("admin")) return "/agenda";
  if (normalized.includes("advogado")) return "/agenda";
  if (normalized.includes("funcionario")) return "/agenda";

  return "/login";
}
