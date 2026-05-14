"use client";

import { authStorage } from "@/configs/axios";
import type {
  AtualizarPublicacaoPayload,
  DeletePublicacaoResponse,
  PublicacaoItem,
  PublicacaoPayload,
} from "./types";

const getHeaders = () => {
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token = authStorage.get();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...getHeaders(),
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | T
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : null;

    throw new Error(
      typeof message === "string" ? message : "Erro ao salvar publicação.",
    );
  }

  return payload as T;
};

export const criarPublicacaoClient = (payload: PublicacaoPayload) =>
  requestJson<PublicacaoItem>("/api/publicacoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listarPublicacoesClient = () =>
  requestJson<PublicacaoItem[]>("/api/publicacoes");

export const buscarPublicacaoClient = (id: string) =>
  requestJson<PublicacaoItem>(`/api/publicacoes/${id}`);

export const atualizarPublicacaoClient = (
  id: string,
  payload: AtualizarPublicacaoPayload,
) =>
  requestJson<PublicacaoItem>(`/api/publicacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deletarPublicacaoClient = (id: string) =>
  requestJson<DeletePublicacaoResponse>(`/api/publicacoes/${id}`, {
    method: "DELETE",
  });
