import { slugify } from "@/@core/format";
import type { AdvogadoPublicoType } from "@/@core/types";

export const advogadoSlug = (
  lawyer: Pick<AdvogadoPublicoType, "name" | "uuid">,
) => `${slugify(lawyer.name) || "advogado"}-${lawyer.uuid}`;

export const advogadoHref = (
  lawyer: Pick<AdvogadoPublicoType, "name" | "uuid">,
) => `/advogados/${advogadoSlug(lawyer)}`;

export const advogadoIdFromSlug = (slug: string) =>
  slug.match(
    /-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
  )?.[1] ?? null;

export const advogadoOab = (
  lawyer: Pick<AdvogadoPublicoType, "oab_numero" | "oab_uf">,
) => {
  const numero = lawyer.oab_numero?.trim();
  const uf = lawyer.oab_uf?.trim();
  return numero ? `OAB${uf ? `/${uf}` : ""} ${numero}` : null;
};

export function publicLawyerPhoto(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.startsWith("127.") ||
      host === "[::1]" ||
      host === "0.0.0.0"
    ) {
      return url.pathname.startsWith("/storage/") ? url.pathname : null;
    }
    return url.href;
  } catch {
    return null;
  }
}
