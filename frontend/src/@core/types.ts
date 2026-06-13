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
  id: number | string;
  name: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  foto_perfil_url: string;
  endereco: EnderecoType;
  created_at: string;
};

export type RoleType = "funcionario" | "advogado" | "admin";

export type SexoType = "masculino" | "feminino" | "outro" | "prefiro_nao_dizer";

export type FuncionarioType = {
  id: string;
  user_id: string;
  data_nascimento: string | null;
  sexo: SexoType | null;
  celular: string | null;
  resumo_pessoal: string | null;
  foto_perfil_url: string | null;
  endereco: EnderecoType | null;
  created_at: string;
  updated_at: string;
};

export type AdvogadoType = {
  id: string;
  user_id: string;
  sexo: SexoType | null;
  celular: string | null;
  resumo_pessoal: string | null;
  foto_perfil_url: string | null;
  oab_numero: string;
  oab_uf: string;
  categorias: CategoriaType[] | null;
  endereco: EnderecoType | null;
  created_at: string;
  updated_at: string;
};

export type UserType = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  email_verified_at: string | null;
  roles: RoleType[];
  funcionario: FuncionarioType | null;
  advogado: AdvogadoType | null;
  created_at: string;
  updated_at: string;
};

export type CategoriaType = {
  id: string;
  nome: string;
  descricao?: string;
};

export type EnderecoType = {
  id: number;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};
