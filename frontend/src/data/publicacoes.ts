export type { PublicacaoAnexo, PublicacaoItem } from "@/api/publicacoes/types";
import type { PublicacaoItem } from "@/api/publicacoes/types";

export const publicacoes: PublicacaoItem[] = [];

export function findPublicacaoBySlug(slug: string) {
  return publicacoes.find((item) => item.slug === slug);
}
