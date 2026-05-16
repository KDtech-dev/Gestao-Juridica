import "server-only";

import { getPublicApiOrigin } from "@/configs/apiUrl";
import { cookies } from "next/headers";
import type {
  ApiPublicacao,
  AtualizarPublicacaoPayload,
  DeletePublicacaoResponse,
  PublicacaoItem,
  PublicacaoPayload,
} from "./types";

const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80";

const getServerApiBaseUrl = () => {
  const origin = getPublicApiOrigin() || "http://127.0.0.1:8000";

  return `${origin.replace(/\/$/, "")}/api`;
};

const getAuthHeaders = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return cookieHeader ? { Cookie: cookieHeader } : {};
};

const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const authHeaders = await getAuthHeaders();
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  for (const [key, value] of Object.entries(authHeaders)) {
    headers.set(key, value);
  }

  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Erro ao chamar ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (value?: string | null) => {
  if (!value) return "Sem data";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
};

const estimateReadTime = (content?: string | null) => {
  const words = stripHtml(content ?? "")
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.ceil(words / 180))} min`;
};

const normalizeApiList = (payload: unknown): ApiPublicacao[] => {
  const data =
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data: unknown }).data
      : payload;

  return Array.isArray(data) ? (data as ApiPublicacao[]) : [];
};

const normalizeApiItem = (payload: unknown): ApiPublicacao | null => {
  const data =
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data: unknown }).data
      : payload;

  return typeof data === "object" && data !== null
    ? (data as ApiPublicacao)
    : null;
};

export const mapApiPublicacaoToItem = (
  publicacao: ApiPublicacao,
  options: { includePrivateUserData?: boolean } = {},
): PublicacaoItem => {
  const titulo = publicacao.titulo?.trim() || "Publicação";
  const conteudo = publicacao.conteudo ?? "";
  const autor =
    publicacao.autor?.trim() ||
    (options.includePrivateUserData
      ? publicacao.user?.name?.trim() || publicacao.user?.nome?.trim()
      : "") ||
    "Autor não informado";
  const slug = `${slugify(titulo) || "publicacao"}-${publicacao.id}`;

  return {
    id: publicacao.id,
    slug,
    titulo,
    resumo: publicacao.resumo?.trim() || stripHtml(conteudo).slice(0, 180),
    bannerImage: publicacao.imagem_caminho || DEFAULT_BANNER_IMAGE,
    conteudoHtml: conteudo || "<p>Conteúdo indisponível.</p>",
    tipo: "Notícia Jurídica",
    categoria: publicacao.categoria?.nome?.trim() || "Publicação",
    categoriaId: publicacao.categoria?.id ?? publicacao.categoria_id ?? null,
    autor,
    authorEmail: options.includePrivateUserData
      ? (publicacao.user?.email ?? undefined)
      : undefined,
    data: formatDate(publicacao.publicado_em ?? publicacao.created_at),
    readTime: estimateReadTime(conteudo),
    status:
      publicacao.status === "rascunho" ||
      publicacao.status === "publicado" ||
      publicacao.status === "arquivado"
        ? publicacao.status
        : undefined,
    cliente: "Não informado",
    processo: "Não informado",
    anexos: Array.isArray(publicacao.anexos)
      ? publicacao.anexos.map((anexo, index) => ({
          id: String(anexo.id ?? `${publicacao.id}-anexo-${index}`),
          nome:
            anexo.nome_arquivo?.trim() ||
            anexo.descricao?.trim() ||
            "Anexo da publicação",
          url: anexo.url || anexo.arquivo || "#",
        }))
      : [],
  };
};

export const getPublicacoesPublicas = async (): Promise<PublicacaoItem[]> => {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/posts`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return [];

    const payload: unknown = await response.json();

    return normalizeApiList(payload).map((publicacao) =>
      mapApiPublicacaoToItem(publicacao),
    );
  } catch {
    return [];
  }
};

export const getPublicacaoPublicaBySlug = async (
  slug: string,
): Promise<PublicacaoItem | null> => {
  const id =
    slug.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )?.[0] ?? slug;

  if (!id) return null;

  try {
    const response = await fetch(`${getServerApiBaseUrl()}/posts/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const publicacao = normalizeApiItem(payload);

    if (!publicacao) return null;

    return mapApiPublicacaoToItem(publicacao);
  } catch {
    return null;
  }
};

export const getPublicacoesAdmin = async (): Promise<PublicacaoItem[]> => {
  const payload = await requestJson<unknown>("/publicacoes");

  return normalizeApiList(payload).map((publicacao) =>
    mapApiPublicacaoToItem(publicacao, { includePrivateUserData: true }),
  );
};

export const getPublicacaoAdminById = async (
  id: string,
): Promise<PublicacaoItem | null> => {
  if (!id) return null;

  const payload = await requestJson<unknown>(`/publicacoes/${id}`);
  const publicacao = normalizeApiItem(payload);

  return publicacao
    ? mapApiPublicacaoToItem(publicacao, { includePrivateUserData: true })
    : null;
};

export const adicionarPublicacao = async (
  payload: PublicacaoPayload,
): Promise<PublicacaoItem> => {
  const response = await requestJson<unknown>("/publicacoes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const publicacao = normalizeApiItem(response);

  if (!publicacao) {
    throw new Error("A API não retornou a publicação criada.");
  }

  return mapApiPublicacaoToItem(publicacao);
};

export const atualizarPublicacao = async (
  id: string,
  payload: AtualizarPublicacaoPayload,
): Promise<PublicacaoItem> => {
  const response = await requestJson<unknown>(`/publicacoes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const publicacao = normalizeApiItem(response);

  if (!publicacao) {
    throw new Error("A API não retornou a publicação atualizada.");
  }

  return mapApiPublicacaoToItem(publicacao);
};

export const deletarPublicacao = async (
  id: string,
): Promise<DeletePublicacaoResponse> => {
  return requestJson<DeletePublicacaoResponse>(`/publicacoes/${id}`, {
    method: "DELETE",
  });
};
