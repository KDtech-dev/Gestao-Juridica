import { ClienteType, PaginatedResponseType } from "@/@core/types";
import { getAxios } from "@/configs/axios";
import {
  CreateClientePayload,
  UpdateClientePayload,
} from "@/schemas/ClienteSchema";

type GetClientesParams = {
  page?: number;
  perPage?: number;
  search?: string;
  signal?: AbortSignal;
};

const getClientes = async ({
  page = 1,
  perPage = 10,
  search,
  signal,
}: GetClientesParams = {}): Promise<PaginatedResponseType<ClienteType>> => {
  const response = await getAxios().get("/clientes", {
    params: { page, per_page: perPage, search: search?.trim() || undefined },
    signal,
  });

  return response.data;
};

const getClienteById = async (id: number | string): Promise<ClienteType> => {
  const response = await getAxios().get(`/clientes/${id}`);

  return response.data.data;
};

const postCliente = async (
  data: CreateClientePayload,
): Promise<ClienteType> => {
  const response = await getAxios().post("/clientes", data);

  return response.data.data;
};

const updateCliente = async (
  id: number | string,
  data: UpdateClientePayload,
): Promise<ClienteType> => {
  const response = await getAxios().put(`/clientes/${id}`, data);

  return response.data.data;
};

const deleteCliente = async (id: number | string): Promise<void> => {
  await getAxios().delete(`/clientes/${id}`);
};

export {
  getClientes,
  getClienteById,
  postCliente,
  updateCliente,
  deleteCliente,
};
