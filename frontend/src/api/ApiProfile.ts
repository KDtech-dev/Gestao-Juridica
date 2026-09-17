import type { ResponseType, UserType } from "@/@core/types";
import { getAxios } from "@/configs/axios";
import type { UpdateUserPayload } from "@/schemas/UserSchema";

type ProfileResponse = ResponseType<{ user: UserType }>;

export async function getOwnProfile() {
  const { data } = await getAxios().get<ProfileResponse>("/profile");
  return data.data.user;
}

export async function updateOwnProfile(
  payload: Omit<
    UpdateUserPayload,
    "role" | "password" | "password_confirmation"
  >,
) {
  const { data } = await getAxios().put<ProfileResponse>("/profile", payload);
  return data.data.user;
}

export async function uploadOwnProfilePhoto(photo: File) {
  const formData = new FormData();
  formData.append("foto_perfil", photo);
  const { data } = await getAxios({
    contentType: "formData",
  }).post<ProfileResponse>("/profile/foto", formData);
  return data.data.user;
}
