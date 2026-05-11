export type TipoPublicacao =
  | "Atualização de Caso"
  | "Comunicado ao Cliente"
  | "Notícia Jurídica";

export type PublicacaoFormData = {
  titulo: string;
  tipo: TipoPublicacao | "";
  cliente: string;
  processo: string;
  data: string;
  responsavel: string;
  resumo: string;
  conteudo: string;
  anexos: File[];
};

export type BasicErrors = Partial<
  Record<
    "titulo" | "tipo" | "cliente" | "processo" | "data" | "responsavel",
    string
  >
>;

export type ContentErrors = Partial<Record<"resumo" | "conteudo", string>>;
