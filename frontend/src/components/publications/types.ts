import type {
  PublicacaoAnexo,
  StatusPublicacao,
} from "@/api/publicacoes/types";

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
  anexosExistentes: PublicacaoAnexo[];
  anexosRemovidos: string[];
};

export type PublicationErrors = Partial<
  Record<keyof Omit<PublicacaoFormData, "anexos">, string>
>;

export type ResponseType<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ArrayResponseType<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta?: ResponseMetaType;
  total?: number;
};

export type MetaType = {
  perPage: number;
  currentPage: number;
  lastPage: number;
  total: number;
};

export type ResponseMetaType = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type PaginationMetaType = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type PaginationLinksType = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type PaginatedResponseType<T> = {
  data: T[];
  meta: PaginationMetaType;
  links: PaginationLinksType;
};

export type ClienteType = {
  id: number;
  name: string;           
  cpf_cnpj: string;      
  email: string;
  telefone: string;
  data_nascimento: string; 
  foto_perfil_url: string;  
  endereco: EnderecoType;  
  created_at: string;
};

export type EnderecoType = {
  id: number;
};