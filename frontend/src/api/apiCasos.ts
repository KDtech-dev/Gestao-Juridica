import { CasoType, CasoAnexoType, PaginatedResponseType } from "@/@core/types";
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
const postCaso = async (data: CreateCasoPayload): Promise<CasoType> => {
  const response = await getAxios().post("/casos", data);
  return response.data;
};

const updateCaso = async (
  id: string,
  data: UpdateCasoPayload,
): Promise<CasoType> => {
  const response = await getAxios().put(`/casos/${id}`, data);
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

const uploadAnexoCaso = async (
  casoId: string,
  arquivo: File,
  nome?: string,
): Promise<CasoAnexoType> => {
  const formData = new FormData();
  formData.append("arquivo", arquivo);
  if (nome) formData.append("nome", nome);

  const response = await getAxios().post(`/casos/${casoId}/anexos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

const uploadAnexosCaso = async (
  casoId: string,
  arquivos: File[],
): Promise<void> => {
  for (const arquivo of arquivos) {
    await uploadAnexoCaso(casoId, arquivo);
  }
};

const deleteAnexoCaso = async (
  casoId: string,
  anexoId: string,
): Promise<void> => {
  await getAxios().delete(`/casos/${casoId}/anexos/${anexoId}`);
};

const getAnexosCaso = async (casoId: string): Promise<CasoAnexoType[]> => {
  const response = await getAxios().get(`/casos/${casoId}/anexos`);
  return response.data.data ?? response.data;
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
  getAnexosCaso,
  uploadAnexoCaso,
  uploadAnexosCaso,
  deleteAnexoCaso,
};
