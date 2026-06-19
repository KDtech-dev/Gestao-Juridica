import { ClienteType, PaginatedResponseType } from "@/@core/types";
import { getAxios } from "@/configs/axios";
import {
  CreateClientePayload,
  UpdateClientePayload,
} from "@/schemas/ClienteSchema";

const getClientes = async (
  page = 1,
  perPage = 10,
): Promise<PaginatedResponseType<ClienteType>> => {
  const response = await getAxios().get("/clientes", {
    params: { page, perPage },
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
