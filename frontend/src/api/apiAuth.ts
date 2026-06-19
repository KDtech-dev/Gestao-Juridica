import { getAxios } from "@/configs/axios";
import auth from "@/configs/auth";
import { buildLoginPayload } from "@/utils/auth";
import { LoginInput } from "@/schemas/LoginSchema";

export const postLogin = async (input: LoginInput) => {
  const payload = buildLoginPayload(input.identifier, input.password);

  const response = await getAxios().post(auth.loginEndpoint, payload);
  const result = response.data?.data ?? response.data;

  return result;
};
