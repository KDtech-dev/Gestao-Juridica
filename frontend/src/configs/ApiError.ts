import { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string>;
};

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;

    return (
      data?.message ||
      Object.values(data?.errors || {})[0] ||
      "Erro na requisição"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro inesperado";
}
