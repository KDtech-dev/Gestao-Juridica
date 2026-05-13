import { getAxios } from "@/configs/axios";

const api = getAxios();

export type Client = {
  id?: number | string;
  name: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  status?: "Ativo" | "Inativo" | "Prospect";
  address?: string;
  notes?: string;
  slug?: string;
};

export async function listClients(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const res = await api.get("/clients", { params });
  return res.data;
}

export async function getClient(id: number | string) {
  const res = await api.get(`/clients/${id}`);
  return res.data;
}

export async function createClient(payload: Partial<Client>) {
  const res = await api.post("/clients", payload);
  return res.data;
}

export async function updateClient(
  id: number | string,
  payload: Partial<Client>,
) {
  const res = await api.put(`/clients/${id}`, payload);
  return res.data;
}

export async function deleteClient(id: number | string) {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
}

const clientService = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};

export default clientService;
