import { PaginatedResponseType, ResponseType, UserType } from "@/@core/types";
import { getAxios } from "@/configs/axios";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/schemas/UserSchema";

const getUsers = async (page = 1): Promise<PaginatedResponseType<UserType>> => {
  const response = await getAxios().get("/users", { params: { page } });
  return response.data;
};

const getUserById = async (id: string): Promise<ResponseType<UserType>> => {
  const response = await getAxios().get(`/users/${id}`);
  return response.data;
};

const postUser = async (
  data: CreateUserPayload,
): Promise<ResponseType<UserType>> => {
  const response = await getAxios().post("/users", data);
  return response.data;
};

const updateUser = async (
  id: string,
  data: UpdateUserPayload,
): Promise<ResponseType<UserType>> => {
  const response = await getAxios().put(`/users/${id}`, data);
  return response.data;
};

const deleteUser = async (id: string): Promise<void> => {
  await getAxios().delete(`/users/${id}`);
};

const postFotoPerfil = async (
  id: string,
  foto: File,
): Promise<ResponseType<UserType>> => {
  const formData = new FormData();
  formData.append("foto_perfil", foto);

  const response = await getAxios().post(`/users/${id}/foto`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const deleteFotoPerfil = async (id: string): Promise<ResponseType<UserType>> => {
  const response = await getAxios().delete(`/users/${id}/foto`);
  return response.data;
};

export {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
  postFotoPerfil,
  deleteFotoPerfil,
};