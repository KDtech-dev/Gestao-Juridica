import { CategoriaType, ExistingFile } from "@/@core/types";

export type PublicacaoAnexo = ExistingFile

export type PublicacaoItem = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  bannerImage: string;
  conteudoHtml: string;
  tipo: "Atualização de Caso" | "Comunicado ao Cliente" | "Notícia Jurídica";
  categoria: string;
  categoriaId?: number | string | null;
  autor: string;
  authorEmail?: string;
  data: string;
  readTime: string;
  status?: StatusPublicacao;
  cliente: string;
  processo: string;
  anexos: PublicacaoAnexo[];
};

export type ApiUsuarioPublicacao = {
  id?: number | string;
  name?: string | null;
  nome?: string | null;
  email?: string | null;
};

export type ApiAnexo = {
  id?: number | string;
  descricao?: string | null;
  arquivo?: string | null;
  nome_arquivo?: string | null;
  url?: string | null;
};

export type ApiPublicacao = {
  id: string;
  titulo?: string | null;
  categoria_id?: number | string | null;
  categoria?: CategoriaType | null;
  user?: ApiUsuarioPublicacao | null;
  imagem_caminho?: string | null;
  autor?: string | null;
  resumo?: string | null;
  conteudo?: string | null;
  status?: "rascunho" | "publicado" | "arquivado" | string;
  publicado_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  anexos?: ApiAnexo[] | null;
};

export type StatusPublicacao = "rascunho" | "publicado" | "arquivado";

export type PublicacaoPayload = {
  titulo: string;
  categoria_id?: number | string | null;
  imagem_caminho?: string | null;
  autor: string;
  resumo?: string | null;
  conteudo?: string | null;
  status: StatusPublicacao;
  publicado_em?: string | null;
};

export type AtualizarPublicacaoPayload = Partial<PublicacaoPayload>;

export type ApiPublicacaoResponse = ApiPublicacao | { data: ApiPublicacao };

export type ApiPublicacoesResponse =
  | ApiPublicacao[]
  | {
      data: ApiPublicacao[];
    };

export type DeletePublicacaoResponse = {
  message?: string;
};
