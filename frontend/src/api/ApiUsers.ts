import { PaginatedResponseType, UserType } from "@/@core/types";
import { getAxios } from "@/configs/axios";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/schemas/UserSchema";

const getUsers = async (page = 1): Promise<PaginatedResponseType<UserType>> => {
  const response = await getAxios().get("/users", { params: { page } });
  return response.data;
};

const getUserById = async (id: string): Promise<UserType> => {
  const response = await getAxios().get(`/users/${id}`);
  return response.data;
};

const postUser = async (data: CreateUserPayload): Promise<UserType> => {
  const response = await getAxios().post("/users", data);
  return response.data.data;
};

const updateUser = async (
  id: string,
  data: UpdateUserPayload,
): Promise<UserType> => {
  const response = await getAxios().put(`/users/${id}`, data);
  return response.data.data;
};

const deleteUser = async (id: string): Promise<void> => {
  await getAxios().delete(`/users/${id}`);
};

export { getUsers, getUserById, postUser, updateUser, deleteUser };
