"use client";

import { getAxios } from "@/configs/axios";

const api = getAxios();

export type NotificationKind = "mencao" | "tarefa" | "sistema" | "aviso";

export type NotificacaoApi = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type: NotificationKind;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asOptionalString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function mapNotificationKind(tipo: string | null): NotificationKind {
  if (tipo === "COMPROMISSO_HOJE" || tipo === "COMPROMISSO_SEMANA") {
    return "aviso";
  }

  if (tipo === "COMPROMISSO_CRIADO") {
    return "tarefa";
  }

  return "sistema";
}

function normalizeNotificacao(raw: unknown): NotificacaoApi {
  const obj = asRecord(raw);
  const tipo = asOptionalString(obj.tipo);

  return {
    id: asOptionalString(obj.id) ?? `n${Date.now()}`,
    title: asOptionalString(obj.titulo) ?? "Notificação",
    description: asOptionalString(obj.mensagem) ?? "",
    createdAt: asOptionalString(obj.created_at) ?? new Date().toISOString(),
    read: Boolean(obj.lida_em),
    type: mapNotificationKind(tipo),
  };
}

function normalizeList(raw: unknown): NotificacaoApi[] {
  const obj = asRecord(raw);
  const items = Array.isArray(obj.data)
    ? obj.data
    : Array.isArray(raw)
      ? raw
      : [];

  return items.map(normalizeNotificacao);
}

export async function listNotificacoes() {
  const res = await api.get("/notificacoes");

  return normalizeList(res.data);
}

export async function markNotificacaoAsRead(id: string) {
  await api.patch(`/notificacoes/${id}/lida`);
}

export async function markAllNotificacoesAsRead() {
  await api.patch("/notificacoes/lidas");
}

export async function clearNotificacoes() {
  await api.delete("/notificacoes");
}
