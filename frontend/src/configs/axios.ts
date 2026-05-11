import axios, { AxiosInstance } from "axios";
import auth from "./auth";
import { getPublicApiOrigin } from "./apiUrl";

const envUrl = getPublicApiOrigin();
let API_BASE_URL: string;

if (typeof window === "undefined") {
  // server-side: keep a sensible default for SSR/fetch during development
  API_BASE_URL = envUrl
    ? `${envUrl.replace(/\/$/, "")}/api`
    : "http://127.0.0.1:8000/api";
} else {
  // client-side: prefer relative '/api' prefix when no public API URL is configured
  // ensures axios requests map to Next rewrites -> backend
  API_BASE_URL = envUrl ? `${envUrl.replace(/\/$/, "")}/api` : "/api";
}

export const authStorage = {
  get(): string | null {
    return localStorage.getItem(auth.storageTokenKeyName);
  },
  set(token: string | null): void {
    if (token) {
      localStorage.setItem(auth.storageTokenKeyName, token);
    } else {
      localStorage.removeItem(auth.storageTokenKeyName);
    }
  },
};

type AxiosOpts = {
  contentType?:
    | "application/json"
    | "multipart/form-data"
    | "formData"
    | string;
  timeoutMs?: number;
};

export const getAxios = ({
  contentType,
  timeoutMs,
}: AxiosOpts = {}): AxiosInstance => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (contentType) {
    headers["Content-Type"] =
      contentType === "formData" ? "multipart/form-data" : contentType;
  }

  // Identify requests as XHR and allow cookies to be sent for stateful auth (Sanctum)
  headers["X-Requested-With"] = "XMLHttpRequest";

  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: typeof timeoutMs === "number" ? timeoutMs : 10000,
    headers,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    const token = authStorage.get();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authStorage.set(null);
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export default getAxios();
