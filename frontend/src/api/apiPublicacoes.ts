import { getAxios } from "@/configs/axios";
import { extractIdFromSlug } from "@/@core/format";

import type {
  ArrayResponseType,
  ResponseType,
  PublicacaoType,
} from "@/@core/types";

/**
 * Área pública
 */

const getPublicacoesPublicas = async (): Promise<
  ArrayResponseType<PublicacaoType>
> => {
 const response = await getAxios().get("/posts");
  return response.data;
};

const getPublicacaoPublicaBySlug = async (
  slug: string,
): Promise<ResponseType<PublicacaoType> | null> => {
  const id = extractIdFromSlug(slug);

  if (!id) return null;

  const { data } = await getAxios().get(`/posts/${id}`);

  return data;
};

/**
 * Área administrativa
 */

const getPublicacoes = async (): Promise<ArrayResponseType<PublicacaoType>> => {
  const { data } = await getAxios().get("/publicacoes");

  return data;
};

const getPublicacaoById = async (
  id: string,
): Promise<ResponseType<PublicacaoType>> => {
  const { data } = await getAxios().get(`/publicacoes/${id}`);

  return data;
};

const postPublicacao = async (
  payload: FormData,
): Promise<ResponseType<PublicacaoType>> => {
  const { data } = await getAxios({
    contentType: "formData",
  }).post("/publicacoes", payload);

  return data;
};

const updatePublicacao = async (
  id: string,
  payload: FormData,
): Promise<ResponseType<PublicacaoType>> => {
  payload.append("_method", "PUT");
  const { data } = await getAxios({
    contentType: "formData",
  }).post(`/publicacoes/${id}`, payload);
  return data;
};

const deletePublicacao = async (id: string): Promise<ResponseType<null>> => {
  const { data } = await getAxios().delete(`/publicacoes/${id}`);

  return data;
};

export {
  getPublicacoes,
  getPublicacaoById,
  getPublicacaoPublicaBySlug,
  getPublicacoesPublicas,
  postPublicacao,
  deletePublicacao,
  updatePublicacao,
};
