import { getApiErrorMessage } from "@/configs/ApiError";

export type ToastSeverity = "success" | "error" | "info" | "warning";

export type ToastMessage = {
  id: string;
  message: string;
  severity: ToastSeverity;
  autoHideDuration?: number;
};

type ToastOptions = {
  autoHideDuration?: number;
};

type ToastListener = (message: ToastMessage) => void;

const listeners = new Set<ToastListener>();

function emitToast(
  severity: ToastSeverity,
  message: string,
  options?: ToastOptions,
) {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) return;

  const toastMessage: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message: normalizedMessage,
    severity,
    autoHideDuration: options?.autoHideDuration,
  };

  listeners.forEach((listener) => listener(toastMessage));
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    emitToast("success", message, options),
  error: (message: string, options?: ToastOptions) =>
    emitToast("error", message, options),
  info: (message: string, options?: ToastOptions) =>
    emitToast("info", message, options),
  warning: (message: string, options?: ToastOptions) =>
    emitToast("warning", message, options),
};

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function formatToastErrorMessage(
  error: unknown,
  fallbackMessage = "Erro inesperado. Tente novamente.",
) {
  const message = typeof error === "string" ? error : getApiErrorMessage(error);

  return message || fallbackMessage;
}
