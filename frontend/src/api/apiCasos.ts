import { CasoType, PaginatedResponseType } from "@/@core/types";
import { getAxios } from "@/configs/axios";
import {
  CreateCasoPayload,
  UpdateCasoPayload,
  SyncClientesCasoPayload,
} from "@/schemas/CasoSchema";

export type GetCasosParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  categoria_id?: string;
  advogado_id?: string;
};

const getCasos = async (
  params: GetCasosParams = {},
): Promise<PaginatedResponseType<CasoType>> => {
  const response = await getAxios().get("/casos", {
    params: { page: 1, ...params },
  });
  return response.data;
};

const getCasoById = async (id: string): Promise<CasoType> => {
  const response = await getAxios().get(`/casos/${id}`);
  return response.data;
};

const buildCasoFormData = (
  payload: CreateCasoPayload | UpdateCasoPayload,
): FormData => {
  const formData = new FormData();

  const appendIfPresent = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  };

  appendIfPresent("titulo", payload.titulo);
  appendIfPresent("numero_processo", payload.numero_processo);
  appendIfPresent("descricao", payload.descricao);
  appendIfPresent("status", payload.status);
  appendIfPresent("data_abertura", payload.data_abertura);
  appendIfPresent("data_encerramento", payload.data_encerramento);
  appendIfPresent("advogado_id", payload.advogado_id);

  (payload.categorias ?? []).forEach((categoriaId, index) => {
    formData.append(`categorias[${index}]`, String(categoriaId));
  });

  (payload.clientes ?? []).forEach((cliente, index) => {
    formData.append(`clientes[${index}][id]`, cliente.id);
    formData.append(`clientes[${index}][papel]`, cliente.papel);
  });

  (payload.anexos ?? []).forEach((arquivo) => {
    if (arquivo instanceof File) formData.append("anexos[]", arquivo);
  });

  (payload.anexos_remover ?? []).forEach((anexoId) => {
    formData.append("anexos_remover[]", anexoId);
  });

  return formData;
};

const postCaso = async (payload: CreateCasoPayload): Promise<CasoType> => {
  const formData = buildCasoFormData(payload);
  const response = await getAxios({ contentType: "formData" }).post(
    "/casos",
    formData,
  );
  return response.data;
};

const updateCaso = async (
  id: string,
  payload: UpdateCasoPayload,
): Promise<CasoType> => {
  const formData = buildCasoFormData(payload);
  formData.append("_method", "PUT");
  const response = await getAxios({ contentType: "formData" }).post(
    `/casos/${id}`,
    formData,
  );
  return response.data;
};

const deleteCaso = async (id: string): Promise<void> => {
  await getAxios().delete(`/casos/${id}`);
};

const attachClientesCaso = async (
  casoId: string,
  data: SyncClientesCasoPayload,
): Promise<CasoType> => {
  const response = await getAxios().post(`/casos/${casoId}/clientes`, data);
  return response.data.data;
};

const syncClientesCaso = async (
  casoId: string,
  data: SyncClientesCasoPayload,
): Promise<CasoType> => {
  const response = await getAxios().put(`/casos/${casoId}/clientes`, data);
  return response.data;
};

const detachClienteCaso = async (
  casoId: string,
  clienteId: string,
): Promise<void> => {
  await getAxios().delete(`/casos/${casoId}/clientes/${clienteId}`);
};

export {
  getCasos,
  getCasoById,
  postCaso,
  updateCaso,
  deleteCaso,
  attachClientesCaso,
  syncClientesCaso,
  detachClienteCaso,
};