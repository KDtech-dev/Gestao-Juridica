import { PaginatedResponseType, ResponseType, UserType } from "@/@core/types";
import { getAxios } from "@/configs/axios";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/schemas/UserSchema";

export type PermissionCatalogEntry = {
  name: string;
  group: string;
  group_label: string;
  action: string;
  action_label: string;
};

export type ProfileColorOptions = {
  colors: string[];
  used: string[];
};

const getAvailableProfileColors = async (
  scope: "profile" | "users",
  excludeUserId?: string,
): Promise<ProfileColorOptions> => {
  const response = await getAxios().get<{ data: ProfileColorOptions }>(
    scope === "profile" ? "/profile/available-colors" : "/users/available-colors",
    { params: excludeUserId ? { exclude_user_id: excludeUserId } : undefined },
  );
  return response.data.data;
};

const getPermissionCatalog = async (): Promise<PermissionCatalogEntry[]> => {
  const response = await getAxios().get<{ data: PermissionCatalogEntry[] }>(
    "/access-control/permissions",
  );
  return response.data.data;
};

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

const resetUserPassword = async (
  id: string,
  data: { admin_password: string; new_password: string; new_password_confirmation: string },
): Promise<{ message: string }> => {
  const response = await getAxios().put(`/users/${id}/reset-password`, data);
  return response.data;
};

const syncUserPermissions = async (
  id: string,
  permissions: string[],
): Promise<string[]> => {
  const response = await getAxios().put(
    `/access-control/users/${id}/permissions`,
    { permissions },
  );
  return response.data.data.permissions.map(
    (permission: { name: string }) => permission.name,
  );
};

export {
  getPermissionCatalog,
  getAvailableProfileColors,
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
  postFotoPerfil,
  deleteFotoPerfil,
  resetUserPassword,
  syncUserPermissions,
};
