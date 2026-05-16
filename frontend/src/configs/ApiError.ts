import { AxiosError } from "axios";
import {
  getSafePayloadErrorMessage,
  sanitizeApiErrorMessage,
} from "@/utils/safeErrorMessage";

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

export function getApiErrorMessage(error: unknown): string {
  const fallbackMessage = "Erro na requisição";

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;

    return getSafePayloadErrorMessage(data, fallbackMessage);
  }

  if (error instanceof Error) {
    return sanitizeApiErrorMessage(error.message, fallbackMessage);
  }

  return "Erro inesperado";
}
