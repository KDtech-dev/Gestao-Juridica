export type PublicacaoFormData = {
  titulo: string;
  categoria: string;
  bannerImage: string;
  autor: string;
  resumo: string;
  conteudo: string;
  anexos: File[];
};

export type PublicationErrors = Partial<
  Record<keyof Omit<PublicacaoFormData, "anexos">, string>
>;
