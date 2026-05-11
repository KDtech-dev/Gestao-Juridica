import axios from "axios";
import { getPublicApiOrigin } from "@/configs/apiUrl";

const baseURL = getPublicApiOrigin();

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export type Client = {
  id?: number | string;
  name: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  status?: "Ativo" | "Inativo" | "Prospect";
  slug?: string;
};

export async function listClients(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const res = await api.get("/api/clients", { params });
  return res.data;
}

export async function getClient(id: number | string) {
  const res = await api.get(`/api/clients/${id}`);
  return res.data;
}

export async function createClient(payload: Partial<Client>) {
  const res = await api.post("/api/clients", payload);
  return res.data;
}

export async function updateClient(
  id: number | string,
  payload: Partial<Client>,
) {
  const res = await api.put(`/api/clients/${id}`, payload);
  return res.data;
}

export async function deleteClient(id: number | string) {
  const res = await api.delete(`/api/clients/${id}`);
  return res.data;
}

export default {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};
