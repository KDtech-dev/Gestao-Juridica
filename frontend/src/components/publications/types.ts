import type { StatusPublicacao } from "@/api/publicacoes/types";

export type PublicacaoFormData = {
  titulo: string;
  categoria: string;
  categoriaId: string;
  bannerImage: File | string;
  autor: string;
  resumo: string;
  conteudo: string;
  status: StatusPublicacao;
  anexos: File[];
};

export type PublicationErrors = Partial<
  Record<keyof Omit<PublicacaoFormData, "anexos">, string>
>;
