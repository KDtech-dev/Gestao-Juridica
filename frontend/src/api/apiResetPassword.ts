import {
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ForgotPasswordResponse,
} from "@/@core/types";

import { getAxios } from "@/configs/axios";

const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  const response = await getAxios().post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    payload,
  );

  return response.data;
};

const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  const response = await getAxios().post<ForgotPasswordResponse>(
    "/auth/reset-password",
    payload,
  );

  return response.data;
};

export { forgotPassword, resetPassword };
