
import { getAxios } from "@/configs/axios";
import type { ArrayResponseType, ResponseType, PublicacaoType } from "@/@core/types";

type DeletePublicacaoResponse = ResponseType<null>;

export const listarPublicacoesClient = async (): Promise<PublicacaoType[]> => {
  const response = await getAxios().get<ArrayResponseType<PublicacaoType>>("/publicacoes");
  return response.data.data;
};

export const buscarPublicacaoClient = async (id: string): Promise<PublicacaoType> => {
  const response = await getAxios().get<ResponseType<PublicacaoType>>(`/publicacoes/${id}`);
  return response.data.data;
};

export const criarPublicacaoClient = async (
  payload: Partial<PublicacaoType> | FormData,
): Promise<PublicacaoType> => {
  const response = await getAxios().post<ResponseType<PublicacaoType>>("/publicacoes", payload);
  return response.data.data;
};

export const atualizarPublicacaoClient = async (
  id: string,
  payload: Partial<PublicacaoType> | FormData,
): Promise<PublicacaoType> => {
  const response = await getAxios().put<ResponseType<PublicacaoType>>(`/publicacoes/${id}`, payload);
  return response.data.data;
};

export const deletarPublicacaoClient = async (id: string): Promise<DeletePublicacaoResponse> => {
  const response = await getAxios().delete<DeletePublicacaoResponse>(`/publicacoes/${id}`);
  return response.data;
};