import {
  ClienteType,
  PaginatedResponseType,
} from "@/components/publications/types";
import { getAxios } from "@/configs/axios";
import {
  CreateClientePayload,
  UpdateClientePayload,
} from "@/schemas/ClienteSchema";

const getClientes = async (
  page = 1,
): Promise<PaginatedResponseType<ClienteType>> => {
  const response = await getAxios().get("/clientes", { params: { page } });

  return response.data;
};

const getClienteById = async (id: number): Promise<ClienteType> => {
  const response = await getAxios().get(`/clientes/${id}`);

  return response.data;
};

const postCliente = async (
  data: CreateClientePayload,
): Promise<ClienteType> => {
  const response = await getAxios().post("/clientes", data);

  return response.data.data;
};

const updateCliente = async (
  id: number,
  data: UpdateClientePayload,
): Promise<ClienteType> => {
  const response = await getAxios().put(`/clientes/${id}`, data);

  return response.data.data;
};

const deleteCliente = async (id: number): Promise<void> => {
  await getAxios().delete(`/clientes/${id}`);
};

export {
  getClientes,
  getClienteById,
  postCliente,
  updateCliente,
  deleteCliente,
};
