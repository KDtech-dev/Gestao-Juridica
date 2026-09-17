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
  anexosExistentes: ExistingFile[];
  anexosRemovidos: string[];
};

export type StatusPublicacao = "rascunho" | "publicado" | "arquivado";

export type PublicacaoAnexo = {
  id: string;
  nome_arquivo: string | null;
  descricao: string | null;
  arquivo: string | null;
  url: string | null;
};

export type PublicacaoType = {
  id: string;
  titulo: string | null;
  resumo: string | null;
  conteudo: string | null;
  imagem_caminho: string | null;
  imagem_url: string | null;
  autor: string | null;
  status: StatusPublicacao | null;
  publicado_em: string | null;
  created_at: string;
  updated_at: string;
  categoria_id: string | number | null;
  categoria: CategoriaType | null;
  user: UserType | null;
  anexos: PublicacaoAnexo[];
};

export type PublicationErrors = Partial<
  Record<keyof Omit<PublicacaoFormData, "anexos">, string>
>;

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

export type AdvogadoPublicoType = {
  uuid: string;
  name: string;
  foto_perfil_url: string | null;
  oab_numero: string;
  oab_uf: string;
  resumo_pessoal: string | null;
  categorias: string[];
};

export type LawyerCardType = {
  id: string;
  href: string;
  name: string;
  image?: string;
  role: string;
  oab: string;
  description: string;
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
  categorias: CategoriaType[];
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
  cor_perfil: string | null;
  foto_perfil: string | null;
  foto_perfil_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoriaType = {
  id: number;
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

export type StatusCaso = "aberto" | "em_andamento" | "encerrado" | "arquivado";

export type PapelClienteCaso = "autor" | "réu" | "interveniente" | "testemunha";

export type CasoClienteType = ClienteType & {
  papel: PapelClienteCaso | null;
};

export type CasoType = {
  id: string;
  numero_processo: string | null;
  titulo: string;
  descricao: string | null;
  status: StatusCaso;
  categorias?: CategoriaType[];
  data_abertura: string;
  data_encerramento: string | null;
  advogado_id: string | null;
  advogado?: { id: string; name: string } | null;
  clientes?: CasoClienteType[];
  created_at: string;
  updated_at: string;
  anexos?: CasoAnexoType[];
};

export type CasoAnexoType = ExistingFile;

export type ExistingFile = {
  id: string;
  nome: string;
  viewUrl?: string;
};

export type ForgotPasswordResponse = {
  message: string;
  success: boolean;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};
